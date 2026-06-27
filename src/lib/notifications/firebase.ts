// Firebase Cloud Messaging — Push Notification
// Setup: npm install firebase
// Buat project di https://console.firebase.google.com

// Firebase Cloud Messaging — Push Notification
// Setup: npm install firebase
// Buat project di https://console.firebase.google.com

export async function requestNotificationPermission(): Promise<string | null> {
  if (!("Notification" in window)) {
    console.warn("Browser tidak mendukung notification");
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const token = `notif_token_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      localStorage.setItem("panenku.fcm_token", token);
      return token;
    }
  } catch (error) {
    console.error("Notification permission denied:", error);
  }
  return null;
}

export function setupNotificationListener(onMessageCallback: (payload: any) => void) {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.addEventListener("message", (event: any) => {
      onMessageCallback(event.data);
    });
  }
}

export function getSavedToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("panenku.fcm_token");
}

export function showLocalNotification(title: string, options?: NotificationOptions) {
  if ("Notification" in window && Notification.permission === "granted") {
    try {
      new Notification(title, {
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        ...options,
      });
    } catch (error) {
      console.warn("Notification blocked:", error);
    }
  }
}
