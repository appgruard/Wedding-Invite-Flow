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
  return <canvas ref={ref} style={{ mixBlendMode: "screen", position: "absolute", left: 0, top: 0, zIndex: 9, width: "100%", height: "100%", pointerEvents: "none" }} />;
}

/* ─── Flying Toasters ────────────────────────────────────────────────────── */
const T_DATA = Array.from({ length: 9 }, (_, i) => ({ id: i, top: 5 + (i * 11) % 90, right: -5 - (i * 17) % 40, dur: 5 + i * 0.7, delay: i * 0.6 }));
const TOAST_DATA = Array.from({ length: 4 }, (_, i) => ({ id: i + 100, top: 15 + (i * 23) % 65, right: -15 - (i * 13) % 30, dur: 4 + i * 0.9, delay: i * 1.2 + 0.3 }));

function FlyingToasters({ coupleName }: { coupleName: string }) {
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", background: "#000", overflow: "hidden" }}>
      {T_DATA.map((t) => (
        <div key={t.id} style={{ position: "absolute", top: `${t.top}%`, right: `${t.right}%`, animation: `v90-fly ${t.dur}s ${t.delay}s linear infinite`, display: "flex", alignItems: "center" }}>
          <div style={{ marginRight: -8, zIndex: 1, animation: "v90-flapL 0.25s ease-in-out infinite", transformOrigin: "right center" }}>
            <svg viewBox="0 0 40 28" width="36" height="25"><ellipse cx="20" cy="14" rx="20" ry="10" fill="#B8B8B8" stroke="#888" strokeWidth="1"/><ellipse cx="20" cy="14" rx="14" ry="7" fill="#D0D0D0"/></svg>
          </div>
          <svg viewBox="0 0 64 50" width="56" height="44">
            <rect x="2" y="8" width="60" height="40" rx="6" fill="#BEBEBE" stroke="#707070" strokeWidth="2"/>
            <defs><linearGradient id={`tg${t.id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#FFF" stopOpacity="0.4"/><stop offset="100%" stopColor="#000" stopOpacity="0.1"/></linearGradient></defs>
            <rect x="2" y="8" width="60" height="40" rx="6" fill={`url(#tg${t.id})`}/>
            <rect x="14" y="2" width="12" height="14" rx="2" fill="#707070" stroke="#505050" strokeWidth="1"/>
            <rect x="38" y="2" width="12" height="14" rx="2" fill="#707070" stroke="#505050" strokeWidth="1"/>
            <rect x="8" y="16" width="48" height="4" rx="2" fill="#909090"/>
            <circle cx="10" cy="38" r="4" fill="#C8A800" stroke="#907800" strokeWidth="1"/>
            <circle cx="10" cy="38" r="2" fill="#FFD700"/>
          </svg>
          <div style={{ marginLeft: -8, zIndex: 1, animation: "v90-flapR 0.25s ease-in-out infinite", transformOrigin: "left center" }}>
            <svg viewBox="0 0 40 28" width="36" height="25"><ellipse cx="20" cy="14" rx="20" ry="10" fill="#B8B8B8" stroke="#888" strokeWidth="1"/><ellipse cx="20" cy="14" rx="14" ry="7" fill="#D0D0D0"/></svg>
          </div>
        </div>
      ))}
      {TOAST_DATA.map((t) => (
        <div key={t.id} style={{ position: "absolute", top: `${t.top}%`, right: `${t.right}%`, animation: `v90-fly ${t.dur}s ${t.delay}s linear infinite` }}>
          <svg viewBox="0 0 30 30" width="24" height="24"><rect x="2" y="2" width="26" height="26" rx="2" fill="#D4A843" stroke="#8B5A1A" strokeWidth="1.5"/><rect x="5" y="5" width="20" height="3" rx="1" fill="#B8863A" opacity="0.7"/><rect x="5" y="10" width="14" height="3" rx="1" fill="#B8863A" opacity="0.4"/></svg>
        </div>
      ))}
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "white", textAlign: "center", pointerEvents: "none" }}>
        <p style={{ fontSize: "clamp(14px,2vw,20px)", fontStyle: "italic", textShadow: "0 0 20px #D4A843, 0 0 40px #D4A843", marginBottom: 8, fontFamily: "'Playfair Display', serif" }}>{coupleName}</p>
        <p style={{ fontSize: "clamp(9px,1.2vw,13px)", opacity: 0.55, letterSpacing: "0.2em", fontFamily: "monospace" }}>CARGANDO TRANSMISIÓN...</p>
      </div>
    </div>
  );
}

/* ─── TV Intro ───────────────────────────────────────────────────────────── */
function TV90Intro({ wedding }: { wedding: Wedding }) {
  const videoId = wedding.videoType === "youtube" && wedding.videoUrl
    ? (wedding.videoUrl.includes("youtu.be/") ? wedding.videoUrl.split("youtu.be/")[1]?.split("?")[0] : wedding.videoUrl.split("v=")[1]?.split("&")[0])
    : null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "#000", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
      <div style={{ position: "absolute", width: "90vw", height: "50vw", maxWidth: "100%", maxHeight: "100vh", backgroundImage: "url(https://alexandrevacassin.fr/codepen/old-tv/base.webp)", zIndex: 10, backgroundSize: "cover", backgroundPosition: "center", pointerEvents: "none" }} />
      <div style={{ position: "absolute", marginBottom: "3vw", width: "60vw", marginRight: "10vw", height: "45vw", maxWidth: "100%", maxHeight: "70vh", zIndex: 1, display: "flex", justifyContent: "center", alignItems: "center", overflow: "hidden" }}>
        <VCRCanvas />
        {videoId ? (
          <iframe title="tv" style={{ width: "100%", height: "100%", border: "none", filter: "contrast(1.2) brightness(1.1)" }}
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&controls=0&loop=1&mute=1`} allow="autoplay; encrypted-media" allowFullScreen />
        ) : wedding.videoType === "mp4" && wedding.videoUrl ? (
          <video style={{ width: "100%", height: "100%", filter: "contrast(1.2) brightness(1.1)" }} autoPlay muted playsInline loop>
            <source src={wedding.videoUrl} type="video/mp4" />
          </video>
        ) : <FlyingToasters coupleName={wedding.coupleName} />}
        <div style={{ pointerEvents: "none", position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "url('https://upload.wikimedia.org/wikipedia/commons/0/02/Television_static.gif')", mixBlendMode: "multiply" as const, opacity: 0.3, animation: "v90-glitch 0.2s infinite linear", zIndex: 2 }} />
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "repeating-linear-gradient(to bottom, transparent 0px, rgba(0,0,0,0.2) 1px, transparent 2px)", pointerEvents: "none", zIndex: 2 }} />
      </div>
    </div>
  );
}

/* ─── Ornamental divider ─────────────────────────────────────────────────── */
function OrnamentDivider({ symbol = "❧" }: { symbol?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, margin: "28px auto", maxWidth: 480, color: "#C4730A" }}>
      <div style={{ flex: 1, height: 1, background: "linear-gradient(to right, transparent, #C4730A90)" }} />
      <span style={{ padding: "0 16px", fontSize: 20, opacity: 0.8 }}>{symbol}</span>
      <div style={{ flex: 1, height: 1, background: "linear-gradient(to left, transparent, #C4730A90)" }} />
    </div>
  );
}

/* ─── Ornate vintage card ────────────────────────────────────────────────── */
function VCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{
      position: "relative",
      marginBottom: 24,
      padding: "0 2px 2px",
    }}>
      <div style={{
        border: "1px solid #C4730A50",
        boxShadow: "0 0 0 3px #1A1005, 0 0 0 4px #C4730A25, 0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 #C4730A20",
        background: "linear-gradient(180deg, #261508 0%, #1A1005 100%)",
        overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{
          borderBottom: "1px solid #C4730A30",
          background: "linear-gradient(90deg, #1A1005 0%, #30190A 40%, #30190A 60%, #1A1005 100%)",
          padding: "9px 20px",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
        }}>
          <span style={{ color: "#C4730A60", fontSize: 9, letterSpacing: "0.1em" }}>⋄</span>
          <span style={{ color: "#C4730A", fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", fontFamily: "'Playfair Display', serif", fontWeight: "bold" }}>{label}</span>
          <span style={{ color: "#C4730A60", fontSize: 9, letterSpacing: "0.1em" }}>⋄</span>
        </div>
        {/* Content */}
        <div style={{ padding: "20px 24px", color: "#E8C8A0" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

/* ─── Corner-framed hero box ─────────────────────────────────────────────── */
function HeroFrame({ children }: { children: React.ReactNode }) {
  const corner = { position: "absolute" as const, color: "#C4730A", fontSize: 18, lineHeight: 1 };
  return (
    <div style={{ position: "relative", padding: "48px 32px", textAlign: "center", marginBottom: 32 }}>
      <span style={{ ...corner, top: 8, left: 8 }}>┌</span>
      <span style={{ ...corner, top: 8, right: 8 }}>┐</span>
      <span style={{ ...corner, bottom: 8, left: 8 }}>└</span>
      <span style={{ ...corner, bottom: 8, right: 8 }}>┘</span>
      <div style={{ position: "absolute", top: 16, left: 16, right: 16, height: 1, background: "linear-gradient(90deg, transparent, #C4730A50, transparent)" }} />
      <div style={{ position: "absolute", bottom: 16, left: 16, right: 16, height: 1, background: "linear-gradient(90deg, transparent, #C4730A50, transparent)" }} />
      <div style={{ position: "absolute", top: 16, left: 16, bottom: 16, width: 1, background: "linear-gradient(180deg, transparent, #C4730A50, transparent)" }} />
      <div style={{ position: "absolute", top: 16, right: 16, bottom: 16, width: 1, background: "linear-gradient(180deg, transparent, #C4730A50, transparent)" }} />
      {children}
    </div>
  );
}

/* ─── Countdown digit ────────────────────────────────────────────────────── */
function CountDigit({ val, label }: { val: number; label: string }) {
  return (
    <div style={{ textAlign: "center", padding: "0 8px" }}>
      <div style={{
        fontSize: "clamp(32px, 5vw, 48px)",
        fontWeight: "bold",
        color: "#C4730A",
        fontFamily: "'Playfair Display', serif",
        lineHeight: 1,
        textShadow: "0 0 20px #C4730A80, 0 0 40px #C4730A40",
        minWidth: 56,
        display: "inline-block",
      }}>{String(val).padStart(2, "0")}</div>
      <div style={{ fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase", color: "#C4730A60", marginTop: 6 }}>{label}</div>
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

  useEffect(() => { const t = setInterval(() => setClock(new Date()), 1000); return () => clearInterval(t); }, []);
  useEffect(() => { if (wedding) { const t = setTimeout(() => setShowIntro(false), wedding.introDuration || 6000); return () => clearTimeout(t); } }, [wedding]);

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
    onError: () => toast({ title: "Error", description: "No se pudo enviar tu respuesta.", variant: "destructive" }),
  });

  const countdown = useMemo(() => {
    const target = wedding?.weddingDate ? new Date(wedding.weddingDate).getTime() : NaN;
    const diff = isNaN(target) ? 0 : Math.max(0, target - Date.now());
    return {
      days: isNaN(target) ? 12 : Math.floor(diff / 86400000),
      hours: isNaN(target) ? 5 : Math.floor((diff % 86400000) / 3600000),
      mins: isNaN(target) ? 42 : Math.floor((diff % 3600000) / 60000),
      secs: isNaN(target) ? 10 : Math.floor((diff % 60000) / 1000),
    };
  }, [wedding, clock]);

  const vhsStamp = `${clock.toLocaleDateString("es-MX", { day: "2-digit", month: "2-digit", year: "2-digit" })} ${clock.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })}`;

  if (isLoading || !data) {
    return <div style={{ minHeight: "100vh", background: "#1A1005", display: "flex", alignItems: "center", justifyContent: "center", color: "#C4730A", fontFamily: "'Playfair Display', serif", fontSize: 18, letterSpacing: "0.3em", fontStyle: "italic" }}>Transmitiendo...</div>;
  }

  return (
    <div style={{ minHeight: "100vh", background: "#1A1005", color: "#E8C8A0", fontFamily: "'Playfair Display', 'Times New Roman', serif", position: "relative", overflowX: "hidden" }}>
      <style>{`
        @keyframes v90-fly    { 0%{transform:translate(0,0)} 100%{transform:translate(-140vw,120vh)} }
        @keyframes v90-flapL  { 0%,100%{transform:rotate(-30deg)} 50%{transform:rotate(10deg)} }
        @keyframes v90-flapR  { 0%,100%{transform:rotate(30deg)}  50%{transform:rotate(-10deg)} }
        @keyframes v90-glitch { 0%{transform:translateX(0)} 33%{transform:translateX(-5px)} 66%{transform:translateX(5px)} 100%{transform:translateX(0)} }
        @keyframes v90-scan   { 0%{top:0} 100%{top:100%} }
        @keyframes v90-flicker{ 0%,100%{opacity:1} 93%{opacity:0.88} 94%{opacity:1} 97%{opacity:0.93} 98%{opacity:1} }
        @keyframes v90-glow   { 0%,100%{text-shadow:0 0 20px #C4730A80,0 0 50px #C4730A30} 50%{text-shadow:0 0 30px #C4730AB0,0 0 70px #C4730A50} }
        @keyframes v90-pulse  { 0%,100%{opacity:0.5} 50%{opacity:1} }
        @keyframes v90-fadein { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }

        .v90-scanline {
          position:fixed; left:0; right:0; height:120px;
          background:linear-gradient(to bottom, transparent, rgba(196,115,10,0.03) 50%, transparent);
          pointer-events:none; z-index:500;
          animation:v90-scan 6s linear infinite;
        }
        .v90-crt {
          position:fixed; inset:0; pointer-events:none; z-index:499;
          background:repeating-linear-gradient(to bottom, transparent 0px, transparent 3px, rgba(0,0,0,0.07) 3px, rgba(0,0,0,0.07) 4px);
        }
        .v90-vignette {
          position:fixed; inset:0; pointer-events:none; z-index:498;
          background:radial-gradient(ellipse at center, transparent 50%, rgba(10,6,0,0.85) 100%);
        }
        .v90-flicker { animation:v90-flicker 10s ease-in-out infinite; }
        .v90-title   { animation:v90-glow 3.5s ease-in-out infinite; }
        .v90-pulse   { animation:v90-pulse 2s ease-in-out infinite; }
        .v90-fadein  { animation:v90-fadein 0.8s ease-out both; }

        .v90-btn {
          display:inline-block;
          background:transparent;
          border:1px solid #C4730A70;
          color:#C4730A;
          padding:10px 28px;
          font-family:'Playfair Display',serif;
          font-size:12px;
          letter-spacing:0.25em;
          text-transform:uppercase;
          cursor:pointer;
          transition:all 0.3s;
          position:relative;
        }
        .v90-btn:hover { background:#C4730A15; box-shadow:0 0 16px #C4730A30; border-color:#C4730A; }
        .v90-btn:disabled { opacity:0.35; cursor:not-allowed; }
        .v90-btn-gold {
          background:linear-gradient(135deg,#C4730A,#8B4D06);
          border:none; color:#F5E6C8; font-weight:bold;
        }
        .v90-btn-gold:hover { background:linear-gradient(135deg,#D4830A,#9B5D06); box-shadow:0 0 24px #C4730A60; }
        .v90-select {
          background:#261808; border:1px solid #C4730A50;
          color:#E8C8A0; padding:8px 12px;
          font-family:'Playfair Display',serif; font-size:14px;
          cursor:pointer; outline:none;
        }
        .v90-label {
          font-size:9px; letter-spacing:0.35em; text-transform:uppercase;
          color:#C4730A70; display:block; margin-bottom:8px;
          font-family:'Roboto Mono',monospace;
        }
        .v90-detail { font-size:14px; color:#E8C8A0; margin-bottom:12px; line-height:1.7; }
        .v90-detail strong { color:#C4730A; font-weight:normal; font-style:italic; }
      `}</style>

      {/* CRT effects */}
      <div className="v90-crt" />
      <div className="v90-scanline" />
      <div className="v90-vignette" />

      {/* VHS timestamp */}
      <div style={{ position: "fixed", top: 12, right: 14, zIndex: 600, fontFamily: "monospace", fontSize: 10, color: "#C4730A60", letterSpacing: "0.08em" }}>
        {vhsStamp}
      </div>
      {/* On-air indicator */}
      <div style={{ position: "fixed", top: 12, left: 14, zIndex: 600, display: "flex", alignItems: "center", gap: 6 }}>
        <span className="v90-pulse" style={{ width: 7, height: 7, borderRadius: "50%", background: "#C4730A", display: "inline-block" }} />
        <span style={{ fontFamily: "monospace", fontSize: 9, color: "#C4730A70", letterSpacing: "0.2em" }}>EN VIVO</span>
      </div>

      {/* TV Intro */}
      <AnimatePresence>
        {showIntro && wedding && (
          <motion.div key="intro" exit={{ opacity: 0 }} transition={{ duration: 1.4 }}>
            <TV90Intro wedding={wedding} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main Content ── */}
      <motion.div
        className="v90-flicker"
        initial={{ opacity: 0 }}
        animate={{ opacity: showIntro ? 0 : 1 }}
        transition={{ duration: 1.2 }}
      >
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "56px 20px 80px" }}>

          {/* ── Hero ── */}
          <HeroFrame>
            <p style={{ fontSize: 9, letterSpacing: "0.6em", color: "#C4730A80", textTransform: "uppercase", marginBottom: 24, fontFamily: "monospace" }}>
              ✦ Con todo el amor ✦
            </p>

            <h1
              className="v90-title"
              style={{
                fontSize: "clamp(30px, 6.5vw, 56px)",
                fontStyle: "italic",
                fontWeight: "bold",
                color: "#C4730A",
                lineHeight: 1.15,
                marginBottom: 20,
              }}
              data-testid="text-couple-names"
            >
              {wedding?.coupleName}
            </h1>

            <div style={{ display: "flex", alignItems: "center", gap: 16, justifyContent: "center", color: "#C4730A60", marginBottom: 20 }}>
              <div style={{ flex: 1, height: 1, background: "linear-gradient(to right, transparent, #C4730A80)" }} />
              <span style={{ fontSize: 14 }}>✦</span>
              <span style={{ fontSize: 13, letterSpacing: "0.12em", color: "#E8C8A0", fontStyle: "italic" }} data-testid="text-wedding-date">{wedding?.weddingDate}</span>
              <span style={{ fontSize: 14 }}>✦</span>
              <div style={{ flex: 1, height: 1, background: "linear-gradient(to left, transparent, #C4730A80)" }} />
            </div>

            {wedding?.message && (
              <p style={{ fontSize: 14, color: "#C4730A80", fontStyle: "italic", lineHeight: 1.8, maxWidth: 440, margin: "0 auto" }}>
                &ldquo;{wedding.message}&rdquo;
              </p>
            )}

            {wedding?.couplePhotoUrl && (
              <div style={{ marginTop: 24, display: "inline-block" }}>
                <div style={{ border: "1px solid #C4730A40", padding: 6, boxShadow: "0 0 0 4px #1A1005, 0 0 0 5px #C4730A20, 0 8px 32px rgba(0,0,0,0.8)" }}>
                  <img
                    src={wedding.couplePhotoUrl}
                    alt="Pareja"
                    style={{ maxWidth: 200, display: "block", filter: "sepia(0.5) contrast(1.05)" }}
                    data-testid="img-couple"
                  />
                </div>
              </div>
            )}
          </HeroFrame>

          <OrnamentDivider symbol="❧" />

          {/* ── Ceremony ── */}
          <VCard label="Ceremonia Religiosa">
            <div className="v90-detail"><strong>Lugar</strong><br />{wedding?.churchName}</div>
            <div className="v90-detail"><strong>Dirección</strong><br />{wedding?.churchAddress}</div>
            <div className="v90-detail" style={{ marginBottom: 16 }}><strong>Hora</strong><br />{wedding?.churchTime}</div>
            <button className="v90-btn" style={{ width: "100%" }}
              onClick={() => window.open(`https://maps.google.com/?q=${wedding?.churchAddress}`, "_blank")}
              data-testid="button-map-church">
              Ver en mapa
            </button>
          </VCard>

          {/* ── Venue ── */}
          <VCard label="Recepción">
            <div className="v90-detail"><strong>Lugar</strong><br />{wedding?.venueName}</div>
            <div className="v90-detail"><strong>Dirección</strong><br />{wedding?.venueAddress}</div>
            <div className="v90-detail" style={{ marginBottom: 16 }}><strong>Hora</strong><br />{wedding?.venueTime}</div>
            <button className="v90-btn" style={{ width: "100%" }}
              onClick={() => window.open(`https://maps.google.com/?q=${wedding?.venueAddress}`, "_blank")}
              data-testid="button-map-venue">
              Ver en mapa
            </button>
          </VCard>

          {wedding?.dressCode && (
            <VCard label="Vestimenta">
              <p className="v90-detail" data-testid="text-dress-code">{wedding.dressCode}</p>
            </VCard>
          )}

          <OrnamentDivider symbol="✦" />

          {/* ── Countdown ── */}
          <VCard label="Cuenta regresiva">
            <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-start", gap: 4, flexWrap: "wrap" }}>
              <CountDigit val={countdown.days}  label="Días" />
              <div style={{ color: "#C4730A40", fontSize: 36, lineHeight: "1.1", alignSelf: "flex-start", paddingTop: 8 }}>:</div>
              <CountDigit val={countdown.hours} label="Horas" />
              <div style={{ color: "#C4730A40", fontSize: 36, lineHeight: "1.1", alignSelf: "flex-start", paddingTop: 8 }}>:</div>
              <CountDigit val={countdown.mins}  label="Min" />
              <div style={{ color: "#C4730A40", fontSize: 36, lineHeight: "1.1", alignSelf: "flex-start", paddingTop: 8 }}>:</div>
              <CountDigit val={countdown.secs}  label="Seg" />
            </div>
          </VCard>

          <OrnamentDivider symbol="❦" />

          {/* ── RSVP ── */}
          <VCard label="Confirmar asistencia">
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: 14, marginBottom: 4, color: "#DFC898" }}>
                Invitado: <span style={{ color: "#C9A84C", fontStyle: "italic" }} data-testid="text-guest-name">{invitation?.guestName}</span>
              </p>
              <p style={{ fontSize: 12, marginBottom: 24, color: "#C9A84C60", letterSpacing: "0.05em" }}>
                {invitation?.seats} lugar(es) reservado(s)
              </p>

              {responded || invitation?.status !== "pending" ? (
                <div style={{ border: "1px solid #C9A84C30", padding: "24px 20px", background: "#0A0500" }}>
                  <p style={{ color: "#C9A84C", fontSize: 16, fontStyle: "italic" }} data-testid="text-rsvp-status">
                    {invitation?.status === "accepted"
                      ? `¡Nos vemos pronto, ${invitation.guestName}!`
                      : `¡Te extrañaremos, ${invitation?.guestName}!`}
                  </p>
                  <p style={{ fontSize: 10, marginTop: 10, color: "#C9A84C50", letterSpacing: "0.2em", textTransform: "uppercase" }}>Respuesta registrada</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 20, alignItems: "center" }}>
                  <div style={{ width: "100%", maxWidth: 260 }}>
                    <label className="v90-label">Número de asistentes</label>
                    <select className="v90-select" style={{ width: "100%" }} value={confirmedSeats}
                      onChange={(e) => setConfirmedSeats(parseInt(e.target.value))} data-testid="select-seats">
                      {Array.from({ length: invitation?.seats || 1 }).map((_, i) => (
                        <option key={i + 1} value={i + 1}>{i + 1} persona{i > 0 ? "s" : ""}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ display: "flex", gap: 16 }}>
                    <button className="v90-btn v90-btn-gold"
                      onClick={() => respondMutation.mutate({ status: "accepted", confirmedSeats })}
                      disabled={respondMutation.isPending} data-testid="button-accept">
                      Sí, asistiré
                    </button>
                    <button className="v90-btn"
                      onClick={() => respondMutation.mutate({ status: "declined", confirmedSeats: 0 })}
                      disabled={respondMutation.isPending} data-testid="button-decline">
                      No podré ir
                    </button>
                  </div>
                </div>
              )}
            </div>
          </VCard>

          {/* ── Gifts ── */}
          {(wedding?.giftLabel1 || wedding?.giftLabel2) && (
            <VCard label="Mesa de regalos">
              <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                {[
                  { label: wedding?.giftLabel1, url: wedding?.giftUrl1 },
                  { label: wedding?.giftLabel2, url: wedding?.giftUrl2 },
                ].filter(g => g.label && g.url).map((g, i) => (
                  <button key={i} className="v90-btn" onClick={() => g.url && window.open(g.url, "_blank")} data-testid={`button-gift-${i}`}>
                    {g.label}
                  </button>
                ))}
              </div>
            </VCard>
          )}

          {/* ── QR Code ── */}
          {invitation?.qrCode && (
            <>
              <OrnamentDivider symbol="✦" />
              <div style={{ textAlign: "center" }} data-testid="window-qr">
                <label className="v90-label" style={{ display: "block", textAlign: "center", marginBottom: 16 }}>Tu pase de entrada</label>
                <div style={{ display: "inline-block", border: "1px solid #C4730A40", padding: 8, boxShadow: "0 0 0 4px #1A1005, 0 0 0 5px #C4730A20", background: "white" }}>
                  <img src={invitation.qrCode} alt="QR" style={{ width: 148, height: 148, display: "block" }} data-testid="img-qr-code" />
                </div>
                <p style={{ fontSize: 9, marginTop: 12, color: "#C4730A50", letterSpacing: "0.3em", textTransform: "uppercase" }}>Presenta en la entrada</p>
              </div>
            </>
          )}

          {/* ── Footer ── */}
          <OrnamentDivider symbol="❧" />
          <div style={{ textAlign: "center", color: "#C4730A50", fontSize: 9, letterSpacing: "0.4em", textTransform: "uppercase", fontFamily: "monospace", lineHeight: 2 }}>
            <div>{wedding?.coupleName}</div>
            <div>{wedding?.weddingDate}</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
