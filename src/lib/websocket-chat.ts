// WebSocket Live Chat — Real-time messaging
// Server: ws://localhost:4000/chat?userId=xxx
// Client: WebSocket connection + auto-reconnect

import { sendChatMessage, getChatMessages } from "./store";
import { toast } from "sonner";

type WSChatHandler = {
  onMessage?: (msg: any) => void;
  onTyping?: (data: { roomId: string; userId: string }) => void;
  onPresence?: (data: { userId: string; online: boolean }) => void;
  onStatus?: (data: { msgId: string; status: string }) => void;
};

type WSChatClient = {
  send: (data: any) => void;
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
  sendTyping: (roomId: string) => void;
  disconnect: () => void;
  isConnected: () => boolean;
};

const RECONNECT_DELAYS = [1000, 2000, 5000, 10000, 30000];

let wsInstance: WebSocket | null = null;
let currentUserId: string | null = null;
let currentHandlers: WSChatHandler = {};
let pendingMessages: any[] = [];
let reconnectAttempt = 0;
let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
let isConnecting = false;
let heartbeatInterval: ReturnType<typeof setInterval> | null = null;

export function connectWebSocket(userId: string, handlers: WSChatHandler = {}): WSChatClient {
  currentUserId = userId;
  currentHandlers = handlers;

  if (wsInstance?.readyState === WebSocket.OPEN) {
    return createClient();
  }

  isConnecting = true;

  const serverUrl = import.meta.env.VITE_WS_URL || `ws://${window.location.hostname}:4000/chat`;

  try {
    wsInstance = new WebSocket(`${serverUrl}?userId=${userId}`);

    wsInstance.onopen = () => {
      isConnecting = false;
      reconnectAttempt = 0;
      console.log("WebSocket connected");

      // Send pending messages
      while (pendingMessages.length > 0) {
        const msg = pendingMessages.shift();
        wsInstance?.send(JSON.stringify(msg));
      }

      // Start heartbeat
      if (heartbeatInterval) clearInterval(heartbeatInterval);
      heartbeatInterval = setInterval(() => {
        if (wsInstance?.readyState === WebSocket.OPEN) {
          wsInstance.send(JSON.stringify({ type: "ping" }));
        }
      }, 30000);
    };

    wsInstance.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handleIncomingMessage(data);
      } catch (e) {
        console.warn("WS parse error:", e);
      }
    };

    wsInstance.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    wsInstance.onclose = () => {
      isConnecting = false;
      if (heartbeatInterval) clearInterval(heartbeatInterval);
      attemptReconnect();
    };
  } catch (e) {
    isConnecting = false;
    console.error("WebSocket connection failed:", e);
  }

  return createClient();
}

function createClient(): WSChatClient {
  return {
    send: (data: any) => {
      if (wsInstance?.readyState === WebSocket.OPEN) {
        wsInstance.send(JSON.stringify(data));
      } else {
        pendingMessages.push(data);
      }
    },
    joinRoom: (roomId: string) => {
      if (wsInstance?.readyState === WebSocket.OPEN) {
        wsInstance.send(JSON.stringify({ type: "join_room", roomId }));
      }
    },
    leaveRoom: (roomId: string) => {
      if (wsInstance?.readyState === WebSocket.OPEN) {
        wsInstance.send(JSON.stringify({ type: "leave_room", roomId }));
      }
    },
    sendTyping: (roomId: string) => {
      if (wsInstance?.readyState === WebSocket.OPEN) {
        wsInstance.send(JSON.stringify({ type: "typing", roomId, userId: currentUserId }));
      }
    },
    disconnect: () => {
      if (wsInstance) {
        wsInstance.close();
        wsInstance = null;
      }
      if (heartbeatInterval) clearInterval(heartbeatInterval);
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    },
    isConnected: () => wsInstance?.readyState === WebSocket.OPEN,
  };
}

function handleIncomingMessage(data: any) {
  switch (data.type) {
    case "message":
      // Save to local store
      if (data.msg) {
        const msg = data.msg;
        sendChatMessage(
          msg.roomId,
          msg.senderId,
          msg.text,
          { type: msg.type, image: msg.image, offerPrice: msg.offerPrice, offerQty: msg.offerQty },
        );
        toast.info(`Pesan baru: ${msg.text.slice(0, 50)}${msg.text.length > 50 ? "..." : ""}`);
      }
      currentHandlers.onMessage?.(data.msg);
      break;

    case "typing":
      currentHandlers.onTyping?.(data);
      break;

    case "presence":
      currentHandlers.onPresence?.(data);
      break;

    case "status":
      currentHandlers.onStatus?.(data);
      break;

    case "pong":
      // Heartbeat response, ignore
      break;

    default:
      console.log("WS unknown message:", data);
  }
}

function attemptReconnect() {
  if (reconnectTimeout) clearTimeout(reconnectTimeout);

  if (reconnectAttempt >= RECONNECT_DELAYS.length) {
    console.error("WebSocket max reconnection attempts reached");
    return;
  }

  const delay = RECONNECT_DELAYS[reconnectAttempt];
  console.log(`WebSocket reconnecting in ${delay}ms (attempt ${reconnectAttempt + 1})`);

  reconnectTimeout = setTimeout(() => {
    reconnectAttempt++;
    if (currentUserId) {
      connectWebSocket(currentUserId, currentHandlers);
    }
  }, delay);
}

export function disconnectWebSocket() {
  if (wsInstance) {
    wsInstance.close();
    wsInstance = null;
  }
  if (heartbeatInterval) clearInterval(heartbeatInterval);
  if (reconnectTimeout) clearTimeout(reconnectTimeout);
  reconnectAttempt = 0;
  pendingMessages = [];
}