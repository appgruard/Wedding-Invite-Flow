import { useState, useEffect, useRef, useMemo } from "react";
import { MusicPlayer } from "@/components/music-player";
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
  const tvType = wedding.tvVideoType || "youtube";
  const tvUrl = wedding.tvVideoUrl || "https://youtu.be/BboMpayJomw";
  const videoId = tvType === "youtube" && tvUrl
    ? (tvUrl.includes("youtu.be/") ? tvUrl.split("youtu.be/")[1]?.split("?")[0] : tvUrl.split("v=")[1]?.split("&")[0])
    : null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "#000", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
      <div style={{ position: "absolute", width: "90vw", height: "50vw", maxWidth: "100%", maxHeight: "100vh", backgroundImage: "url(https://alexandrevacassin.fr/codepen/old-tv/base.webp)", zIndex: 10, backgroundSize: "cover", backgroundPosition: "center", pointerEvents: "none" }} />
      <div style={{ position: "absolute", marginBottom: "3vw", width: "60vw", marginRight: "10vw", height: "45vw", maxWidth: "100%", maxHeight: "70vh", zIndex: 1, display: "flex", justifyContent: "center", alignItems: "center", overflow: "hidden" }}>
        <VCRCanvas />
        {videoId ? (
          <iframe title="tv" style={{ width: "100%", height: "100%", border: "none", filter: "contrast(1.2) brightness(1.1)" }}
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&controls=0&loop=1&mute=1`} allow="autoplay; encrypted-media" allowFullScreen />
        ) : tvType === "mp4" && tvUrl ? (
          <video style={{ width: "100%", height: "100%", filter: "contrast(1.2) brightness(1.1)" }} autoPlay muted playsInline loop>
            <source src={tvUrl} type="video/mp4" />
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
    <div style={{ display: "flex", alignItems: "center", gap: 0, margin: "32px auto", maxWidth: 480, color: "#A0784C" }}>
      <div style={{ flex: 1, height: 1, background: "linear-gradient(to right, transparent, #A0784C60)" }} />
      <span style={{ padding: "0 16px", fontSize: 18, opacity: 0.7, lineHeight: 1 }}>{symbol}</span>
      <div style={{ flex: 1, height: 1, background: "linear-gradient(to left, transparent, #A0784C60)" }} />
    </div>
  );
}

/* ─── Album-style card ──────────────────────────────────────────────────── */
function AlbumCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      style={{
        marginBottom: 28,
        background: "#FFFDF7",
        border: "1px solid #D9C9A8",
        borderRadius: 6,
        boxShadow: "0 2px 12px rgba(74,55,40,0.08), 0 1px 3px rgba(74,55,40,0.06)",
        overflow: "hidden",
      }}
    >
      <div style={{
        borderBottom: "1px solid #E8D9BF",
        background: "linear-gradient(90deg, #F8F0E0, #FBF5EB, #F8F0E0)",
        padding: "10px 24px",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
      }}>
        <span style={{ color: "#A0784C", fontSize: 10, opacity: 0.5 }}>&#9674;</span>
        <span style={{
          color: "#A0784C",
          fontSize: 11,
          letterSpacing: "0.25em",
          textTransform: "uppercase" as const,
          fontFamily: "'Playfair Display', serif",
          fontWeight: 700,
        }}>{label}</span>
        <span style={{ color: "#A0784C", fontSize: 10, opacity: 0.5 }}>&#9674;</span>
      </div>
      <div style={{ padding: "24px 28px", color: "#4A3728" }}>
        {children}
      </div>
    </motion.div>
  );
}

/* ─── Corner-framed hero box ─────────────────────────────────────────────── */
function HeroFrame({ children }: { children: React.ReactNode }) {
  const cornerStyle = {
    position: "absolute" as const,
    width: 28,
    height: 28,
    borderColor: "#A0784C",
    opacity: 0.5,
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      style={{ position: "relative", padding: "52px 32px", textAlign: "center", marginBottom: 36 }}
    >
      <div style={{ ...cornerStyle, top: 0, left: 0, borderTop: "2px solid", borderLeft: "2px solid" }} />
      <div style={{ ...cornerStyle, top: 0, right: 0, borderTop: "2px solid", borderRight: "2px solid" }} />
      <div style={{ ...cornerStyle, bottom: 0, left: 0, borderBottom: "2px solid", borderLeft: "2px solid" }} />
      <div style={{ ...cornerStyle, bottom: 0, right: 0, borderBottom: "2px solid", borderRight: "2px solid" }} />
      {children}
    </motion.div>
  );
}

/* ─── Photo mounting corners ─────────────────────────────────────────────── */
function PhotoFrame({ src, alt, testId }: { src: string; alt: string; testId: string }) {
  const mountCorner = {
    position: "absolute" as const,
    width: 20,
    height: 20,
    borderColor: "#A0784C50",
  };
  return (
    <div style={{ display: "inline-block", position: "relative", marginTop: 28 }}>
      <div style={{
        padding: 8,
        background: "#FFFDF7",
        border: "1px solid #D9C9A8",
        borderRadius: 3,
        boxShadow: "0 3px 16px rgba(74,55,40,0.12)",
        position: "relative",
      }}>
        <div style={{ ...mountCorner, top: -2, left: -2, borderTop: "3px solid", borderLeft: "3px solid" }} />
        <div style={{ ...mountCorner, top: -2, right: -2, borderTop: "3px solid", borderRight: "3px solid" }} />
        <div style={{ ...mountCorner, bottom: -2, left: -2, borderBottom: "3px solid", borderLeft: "3px solid" }} />
        <div style={{ ...mountCorner, bottom: -2, right: -2, borderBottom: "3px solid", borderRight: "3px solid" }} />
        <img
          src={src}
          alt={alt}
          style={{ maxWidth: 220, display: "block", borderRadius: 2, filter: "sepia(0.15) contrast(1.02)" }}
          data-testid={testId}
        />
      </div>
    </div>
  );
}

/* ─── Countdown digit ────────────────────────────────────────────────────── */
function CountDigit({ val, label }: { val: number; label: string }) {
  return (
    <div style={{ textAlign: "center", padding: "0 6px" }}>
      <div style={{
        fontSize: "clamp(28px, 5vw, 44px)",
        fontWeight: 700,
        color: "#A0784C",
        fontFamily: "'Playfair Display', serif",
        lineHeight: 1,
        minWidth: 52,
        display: "inline-block",
        background: "#F8F0E0",
        border: "1px solid #D9C9A8",
        borderRadius: 4,
        padding: "8px 4px",
      }}>{String(val).padStart(2, "0")}</div>
      <div style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase" as const, color: "#7A6555", marginTop: 6, fontFamily: "Georgia, 'Times New Roman', serif" }}>{label}</div>
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

  const { data, isLoading, isError } = useQuery<InvitationWithWedding>({
    queryKey: previewTemplate ? ["/api/demo", previewTemplate] : ["/api/invitations", invitationId],
    ...(previewTemplate
      ? { queryFn: async () => { const r = await fetch(`/api/demo/${previewTemplate}`); return r.json(); } }
      : {}),
    enabled: previewTemplate ? true : !!invitationId,
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  const wedding = data?.wedding;
  const invitation = data;
  const allowedColors: string[] = useMemo(() => { try { return JSON.parse(wedding?.allowedColors || "[]"); } catch { return []; } }, [wedding?.allowedColors]);

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

  if (isLoading) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#FBF5EB",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#A0784C",
        fontFamily: "'Playfair Display', serif",
        fontSize: 18,
        letterSpacing: "0.15em",
        fontStyle: "italic",
      }}>
        Cargando...
      </div>
    );
  }
  if (isError || !data) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#FBF5EB",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
      }}>
        <p style={{ color: "#7A6555", fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 15 }}>
          Error al cargar la invitación.
        </p>
        <button
          onClick={() => queryClient.resetQueries({ queryKey: ["/api/invitations", invitationId] })}
          style={{
            padding: "10px 24px",
            background: "#A0784C",
            color: "#FFFDF7",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: 14,
          }}
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#FBF5EB",
      color: "#4A3728",
      fontFamily: "Georgia, 'Times New Roman', serif",
      position: "relative",
      overflowX: "hidden",
    }}>
      <style>{`
        @keyframes v90-fly    { 0%{transform:translate(0,0)} 100%{transform:translate(-140vw,120vh)} }
        @keyframes v90-flapL  { 0%,100%{transform:rotate(-30deg)} 50%{transform:rotate(10deg)} }
        @keyframes v90-flapR  { 0%,100%{transform:rotate(30deg)}  50%{transform:rotate(-10deg)} }
        @keyframes v90-glitch { 0%{transform:translateX(0)} 33%{transform:translateX(-5px)} 66%{transform:translateX(5px)} 100%{transform:translateX(0)} }

        .album-btn {
          display: inline-block;
          background: transparent;
          border: 1px solid #A0784C;
          color: #A0784C;
          padding: 10px 28px;
          font-family: Georgia, 'Times New Roman', serif;
          font-size: 14px;
          letter-spacing: 0.08em;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.25s ease;
        }
        .album-btn:hover {
          background: #A0784C12;
          border-color: #8B6540;
        }
        .album-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .album-btn-primary {
          background: linear-gradient(135deg, #A0784C, #8B6540);
          border: none;
          color: #FFFDF7;
          font-weight: 600;
        }
        .album-btn-primary:hover {
          background: linear-gradient(135deg, #B08858, #996E48);
          box-shadow: 0 2px 12px rgba(160,120,76,0.3);
        }
        .album-select {
          background: #FFFDF7;
          border: 1px solid #D9C9A8;
          color: #4A3728;
          padding: 10px 14px;
          font-family: Georgia, 'Times New Roman', serif;
          font-size: 14px;
          border-radius: 6px;
          cursor: pointer;
          outline: none;
          width: 100%;
        }
        .album-select:focus {
          border-color: #A0784C;
          box-shadow: 0 0 0 2px rgba(160,120,76,0.15);
        }
        .album-label {
          font-size: 11px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #7A6555;
          display: block;
          margin-bottom: 8px;
          font-family: Georgia, 'Times New Roman', serif;
        }
        .album-detail {
          font-size: 15px;
          color: #4A3728;
          margin-bottom: 12px;
          line-height: 1.7;
        }
        .album-detail strong {
          color: #A0784C;
          font-weight: 600;
        }
      `}</style>

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
        initial={{ opacity: 0 }}
        animate={{ opacity: showIntro ? 0 : 1 }}
        transition={{ duration: 1.2 }}
      >
        <div style={{ maxWidth: 600, margin: "0 auto", padding: "56px 20px 80px" }}>

          {/* ── Hero ── */}
          <HeroFrame>
            <p style={{
              fontSize: 11,
              letterSpacing: "0.4em",
              color: "#7A6555",
              textTransform: "uppercase" as const,
              marginBottom: 24,
              fontFamily: "Georgia, 'Times New Roman', serif",
            }}>
              Con todo el amor
            </p>

            <h1
              style={{
                fontSize: "clamp(28px, 6vw, 52px)",
                fontStyle: "italic",
                fontWeight: 700,
                color: "#A0784C",
                lineHeight: 1.2,
                marginBottom: 20,
                fontFamily: "'Playfair Display', serif",
              }}
              data-testid="text-couple-names"
            >
              {wedding?.coupleName}
            </h1>

            <div style={{ display: "flex", alignItems: "center", gap: 14, justifyContent: "center", color: "#A0784C80", marginBottom: 20 }}>
              <div style={{ flex: 1, height: 1, background: "linear-gradient(to right, transparent, #A0784C50)" }} />
              <span style={{ fontSize: 15, color: "#4A3728", fontStyle: "italic", letterSpacing: "0.06em", fontFamily: "Georgia, 'Times New Roman', serif" }} data-testid="text-wedding-date">{wedding?.weddingDate}</span>
              <div style={{ flex: 1, height: 1, background: "linear-gradient(to left, transparent, #A0784C50)" }} />
            </div>

            {wedding?.message && (
              <p style={{ fontSize: 15, color: "#7A6555", fontStyle: "italic", lineHeight: 1.8, maxWidth: 440, margin: "0 auto" }}>
                &ldquo;{wedding.message}&rdquo;
              </p>
            )}

            {wedding?.couplePhotoUrl && (
              <PhotoFrame src={wedding.couplePhotoUrl} alt="Pareja" testId="img-couple" />
            )}
          </HeroFrame>

          <OrnamentDivider symbol="&#10087;" />

          {/* ── Ceremony ── */}
          <AlbumCard label="Ceremonia Religiosa">
            <div className="album-detail"><strong>Lugar</strong><br />{wedding?.churchName}</div>
            <div className="album-detail"><strong>Direcci&oacute;n</strong><br />{wedding?.churchAddress}</div>
            <div className="album-detail" style={{ marginBottom: 20 }}><strong>Hora</strong><br />{wedding?.churchTime}</div>
            <button className="album-btn" style={{ width: "100%" }}
              onClick={() => window.open(`https://maps.google.com/?q=${wedding?.churchAddress}`, "_blank")}
              data-testid="button-map-church">
              Ver en mapa
            </button>
          </AlbumCard>

          {/* ── Venue ── */}
          <AlbumCard label="Recepci&oacute;n">
            <div className="album-detail"><strong>Lugar</strong><br />{wedding?.venueName}</div>
            <div className="album-detail"><strong>Direcci&oacute;n</strong><br />{wedding?.venueAddress}</div>
            <div className="album-detail" style={{ marginBottom: 20 }}><strong>Hora</strong><br />{wedding?.venueTime}</div>
            <button className="album-btn" style={{ width: "100%" }}
              onClick={() => window.open(`https://maps.google.com/?q=${wedding?.venueAddress}`, "_blank")}
              data-testid="button-map-venue">
              Ver en mapa
            </button>
          </AlbumCard>

          {wedding?.dressCode && (
            <AlbumCard label="Vestimenta">
              <p className="album-detail" data-testid="text-dress-code">{wedding.dressCode}</p>
            </AlbumCard>
          )}

          {allowedColors.length > 0 && (
            <AlbumCard label="Colores Permitidos">
              <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }} data-testid="section-allowed-colors">
                {allowedColors.map((color: string, idx: number) => (
                  <div key={idx} style={{ textAlign: "center" }} data-testid={`swatch-color-${idx}`}>
                    <div style={{
                      width: 40, height: 40,
                      borderRadius: "50%",
                      backgroundColor: color,
                      border: "2px solid #A0784C",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                    }} />
                  </div>
                ))}
              </div>
            </AlbumCard>
          )}

          <OrnamentDivider symbol="&#10054;" />

          {/* ── Countdown ── */}
          <AlbumCard label="Cuenta regresiva">
            <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-start", gap: 6, flexWrap: "wrap" }}>
              <CountDigit val={countdown.days}  label="D&iacute;as" />
              <div style={{ color: "#A0784C60", fontSize: 32, lineHeight: "1.1", alignSelf: "flex-start", paddingTop: 14 }}>:</div>
              <CountDigit val={countdown.hours} label="Horas" />
              <div style={{ color: "#A0784C60", fontSize: 32, lineHeight: "1.1", alignSelf: "flex-start", paddingTop: 14 }}>:</div>
              <CountDigit val={countdown.mins}  label="Min" />
              <div style={{ color: "#A0784C60", fontSize: 32, lineHeight: "1.1", alignSelf: "flex-start", paddingTop: 14 }}>:</div>
              <CountDigit val={countdown.secs}  label="Seg" />
            </div>
          </AlbumCard>

          <OrnamentDivider symbol="&#10086;" />

          {/* ── RSVP ── */}
          <AlbumCard label="Confirmar asistencia">
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: 15, marginBottom: 4, color: "#4A3728" }}>
                Invitado: <span style={{ color: "#A0784C", fontStyle: "italic", fontWeight: 600 }} data-testid="text-guest-name">{invitation?.guestName}</span>
              </p>
              <p style={{ fontSize: 13, marginBottom: 24, color: "#7A6555", letterSpacing: "0.04em" }}>
                {invitation?.seats} lugar(es) reservado(s)
              </p>

              {responded || invitation?.status !== "pending" ? (
                <div style={{
                  border: "1px solid #D9C9A8",
                  padding: "24px 20px",
                  background: "#F8F0E0",
                  borderRadius: 6,
                }}>
                  <p style={{ color: "#A0784C", fontSize: 16, fontStyle: "italic", fontFamily: "'Playfair Display', serif" }} data-testid="text-rsvp-status">
                    {invitation?.status === "accepted"
                      ? `¡Nos vemos pronto, ${invitation.guestName}!`
                      : `¡Te extrañaremos, ${invitation?.guestName}!`}
                  </p>
                  <p style={{ fontSize: 11, marginTop: 10, color: "#7A6555", letterSpacing: "0.15em", textTransform: "uppercase" as const }}>Respuesta registrada</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 20, alignItems: "center" }}>
                  <div style={{ width: "100%", maxWidth: 260 }}>
                    <label className="album-label">N&uacute;mero de asistentes</label>
                    <select className="album-select" value={confirmedSeats}
                      onChange={(e) => setConfirmedSeats(parseInt(e.target.value))} data-testid="select-seats">
                      {Array.from({ length: invitation?.seats || 1 }).map((_, i) => (
                        <option key={i + 1} value={i + 1}>{i + 1} persona{i > 0 ? "s" : ""}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
                    <button className="album-btn album-btn-primary"
                      onClick={() => respondMutation.mutate({ status: "accepted", confirmedSeats })}
                      disabled={respondMutation.isPending} data-testid="button-accept">
                      S&iacute;, asistir&eacute;
                    </button>
                    <button className="album-btn"
                      onClick={() => respondMutation.mutate({ status: "declined", confirmedSeats: 0 })}
                      disabled={respondMutation.isPending} data-testid="button-decline">
                      No podr&eacute; ir
                    </button>
                  </div>
                </div>
              )}
            </div>
          </AlbumCard>

          {/* ── Gifts ── */}
          {(wedding?.giftLabel1 || wedding?.giftLabel2) && (
            <AlbumCard label="Mesa de regalos">
              <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                {[
                  { label: wedding?.giftLabel1, url: wedding?.giftUrl1 },
                  { label: wedding?.giftLabel2, url: wedding?.giftUrl2 },
                ].filter(g => g.label && g.url).map((g, i) => (
                  <button key={i} className="album-btn" onClick={() => g.url && window.open(g.url, "_blank")} data-testid={`button-gift-${i}`}>
                    {g.label}
                  </button>
                ))}
              </div>
            </AlbumCard>
          )}

          {/* ── QR Code ── */}
          {invitation?.qrCode && (
            <>
              <OrnamentDivider symbol="&#10054;" />
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                style={{ textAlign: "center" }}
                data-testid="window-qr"
              >
                <label className="album-label" style={{ display: "block", textAlign: "center", marginBottom: 16 }}>Tu pase de entrada</label>
                <div style={{
                  display: "inline-block",
                  border: "1px solid #D9C9A8",
                  padding: 10,
                  borderRadius: 6,
                  background: "white",
                  boxShadow: "0 2px 12px rgba(74,55,40,0.08)",
                }}>
                  <img src={invitation.qrCode} alt="QR" style={{ width: 148, height: 148, display: "block" }} data-testid="img-qr-code" />
                </div>
                <p style={{ fontSize: 11, marginTop: 14, color: "#7A6555", letterSpacing: "0.2em", textTransform: "uppercase" as const }}>Presenta en la entrada</p>
              </motion.div>
            </>
          )}

          {/* ── Footer ── */}
          <OrnamentDivider symbol="&#10087;" />
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            style={{
              textAlign: "center",
              color: "#7A6555",
              fontSize: 12,
              letterSpacing: "0.2em",
              fontFamily: "Georgia, 'Times New Roman', serif",
              lineHeight: 2.2,
              paddingBottom: 20,
            }}
          >
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 14, fontStyle: "italic", color: "#A0784C" }}>{wedding?.coupleName}</div>
            <div>{wedding?.weddingDate}</div>
          </motion.div>
        </div>
      </motion.div>
      <MusicPlayer
        musicUrl={wedding?.musicUrl}
        musicType={wedding?.musicType ?? "none"}
        started={!showIntro}
      />
    </div>
  );
}
