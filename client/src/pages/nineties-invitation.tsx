import { useState, useEffect, useRef, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Invitation, Wedding } from "@shared/schema";

type InvitationWithWedding = Invitation & { wedding: Wedding };

/* ─── VCR noise canvas ───────────────────────────────────────────────────── */
function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (Math.floor(max) - Math.ceil(min) + 1)) + Math.ceil(min);
}
function renderTail(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  const n = randInt(1, 50);
  const dir = Math.random() > 0.5 ? 1 : -1;
  for (let i = 0; i < n; i++) {
    const rad = Math.max(0, randInt(Math.max(0, r - 0.01), r));
    const dx = randInt(1, 4) * dir;
    r -= 0.1;
    ctx.fillRect((x += dx), y, rad, rad);
    ctx.fill();
  }
}
function VCRCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const resize = () => {
      canvas.width = canvas.offsetWidth || window.innerWidth;
      canvas.height = canvas.offsetHeight || window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    let raf: number;
    const draw = () => {
      canvas.style.filter = "blur(1px)";
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#fff";
      let miny = 220, miny2 = 220;
      ctx.beginPath();
      for (let i = 0; i <= 70; i++) {
        const x = Math.random() * canvas.width;
        const y1 = randInt((miny += 3), canvas.height);
        const y2 = randInt(0, (miny2 -= 3));
        ctx.fillRect(x, y1, 2, 2);
        ctx.fillRect(x, y2, 2, 2);
        ctx.fill();
        renderTail(ctx, x, y1, 2);
        renderTail(ctx, x, y2, 2);
      }
      ctx.closePath();
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return (
    <canvas ref={ref} style={{
      mixBlendMode: "screen", position: "absolute",
      left: 0, top: 0, zIndex: 9,
      width: "100%", height: "100%", pointerEvents: "none",
    }} />
  );
}

/* ─── Flying Toasters (dentro de la TV) ─────────────────────────────────── */
const TOASTERS_DATA = Array.from({ length: 9 }, (_, i) => ({
  id: i, top: 5 + (i * 11) % 90, right: -5 - (i * 17) % 40,
  dur: 5 + (i * 0.7), delay: i * 0.6,
}));
const TOASTS_DATA = Array.from({ length: 4 }, (_, i) => ({
  id: i + 100, top: 15 + (i * 23) % 65, right: -15 - (i * 13) % 30,
  dur: 4 + (i * 0.9), delay: i * 1.2 + 0.3,
}));
function FlyingToasters({ coupleName }: { coupleName: string }) {
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", background: "#000", overflow: "hidden" }}>
      {TOASTERS_DATA.map((t) => (
        <div key={t.id} style={{
          position: "absolute", top: `${t.top}%`, right: `${t.right}%`,
          animation: `tv90-fly ${t.dur}s ${t.delay}s linear infinite`,
          display: "flex", alignItems: "center",
        }}>
          <div style={{ marginRight: -8, zIndex: 1, animation: "tv90-flapL 0.25s ease-in-out infinite", transformOrigin: "right center" }}>
            <svg viewBox="0 0 40 28" width="36" height="25">
              <ellipse cx="20" cy="14" rx="20" ry="10" fill="#C8C8C8" stroke="#999" strokeWidth="1"/>
              <ellipse cx="20" cy="14" rx="14" ry="7" fill="#E0E0E0"/>
            </svg>
          </div>
          <svg viewBox="0 0 64 50" width="56" height="44">
            <rect x="2" y="8" width="60" height="40" rx="6" fill="#BEBEBE" stroke="#707070" strokeWidth="2"/>
            <defs><linearGradient id={`tg${t.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFF" stopOpacity="0.4"/>
              <stop offset="100%" stopColor="#000" stopOpacity="0.1"/>
            </linearGradient></defs>
            <rect x="2" y="8" width="60" height="40" rx="6" fill={`url(#tg${t.id})`}/>
            <rect x="14" y="2" width="12" height="14" rx="2" fill="#707070" stroke="#505050" strokeWidth="1"/>
            <rect x="38" y="2" width="12" height="14" rx="2" fill="#707070" stroke="#505050" strokeWidth="1"/>
            <rect x="8" y="16" width="48" height="4" rx="2" fill="#909090"/>
            <circle cx="10" cy="38" r="4" fill="#C8A800" stroke="#907800" strokeWidth="1"/>
            <circle cx="10" cy="38" r="2" fill="#FFD700"/>
          </svg>
          <div style={{ marginLeft: -8, zIndex: 1, animation: "tv90-flapR 0.25s ease-in-out infinite", transformOrigin: "left center" }}>
            <svg viewBox="0 0 40 28" width="36" height="25">
              <ellipse cx="20" cy="14" rx="20" ry="10" fill="#C8C8C8" stroke="#999" strokeWidth="1"/>
              <ellipse cx="20" cy="14" rx="14" ry="7" fill="#E0E0E0"/>
            </svg>
          </div>
        </div>
      ))}
      {TOASTS_DATA.map((t) => (
        <div key={t.id} style={{
          position: "absolute", top: `${t.top}%`, right: `${t.right}%`,
          animation: `tv90-fly ${t.dur}s ${t.delay}s linear infinite`,
        }}>
          <svg viewBox="0 0 30 30" width="24" height="24">
            <rect x="2" y="2" width="26" height="26" rx="2" fill="#D4A843" stroke="#8B5A1A" strokeWidth="1.5"/>
            <rect x="5" y="5" width="20" height="3" rx="1" fill="#B8863A" opacity="0.7"/>
            <rect x="5" y="10" width="14" height="3" rx="1" fill="#B8863A" opacity="0.4"/>
          </svg>
        </div>
      ))}
      <div style={{
        position: "absolute", inset: 0, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        color: "white", textAlign: "center", pointerEvents: "none", fontFamily: "serif",
      }}>
        <p style={{ fontSize: "clamp(13px,2vw,20px)", fontWeight: "bold", textShadow: "0 0 20px #D4A843, 0 0 40px #D4A843", marginBottom: 8, fontStyle: "italic" }}>
          {coupleName}
        </p>
        <p style={{ fontSize: "clamp(9px,1.2vw,13px)", opacity: 0.6, letterSpacing: "0.15em" }}>CARGANDO TRANSMISIÓN...</p>
      </div>
    </div>
  );
}

/* ─── TV Intro wrapper ───────────────────────────────────────────────────── */
function TV90Intro({ wedding }: { wedding: Wedding }) {
  const videoId = wedding.videoType === "youtube" && wedding.videoUrl
    ? (wedding.videoUrl.includes("youtu.be/")
      ? wedding.videoUrl.split("youtu.be/")[1]?.split("?")[0]
      : wedding.videoUrl.split("v=")[1]?.split("&")[0])
    : null;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "#000", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
      <div style={{ position: "absolute", width: "90vw", height: "50vw", maxWidth: "100%", maxHeight: "100vh", backgroundImage: "url(https://alexandrevacassin.fr/codepen/old-tv/base.webp)", zIndex: 10, backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat", pointerEvents: "none" }} />
      <div style={{ position: "absolute", marginBottom: "3vw", width: "60vw", marginRight: "10vw", height: "45vw", maxWidth: "100%", maxHeight: "70vh", zIndex: 1, display: "flex", justifyContent: "center", alignItems: "center", overflow: "hidden" }}>
        <VCRCanvas />
        {videoId ? (
          <iframe title="wedding-video" style={{ width: "100%", height: "100%", border: "none", filter: "contrast(1.2) brightness(1.1)" }}
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&controls=0&loop=1&mute=1`}
            allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />
        ) : wedding.videoType === "mp4" && wedding.videoUrl ? (
          <video style={{ width: "100%", height: "100%", filter: "contrast(1.2) brightness(1.1)" }} autoPlay muted playsInline loop>
            <source src={wedding.videoUrl} type="video/mp4" />
          </video>
        ) : (
          <FlyingToasters coupleName={wedding.coupleName} />
        )}
        <div style={{ pointerEvents: "none", position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "url('https://upload.wikimedia.org/wikipedia/commons/0/02/Television_static.gif')", mixBlendMode: "multiply" as const, opacity: 0.3, animation: "tv90-glitch 0.2s infinite linear", zIndex: 2 }} />
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "repeating-linear-gradient(to bottom, rgba(0,0,0,0) 0px, rgba(0,0,0,0.2) 1px, rgba(0,0,0,0) 2px)", pointerEvents: "none", zIndex: 2 }} />
      </div>
    </div>
  );
}

/* ─── Decorative components ──────────────────────────────────────────────── */
function GoldDivider() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "24px 0", color: "#C9A84C" }}>
      <div style={{ flex: 1, height: 1, background: "linear-gradient(to right, transparent, #C9A84C)" }} />
      <span style={{ fontSize: 18, letterSpacing: 4 }}>✦ ✦ ✦</span>
      <div style={{ flex: 1, height: 1, background: "linear-gradient(to left, transparent, #C9A84C)" }} />
    </div>
  );
}
function VintageCard({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div style={{
      border: "1px solid #C9A84C40",
      background: "linear-gradient(135deg, #1A1000 0%, #0D0800 100%)",
      borderRadius: 2,
      overflow: "hidden",
      marginBottom: 20,
      boxShadow: "0 0 20px #C9A84C10, inset 0 0 40px rgba(0,0,0,0.5)",
    }}>
      <div style={{
        background: "linear-gradient(90deg, #1A0E00, #2D1A00, #1A0E00)",
        borderBottom: "1px solid #C9A84C50",
        padding: "10px 16px",
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <span style={{ fontSize: 16 }}>{icon}</span>
        <span style={{ color: "#C9A84C", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: "serif", fontWeight: "bold" }}>{title}</span>
        <div style={{ flex: 1 }} />
        <span style={{ color: "#C9A84C50", fontSize: 10, fontFamily: "monospace" }}>◈</span>
      </div>
      <div style={{ padding: "16px 20px", color: "#E8D5A0" }}>
        {children}
      </div>
    </div>
  );
}

/* ─── Main page ──────────────────────────────────────────────────────────── */
export default function NinetiesInvitationPage() {
  const { toast } = useToast();
  const [showIntro, setShowIntro] = useState(true);
  const [confirmedSeats, setConfirmedSeats] = useState(1);
  const [responded, setResponded] = useState(false);
  const [clock, setClock] = useState(new Date());

  const params = new URLSearchParams(window.location.search);
  const invitationId = params.get("id");
  const previewTemplate = params.get("preview");

  const { data, isLoading } = useQuery<InvitationWithWedding>({
    queryKey: previewTemplate ? ["/api/demo", previewTemplate] : ["/api/invitations", invitationId],
    queryFn: previewTemplate ? async () => { const r = await fetch(`/api/demo/${previewTemplate}`); return r.json(); } : undefined,
    enabled: previewTemplate ? true : !!invitationId,
  });

  const wedding = data?.wedding;
  const invitation = data;

  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (wedding) {
      const t = setTimeout(() => setShowIntro(false), wedding.introDuration || 6000);
      return () => clearTimeout(t);
    }
  }, [wedding]);

  const respondMutation = useMutation({
    mutationFn: async ({ status, confirmedSeats }: { status: string; confirmedSeats: number }) => {
      const res = await apiRequest("POST", `/api/invitations/${invitationId}/respond`, { status, confirmedSeats });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invitations", invitationId] });
      setResponded(true);
      toast({ title: "Respuesta enviada", description: "¡Gracias por confirmar!" });
    },
    onError: () => {
      toast({ title: "Error", description: "No se pudo enviar tu respuesta.", variant: "destructive" });
    },
  });

  const countdown = useMemo(() => {
    const now = Date.now();
    const target = wedding?.weddingDate ? new Date(wedding.weddingDate).getTime() : NaN;
    const diff = isNaN(target) ? 0 : Math.max(0, target - now);
    return {
      days: isNaN(target) ? 12 : Math.floor(diff / 86400000),
      hours: isNaN(target) ? 5 : Math.floor((diff % 86400000) / 3600000),
      mins: isNaN(target) ? 42 : Math.floor((diff % 3600000) / 60000),
      secs: isNaN(target) ? 10 : Math.floor((diff % 60000) / 1000),
    };
  }, [wedding, clock]);

  const vhsTime = clock.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
  const vhsDate = clock.toLocaleDateString("es-MX", { day: "2-digit", month: "2-digit", year: "2-digit" });

  if (isLoading || !data) {
    return <div style={{ minHeight: "100vh", background: "#080500", display: "flex", alignItems: "center", justifyContent: "center", color: "#C9A84C", fontFamily: "serif", fontSize: 18, letterSpacing: "0.2em" }}>TRANSMITIENDO...</div>;
  }

  return (
    <div style={{ minHeight: "100vh", background: "#080500", color: "#E8D5A0", fontFamily: "'Playfair Display', 'Times New Roman', serif", position: "relative", overflowX: "hidden" }}>
      <style>{`
        @keyframes tv90-fly    { 0%{transform:translate(0,0);opacity:1}   100%{transform:translate(-140vw,120vh);opacity:.8} }
        @keyframes tv90-flapL  { 0%,100%{transform:rotate(-30deg)} 50%{transform:rotate(10deg)} }
        @keyframes tv90-flapR  { 0%,100%{transform:rotate(30deg)}  50%{transform:rotate(-10deg)} }
        @keyframes tv90-glitch { 0%{transform:translateX(0)} 33%{transform:translateX(-5px)} 66%{transform:translateX(5px)} 100%{transform:translateX(0)} }
        @keyframes tv90-scan   { 0%{top:-2px} 100%{top:100%} }
        @keyframes tv90-flicker{ 0%,100%{opacity:1} 92%{opacity:1} 93%{opacity:0.85} 94%{opacity:1} 97%{opacity:0.9} 98%{opacity:1} }
        @keyframes tv90-glow   { 0%,100%{text-shadow:0 0 20px #C9A84C80,0 0 40px #C9A84C40} 50%{text-shadow:0 0 30px #C9A84Caa,0 0 60px #C9A84C60} }
        @keyframes tv90-pulse  { 0%,100%{opacity:0.6} 50%{opacity:1} }

        .tv90-scanline {
          position: fixed; left: 0; right: 0; height: 2px;
          background: rgba(201,168,76,0.06);
          pointer-events: none; z-index: 500;
          animation: tv90-scan 5s linear infinite;
        }
        .tv90-overlay {
          position: fixed; inset: 0; pointer-events: none; z-index: 499;
          background: repeating-linear-gradient(to bottom, rgba(0,0,0,0) 0px, rgba(0,0,0,0) 3px, rgba(0,0,0,0.08) 3px, rgba(0,0,0,0.08) 4px);
        }
        .tv90-flicker { animation: tv90-flicker 8s ease-in-out infinite; }
        .tv90-title-glow { animation: tv90-glow 3s ease-in-out infinite; }
        .tv90-pulse { animation: tv90-pulse 2s ease-in-out infinite; }

        .tv90-input {
          background: #1A0E00;
          border: 1px solid #C9A84C60;
          color: #E8D5A0;
          padding: 8px 12px;
          font-family: inherit;
          font-size: 14px;
          outline: none;
          width: 100%;
        }
        .tv90-input:focus { border-color: #C9A84C; box-shadow: 0 0 8px #C9A84C40; }
        .tv90-select {
          background: #1A0E00;
          border: 1px solid #C9A84C60;
          color: #E8D5A0;
          padding: 8px 12px;
          font-family: inherit;
          font-size: 14px;
          cursor: pointer;
        }
        .tv90-btn {
          background: linear-gradient(135deg, #2D1A00, #1A0E00);
          border: 1px solid #C9A84C80;
          color: #C9A84C;
          padding: 10px 24px;
          font-family: inherit;
          font-size: 13px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.2s;
        }
        .tv90-btn:hover { background: linear-gradient(135deg, #3D2800, #2D1A00); box-shadow: 0 0 12px #C9A84C40; }
        .tv90-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .tv90-btn-primary {
          background: linear-gradient(135deg, #C9A84C, #A07828);
          border: none; color: #0D0800;
          font-weight: bold;
        }
        .tv90-btn-primary:hover { background: linear-gradient(135deg, #DDB85C, #B08838); box-shadow: 0 0 16px #C9A84C60; }
      `}</style>

      {/* Scanline overlay */}
      <div className="tv90-overlay" />
      <div className="tv90-scanline" />

      {/* VHS timestamp */}
      <div style={{ position: "fixed", top: 16, right: 16, zIndex: 498, fontFamily: "monospace", fontSize: 11, color: "#C9A84C90", letterSpacing: "0.1em", lineHeight: 1.4 }}>
        <div>{vhsDate}</div>
        <div>{vhsTime}</div>
      </div>

      {/* TV Intro */}
      <AnimatePresence>
        {showIntro && wedding && (
          <motion.div key="intro" exit={{ opacity: 0 }} transition={{ duration: 1.2 }}>
            <TV90Intro wedding={wedding} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <motion.div
        className="tv90-flicker"
        initial={{ opacity: 0 }}
        animate={{ opacity: showIntro ? 0 : 1 }}
        transition={{ duration: 1 }}
      >
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "48px 20px 80px" }}>

          {/* Channel header */}
          <div style={{ textAlign: "center", marginBottom: 8 }}>
            <span className="tv90-pulse" style={{ color: "#C9A84C80", fontSize: 10, letterSpacing: "0.4em", textTransform: "uppercase", fontFamily: "monospace" }}>
              ◉ EN VIVO
            </span>
          </div>

          {/* Hero title card */}
          <div style={{
            textAlign: "center",
            padding: "40px 24px",
            border: "1px solid #C9A84C30",
            background: "linear-gradient(180deg, #150C00 0%, #0D0600 60%, #150C00 100%)",
            marginBottom: 32,
            position: "relative",
          }} data-testid="window-main">
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, #C9A84C, transparent)" }} />
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, #C9A84C, transparent)" }} />

            <p style={{ color: "#C9A84C80", fontSize: 10, letterSpacing: "0.5em", textTransform: "uppercase", marginBottom: 20, fontFamily: "monospace" }}>
              ✦ Con todo el amor del mundo los invitamos a ✦
            </p>
            <h1
              className="tv90-title-glow"
              style={{ fontSize: "clamp(28px, 6vw, 52px)", fontWeight: "bold", color: "#C9A84C", lineHeight: 1.2, marginBottom: 16, fontStyle: "italic" }}
              data-testid="text-couple-names"
            >
              {wedding?.coupleName}
            </h1>
            <p style={{ color: "#C9A84C80", fontSize: 10, letterSpacing: "0.5em", textTransform: "uppercase", marginBottom: 12, fontFamily: "monospace" }}>
              ✦ su boda ✦
            </p>
            <p style={{ fontSize: 18, color: "#E8D5A0", letterSpacing: "0.1em" }} data-testid="text-wedding-date">
              {wedding?.weddingDate}
            </p>

            {wedding?.message && (
              <>
                <GoldDivider />
                <p style={{ fontSize: 15, color: "#C4A87080", fontStyle: "italic", lineHeight: 1.7 }}>
                  "{wedding.message}"
                </p>
              </>
            )}

            {wedding?.couplePhotoUrl && (
              <div style={{ marginTop: 24, display: "inline-block", border: "1px solid #C9A84C40", padding: 4 }}>
                <img src={wedding.couplePhotoUrl} alt="Pareja" style={{ maxWidth: 220, display: "block" }} data-testid="img-couple" />
              </div>
            )}
          </div>

          {/* Ceremony */}
          <VintageCard title="Ceremonia Religiosa" icon="⛪">
            <div style={{ display: "grid", gap: 8, fontSize: 14 }}>
              <p><span style={{ color: "#C9A84C80", fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase" }}>Lugar </span><br />{wedding?.churchName}</p>
              <p><span style={{ color: "#C9A84C80", fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase" }}>Dirección </span><br />{wedding?.churchAddress}</p>
              <p><span style={{ color: "#C9A84C80", fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase" }}>Hora </span><br />{wedding?.churchTime}</p>
              <button className="tv90-btn" style={{ marginTop: 8, width: "100%" }}
                onClick={() => window.open(`https://maps.google.com/?q=${wedding?.churchAddress}`, "_blank")}
                data-testid="button-map-church">
                Ver en Mapa
              </button>
            </div>
          </VintageCard>

          {/* Reception */}
          <VintageCard title="Recepción" icon="🌹">
            <div style={{ display: "grid", gap: 8, fontSize: 14 }}>
              <p><span style={{ color: "#C9A84C80", fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase" }}>Lugar </span><br />{wedding?.venueName}</p>
              <p><span style={{ color: "#C9A84C80", fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase" }}>Dirección </span><br />{wedding?.venueAddress}</p>
              <p><span style={{ color: "#C9A84C80", fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase" }}>Hora </span><br />{wedding?.venueTime}</p>
              <button className="tv90-btn" style={{ marginTop: 8, width: "100%" }}
                onClick={() => window.open(`https://maps.google.com/?q=${wedding?.venueAddress}`, "_blank")}
                data-testid="button-map-venue">
                Ver en Mapa
              </button>
            </div>
          </VintageCard>

          <GoldDivider />

          {/* Dress code */}
          {wedding?.dressCode && (
            <VintageCard title="Código de Vestimenta" icon="✨">
              <p style={{ fontSize: 15, color: "#E8D5A0" }} data-testid="text-dress-code">{wedding.dressCode}</p>
            </VintageCard>
          )}

          {/* Countdown */}
          <VintageCard title="Cuenta Regresiva" icon="⏳">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, textAlign: "center" }}>
              {[
                { label: "Días", val: countdown.days },
                { label: "Horas", val: countdown.hours },
                { label: "Min", val: countdown.mins },
                { label: "Seg", val: countdown.secs },
              ].map(({ label, val }) => (
                <div key={label} style={{ border: "1px solid #C9A84C30", padding: "12px 4px", background: "#0D0800" }}>
                  <div style={{ fontSize: 28, fontWeight: "bold", color: "#C9A84C", lineHeight: 1 }}>{val}</div>
                  <div style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#C9A84C80", marginTop: 4 }}>{label}</div>
                </div>
              ))}
            </div>
          </VintageCard>

          <GoldDivider />

          {/* RSVP */}
          <VintageCard title="Confirmar Asistencia" icon="💌">
            <div style={{ textAlign: "center" }}>
              <p style={{ marginBottom: 8, fontSize: 14 }}>
                Invitado: <span style={{ color: "#C9A84C", fontStyle: "italic" }} data-testid="text-guest-name">{invitation?.guestName}</span>
              </p>
              <p style={{ marginBottom: 20, fontSize: 13, color: "#C4A87080" }}>
                Tienes <strong style={{ color: "#C9A84C" }} data-testid="text-assigned-seats">{invitation?.seats}</strong> lugar(es) reservado(s)
              </p>

              {responded || invitation?.status !== "pending" ? (
                <div style={{ border: "1px solid #C9A84C40", padding: "20px", background: "#0D0800" }}>
                  <p style={{ color: "#C9A84C", fontSize: 16, fontStyle: "italic" }} data-testid="text-rsvp-status">
                    {invitation?.status === "accepted"
                      ? `¡Nos vemos pronto, ${invitation.guestName}! 🌹`
                      : `¡Te extrañaremos, ${invitation?.guestName}!`}
                  </p>
                  <p style={{ fontSize: 12, marginTop: 8, color: "#C4A87070", letterSpacing: "0.1em" }}>Respuesta registrada</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "#C9A84C80", display: "block", marginBottom: 8 }}>
                      Número de Asistentes
                    </label>
                    <select className="tv90-select" value={confirmedSeats}
                      onChange={(e) => setConfirmedSeats(parseInt(e.target.value))}
                      data-testid="select-seats">
                      {Array.from({ length: invitation?.seats || 1 }).map((_, i) => (
                        <option key={i + 1} value={i + 1}>{i + 1} persona{i > 0 ? "s" : ""}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                    <button className="tv90-btn tv90-btn-primary"
                      onClick={() => respondMutation.mutate({ status: "accepted", confirmedSeats })}
                      disabled={respondMutation.isPending}
                      data-testid="button-accept">
                      Sí, Asistiré
                    </button>
                    <button className="tv90-btn"
                      onClick={() => respondMutation.mutate({ status: "declined", confirmedSeats: 0 })}
                      disabled={respondMutation.isPending}
                      data-testid="button-decline">
                      No Podré Ir
                    </button>
                  </div>
                </div>
              )}
            </div>
          </VintageCard>

          {/* Gifts */}
          {(wedding?.giftLabel1 || wedding?.giftLabel2) && (
            <VintageCard title="Mesa de Regalos" icon="🎁">
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {[
                  { label: wedding?.giftLabel1, url: wedding?.giftUrl1 },
                  { label: wedding?.giftLabel2, url: wedding?.giftUrl2 },
                ].filter(g => g.label && g.url).map((gift, idx) => (
                  <button key={idx} className="tv90-btn" style={{ flex: 1 }}
                    onClick={() => gift.url && window.open(gift.url, "_blank")}
                    data-testid={`button-gift-${idx}`}>
                    🎁 {gift.label}
                  </button>
                ))}
              </div>
            </VintageCard>
          )}

          {/* QR Code */}
          {invitation?.qrCode && (
            <div style={{ textAlign: "center", marginTop: 32 }} data-testid="window-qr">
              <GoldDivider />
              <p style={{ fontSize: 11, letterSpacing: "0.3em", textTransform: "uppercase", color: "#C9A84C80", marginBottom: 16 }}>Tu Pase de Entrada</p>
              <div style={{ display: "inline-block", border: "1px solid #C9A84C40", padding: 8, background: "white" }}>
                <img src={invitation.qrCode} alt="QR" style={{ width: 160, height: 160, display: "block" }} data-testid="img-qr-code" />
              </div>
              <p style={{ fontSize: 10, marginTop: 8, color: "#C9A84C60", letterSpacing: "0.2em" }}>PRESENTA EN LA ENTRADA</p>
            </div>
          )}

          {/* Footer */}
          <GoldDivider />
          <div style={{ textAlign: "center", color: "#C9A84C50", fontSize: 10, letterSpacing: "0.3em" }}>
            <p>CON AMOR · {wedding?.coupleName?.toUpperCase()}</p>
            <p style={{ marginTop: 4 }}>{wedding?.weddingDate?.toUpperCase()}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
