import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import {
  ArrowLeft,
  Phone,
  Camera,
  Send,
  DollarSign,
  CheckCircle2,
  XCircle,
  Sparkles,
} from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { useSession } from "@/hooks/use-session";
import { useStoreSubscription } from "@/hooks/use-store";
import {
  getChatRooms,
  getRoomMessages,
  getUsers,
  getProducts,
  sendChatMessage,
  markRoomAsRead,
  respondToOffer,
  addNegotiatedToCart,
  MIN_ORDER_QTY,
  type ChatMessage,
} from "@/lib/store";
import { ShoppingCart } from "lucide-react";
import { rupiah } from "@/lib/format";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/chat/$roomId")({
  component: ChatDetailPage,
});

function ChatDetailPage() {
  const { roomId } = Route.useParams();
  const router = useRouter();
  const navigate = useNavigate();
  const session = useSession();
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Subscribe ke nilai yang lebih sempit agar render lebih ringan.
  const room = useStoreSubscription(() => getChatRooms().find((r) => r.id === roomId));
  const allMessages = useStoreSubscription(() => getRoomMessages(roomId));
  const partnerId = room
    ? session?.role === "farmer"
      ? room.buyerId
      : room.farmerId
    : undefined;
  const partner = useStoreSubscription(() =>
    partnerId ? getUsers().find((u) => u.id === partnerId) : undefined,
  );

  const [text, setText] = useState("");
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerPrice, setOfferPrice] = useState("");
  const [offerQty, setOfferQty] = useState(String(MIN_ORDER_QTY));
  const [showAiHelp, setShowAiHelp] = useState(false);

  // Auto-mark as read
  useEffect(() => {
    if (session && room) {
      const role = session.role === "farmer" ? "farmer" : "buyer";
      markRoomAsRead(roomId, role);
    }
  }, [roomId, session, room]);

  // Auto-scroll ke pesan terakhir saja saat jumlah pesan berubah.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    // gunakan scroll instan agar tidak berat di HP murah
    el.scrollTop = el.scrollHeight;
  }, [allMessages.length]);

  // Auto-focus input sekali saat masuk room (bukan setiap render).
  useEffect(() => {
    inputRef.current?.focus();
  }, [roomId]);

  if (!session) {
    return (
      <MobileShell>
        <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
          <p className="text-6xl">💬</p>
          <h2 className="mt-3 text-xl font-bold">Silakan Masuk</h2>
          <button
            onClick={() => navigate({ to: "/masuk", search: { redirect: `/chat/${roomId}` } })}
            className="mt-5 h-14 rounded-xl bg-primary px-8 text-base font-bold text-primary-foreground"
          >
            Masuk
          </button>
        </div>
      </MobileShell>
    );
  }

  if (!room) {
    return (
      <MobileShell>
        <header className="sticky top-0 z-30 flex items-center gap-2 bg-primary px-2 py-3 text-primary-foreground">
          <button onClick={() => router.history.back()} className="rounded-full p-2 hover:bg-white/15">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-bold">Percakapan</h1>
        </header>
        <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
          <p className="text-6xl">🥲</p>
          <h2 className="mt-3 text-xl font-bold">Percakapan tidak ditemukan</h2>
          <Link to="/chat" className="mt-5 rounded-xl bg-primary px-6 py-3 font-bold text-primary-foreground">
            Ke Daftar Pesan
          </Link>
        </div>
      </MobileShell>
    );
  }

  const isBuyer = session.role === "buyer";

  // Handler tambah ke keranjang dari hasil tawar-menawar yang disepakati.
  const handleAddOfferToCart = (msg: ChatMessage) => {
    if (!room) return;
    // Hanya pembeli yang punya keranjang. Tentukan dari room.buyerId.
    if (session.id !== room.buyerId) {
      toast.info("Hanya pembeli yang bisa menambahkan ke keranjang");
      return;
    }
    if (!room.productId) {
      toast.error("Tawaran tidak terkait produk. Buka produk dulu lalu chat.");
      return;
    }
    const product = getProducts().find((p) => p.id === room.productId);
    if (!product) {
      toast.error("Produk tidak ditemukan");
      return;
    }
    const qty = Math.max(MIN_ORDER_QTY, msg.offerQty ?? MIN_ORDER_QTY);
    const price = msg.offerPrice ?? product.price;
    addNegotiatedToCart(session.id, product.id, qty, price, msg.id);
    respondToOffer(msg.id, "added");
    toast.success("Ditambahkan ke keranjang", {
      description: `${qty} ${product.unit} ${product.name} @ ${rupiah(price)}`,
    });
  };

  const handleSend = () => {
    if (!text.trim()) return;
    sendChatMessage(roomId, session.id, text.trim());
    setText("");
  };

  const handleSendImage = async (file?: File | null) => {
    if (!file) return;
    try {
      const dataUrl = await fileToCompressedDataURL(file);
      sendChatMessage(roomId, session.id, "Mengirim foto", { type: "image", image: dataUrl });
      toast.success("Foto terkirim");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal mengirim foto");
    }
  };

  const handleSendOffer = () => {
    const price = Number(offerPrice);
    const qty = Number(offerQty);
    if (!Number.isFinite(price) || price <= 0) {
      toast.error("Harga tidak valid");
      return;
    }
    if (!Number.isFinite(qty) || qty < MIN_ORDER_QTY) {
      toast.error(`Minimal pemesanan ${MIN_ORDER_QTY} unit`);
      return;
    }
    sendChatMessage(roomId, session.id, `Tawaran: ${qty} unit @ ${rupiah(price)}`, {
      type: "offer",
      offerPrice: price,
      offerQty: qty,
    });
    setShowOfferModal(false);
    setOfferPrice("");
    setOfferQty(String(MIN_ORDER_QTY));
    toast.success("Tawaran terkirim");
  };

  const handleCall = () => {
    const phone = partner?.phone;
    if (phone && phone !== "-" && phone.length >= 6) {
      // Bersihkan: hilangkan spasi/strip dan paksa awalan internasional jika diawali 0.
      const cleaned = phone.replace(/[^\d+]/g, "");
      window.location.href = `tel:${cleaned}`;
    } else {
      toast.info("Nomor telepon mitra belum tersedia");
    }
  };

  // Tampilan no HP yang dimaskir tipis untuk privasi.
  const partnerPhoneDisplay = partner?.phone && partner.phone !== "-" ? partner.phone : null;

  const aiSuggestions = [
    { label: "Harga pasar cabai hari ini", text: "Harga cabai merah di pasar lokal hari ini sekitar Rp42.000–48.000/kg. Apakah Bapak/Ibu punya stok segar?" },
    { label: 'Terjemahan: "Bagaimana kualitasnya?"', text: "Bagaimana kualitas hasil panennya? Apakah masih segar?" },
    { label: "Tips negosiasi", text: "Saya tertarik membeli dalam jumlah banyak. Bolehkah mendapat harga khusus untuk pembelian grosir?" },
  ];

  return (
    <MobileShell hideNav>
      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-border bg-primary px-2 py-3 text-primary-foreground">
        <button onClick={() => router.history.back()} className="rounded-full p-2 hover:bg-white/15">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20 text-lg">
          {partner?.avatar ? (
            <img src={partner.avatar} alt={partner.name} className="h-full w-full rounded-full object-cover" />
          ) : (
            <span>{partner?.role === "farmer" ? "👨‍🌾" : "🙂"}</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-bold">{partner?.name ?? "Pengguna"}</p>
          <p className="truncate text-xs opacity-90">
            {partner?.role === "farmer"
              ? (partner.farmName ?? "Petani")
              : "Pembeli"}
            {partnerPhoneDisplay ? ` · ${partnerPhoneDisplay}` : ""}
          </p>
        </div>
        <button
          onClick={handleCall}
          disabled={!partnerPhoneDisplay}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 hover:bg-white/30"
          aria-label="Telepon"
        >
          <Phone className="h-5 w-5" />
        </button>
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto bg-muted/40 p-3 pb-40">
        {allMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-4xl">💬</p>
            <p className="mt-2 text-sm text-muted-foreground">Mulai percakapan dengan {partner?.name}</p>
            {room.productName && (
              <p className="mt-1 text-sm font-semibold text-primary">Tentang: {room.productName}</p>
            )}
          </div>
        )}

        <MessageList
          messages={allMessages}
          myId={session.id}
          isBuyer={isBuyer}
          canAddToCart={room.buyerId === session.id && !!room.productId}
          onAddToCart={handleAddOfferToCart}
        />
      </div>

      {/* AI Helper */}
      {showAiHelp && (
        <div className="fixed right-3 bottom-36 z-30 w-72 rounded-2xl border border-border bg-card p-3 shadow-xl">
          <div className="mb-2 flex items-center justify-between">
            <p className="flex items-center gap-1.5 text-sm font-bold text-primary">
              <Sparkles className="h-4 w-4" /> AI Asisten
            </p>
            <button onClick={() => setShowAiHelp(false)} className="rounded-full p-1 hover:bg-muted">
              <XCircle className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-2">
            {aiSuggestions.map((s) => (
              <button
                key={s.label}
                onClick={() => {
                  setText(s.text);
                  setShowAiHelp(false);
                }}
                className="w-full rounded-xl bg-primary-soft p-2.5 text-left text-sm transition-colors hover:bg-primary/10"
              >
                <p className="font-semibold text-primary">{s.label}</p>
                <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{s.text}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Offer Modal */}
      {showOfferModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center">
          <div className="w-full max-w-sm rounded-2xl bg-card p-5 shadow-xl">
            <h3 className="text-lg font-bold">Tawar Harga</h3>
            <p className="mt-1 text-sm text-muted-foreground">Ajukan harga dan jumlah yang diinginkan</p>
            <div className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-sm font-bold">Harga per Unit (Rp)</label>
                <input
                  type="number"
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(e.target.value)}
                  placeholder="Contoh: 10000"
                  className="h-14 w-full rounded-xl border-2 border-border bg-background px-4 text-lg font-semibold outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-bold">Jumlah</label>
                <input
                  type="number"
                  value={offerQty}
                  onChange={(e) => setOfferQty(e.target.value)}
                  min={MIN_ORDER_QTY}
                  className="h-14 w-full rounded-xl border-2 border-border bg-background px-4 text-lg font-semibold outline-none focus:border-primary"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Minimal pemesanan {MIN_ORDER_QTY} unit
                </p>
              </div>
              <div className="rounded-xl bg-primary-soft p-3 text-center">
                <p className="text-sm text-muted-foreground">Total Tawaran</p>
                <p className="text-xl font-extrabold text-primary">
                  {rupiah((Number(offerPrice) || 0) * (Number(offerQty) || 0))}
                </p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setShowOfferModal(false)}
                className="h-14 flex-1 rounded-xl border-2 border-border text-base font-bold"
              >
                Batal
              </button>
              <button
                onClick={handleSendOffer}
                className="h-14 flex-1 rounded-xl bg-primary text-base font-bold text-primary-foreground"
              >
                Kirim Tawaran
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Input Area */}
      <div
        className="fixed bottom-0 left-1/2 z-40 w-full max-w-md -translate-x-1/2 border-t border-border bg-card"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 0.5rem)" }}
      >
        {/* Quick Actions */}
        <div className="flex gap-2 border-b border-border p-2">
          <button
            onClick={() => fileRef.current?.click()}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary-soft py-2.5 text-sm font-bold text-primary"
          >
            <Camera className="h-4 w-4" /> Foto
          </button>
          <button
            onClick={() => setShowOfferModal(true)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary-soft py-2.5 text-sm font-bold text-primary"
          >
            <DollarSign className="h-4 w-4" /> Tawar
          </button>
          <button
            onClick={() => setShowAiHelp(!showAiHelp)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary-soft py-2.5 text-sm font-bold text-primary"
          >
            <Sparkles className="h-4 w-4" /> AI Bantu
          </button>
          <button
            onClick={handleCall}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary-soft py-2.5 text-sm font-bold text-primary"
          >
            <Phone className="h-4 w-4" /> Telepon
          </button>
        </div>

        {/* Text Input */}
        <div className="flex items-center gap-2 p-2">
          <input
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ketik pesan..."
            className="h-12 flex-1 rounded-xl border-2 border-border bg-background px-4 text-base outline-none focus:border-primary"
          />
          <button
            onClick={handleSend}
            disabled={!text.trim()}
            className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground disabled:opacity-40"
            aria-label="Kirim"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => handleSendImage(e.target.files?.[0])}
        />
      </div>
    </MobileShell>
  );
}

// Daftar pesan dipisah & dimemoize agar perubahan state lain (input, modal)
// tidak memicu render ulang seluruh balon pesan.
const MessageList = memo(function MessageList({
  messages,
  myId,
  isBuyer,
  canAddToCart,
  onAddToCart,
}: {
  messages: ChatMessage[];
  myId: string;
  isBuyer: boolean;
  canAddToCart: boolean;
  onAddToCart: (msg: ChatMessage) => void;
}) {
  // batasi render ke 200 pesan terbaru — lebih ringan di HP lama
  const visible = useMemo(() => messages.slice(-200), [messages]);
  return (
    <div className="space-y-3">
      {visible.map((msg, idx) => (
        <MessageBubble
          key={msg.id}
          msg={msg}
          isMe={msg.senderId === myId}
          showDate={idx === 0 || isNewDay(visible[idx - 1].createdAt, msg.createdAt)}
          isBuyer={isBuyer}
          canAddToCart={canAddToCart}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  );
});

const MessageBubble = memo(function MessageBubble({
  msg,
  isMe,
  showDate,
  isBuyer,
  canAddToCart,
  onAddToCart,
}: {
  msg: ChatMessage;
  isMe: boolean;
  showDate: boolean;
  isBuyer: boolean;
  canAddToCart: boolean;
  onAddToCart: (msg: ChatMessage) => void;
}) {
  void isBuyer;
  const time = new Date(msg.createdAt).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
      {showDate && (
        <div className="my-2 self-center rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
          {formatDateDivider(msg.createdAt)}
        </div>
      )}
      <div className={`max-w-[80%] ${isMe ? "rounded-2xl rounded-tr-sm" : "rounded-2xl rounded-tl-sm"} overflow-hidden`}>
        {msg.type === "image" && msg.image && (
          <img src={msg.image} alt="Foto" className="max-h-64 w-full object-cover" loading="lazy" />
        )}

        {msg.type === "offer" ? (
          <div className={`p-4 ${isMe ? "bg-primary text-primary-foreground" : "bg-card border border-border"}`}>
            <p className="flex items-center gap-1.5 text-sm font-bold">
              <DollarSign className="h-4 w-4" /> Tawaran Harga
            </p>
            <p className="mt-2 text-2xl font-extrabold">
              {rupiah(msg.offerPrice ?? 0)} <span className="text-sm font-medium opacity-80">/{msg.offerQty} unit</span>
            </p>
            <p className="mt-1 text-sm opacity-80">
              Total: {rupiah((msg.offerPrice ?? 0) * (msg.offerQty ?? 1))}
            </p>
            {msg.offerStatus === "pending" && !isMe && (
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => respondToOffer(msg.id, "accepted")}
                  className="flex h-10 flex-1 items-center justify-center gap-1 rounded-xl bg-white/20 text-sm font-bold"
                >
                  <CheckCircle2 className="h-4 w-4" /> Terima
                </button>
                <button
                  onClick={() => respondToOffer(msg.id, "rejected")}
                  className="flex h-10 flex-1 items-center justify-center gap-1 rounded-xl border border-white/30 text-sm font-bold"
                >
                  <XCircle className="h-4 w-4" /> Tolak
                </button>
              </div>
            )}
            {msg.offerStatus && msg.offerStatus !== "pending" && (
              <p
                className={`mt-2 text-sm font-bold ${
                  msg.offerStatus === "rejected"
                    ? isMe ? "text-red-200" : "text-danger"
                    : isMe ? "text-green-200" : "text-success"
                }`}
              >
                {msg.offerStatus === "accepted" && "✓ Diterima"}
                {msg.offerStatus === "added" && "🛒 Sudah masuk keranjang"}
                {msg.offerStatus === "rejected" && "✗ Ditolak"}
              </p>
            )}
            {msg.offerStatus === "accepted" && canAddToCart && (
              <button
                onClick={() => onAddToCart(msg)}
                className={`mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold ${
                  isMe ? "bg-white text-primary" : "bg-primary text-primary-foreground"
                }`}
              >
                <ShoppingCart className="h-4 w-4" /> Masukkan ke Keranjang ({rupiah((msg.offerPrice ?? 0) * (msg.offerQty ?? 0))})
              </button>
            )}
          </div>
        ) : (
          <div className={`p-3 ${isMe ? "bg-primary text-primary-foreground" : "bg-card border border-border"}`}>
            {msg.text && <p className="text-base leading-relaxed whitespace-pre-wrap">{msg.text}</p>}
          </div>
        )}
      </div>
      <span className={`mt-1 text-[11px] text-muted-foreground ${isMe ? "text-right" : ""}`}>{time}</span>
    </div>
  );
});

function formatDateDivider(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) return "Hari ini";
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "Kemarin";
  return d.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" });
}

function isNewDay(a: string, b: string): boolean {
  return new Date(a).toDateString() !== new Date(b).toDateString();
}

// Reuse compression helper from ImagePicker
async function fileToCompressedDataURL(file: File): Promise<string> {
  const MAX_DIMENSION = 1024;
  const MAX_BYTES = 500_000;
  if (!file.type.startsWith("image/")) throw new Error("File harus berupa gambar");
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result as string);
    fr.onerror = () => reject(new Error("Gagal membaca file"));
    fr.readAsDataURL(file);
  });
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = () => reject(new Error("Gambar tidak valid"));
    i.src = dataUrl;
  });
  let { width, height } = img;
  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas tidak didukung");
  ctx.drawImage(img, 0, 0, width, height);
  let quality = 0.8;
  let out = canvas.toDataURL("image/jpeg", quality);
  while (out.length > MAX_BYTES && quality > 0.4) {
    quality -= 0.1;
    out = canvas.toDataURL("image/jpeg", quality);
  }
  return out;
}
