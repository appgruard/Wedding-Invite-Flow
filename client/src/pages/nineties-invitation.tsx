import { useState, useEffect, useRef, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Invitation, Wedding } from "@shared/schema";

type InvitationWithWedding = Invitation & { wedding: Wedding };

/* ─── VCR noise canvas (exact CodePen logic) ────────────────────────────── */
function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (Math.floor(max) - Math.ceil(min) + 1)) + Math.ceil(min);
}

function renderTail(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  const n = randInt(1, 50);
  const dir = Math.random() > 0.5 ? 1 : -1;
  for (let i = 0; i < n; i++) {
    const rad = Math.max(0, randInt(r - 0.01, r));
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
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      style={{
        mixBlendMode: "screen",
        position: "absolute",
        left: 0,
        top: 0,
        zIndex: 9,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    />
  );
}

/* ─── Flying toasters (for when there is no video) ──────────────────────── */
const TOASTERS = Array.from({ length: 9 }, (_, i) => ({
  id: i,
  top: 5 + (i * 11) % 95,
  right: -5 - (i * 17) % 40,
  dur: 5 + (i * 0.7),
  delay: i * 0.5,
}));
const TOASTS = Array.from({ length: 4 }, (_, i) => ({
  id: i + 100,
  top: 15 + (i * 23) % 70,
  right: -15 - (i * 13) % 30,
  dur: 4 + (i * 0.9),
  delay: i * 1.1 + 0.5,
}));

function FlyingToasters({ coupleName }: { coupleName: string }) {
  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      {TOASTERS.map((t) => (
        <div key={t.id} style={{
          position: "absolute",
          top: `${t.top}%`, right: `${t.right}%`,
          animation: `tv90-fly ${t.dur}s ${t.delay}s linear infinite`,
          display: "flex", alignItems: "center",
        }}>
          <div style={{ marginRight: -8, zIndex: 1, animation: "tv90-flapL 0.25s ease-in-out infinite", transformOrigin: "right center" }}>
            <svg viewBox="0 0 40 28" width="36" height="25">
              <ellipse cx="20" cy="14" rx="20" ry="10" fill="#C8C8C8" stroke="#999" strokeWidth="1"/>
              <ellipse cx="20" cy="14" rx="14" ry="7" fill="#E0E0E0"/>
              <line x1="8" y1="14" x2="36" y2="14" stroke="#AAA" strokeWidth="1"/>
            </svg>
          </div>
          <svg viewBox="0 0 64 50" width="60" height="46">
            <rect x="2" y="8" width="60" height="40" rx="6" fill="#BEBEBE" stroke="#707070" strokeWidth="2"/>
            <defs>
              <linearGradient id={`tg${t.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFF" stopOpacity="0.4"/>
                <stop offset="100%" stopColor="#000" stopOpacity="0.1"/>
              </linearGradient>
            </defs>
            <rect x="2" y="8" width="60" height="40" rx="6" fill={`url(#tg${t.id})`}/>
            <rect x="14" y="2" width="12" height="14" rx="2" fill="#707070" stroke="#505050" strokeWidth="1"/>
            <rect x="38" y="2" width="12" height="14" rx="2" fill="#707070" stroke="#505050" strokeWidth="1"/>
            <rect x="8" y="16" width="48" height="4" rx="2" fill="#909090"/>
            <rect x="6" y="22" width="52" height="2" fill="#A0A0A0" rx="1"/>
            <circle cx="10" cy="38" r="4" fill="#C8A800" stroke="#907800" strokeWidth="1"/>
            <circle cx="10" cy="38" r="2" fill="#FFD700"/>
            <rect x="20" y="34" width="28" height="10" rx="2" fill="#909090" stroke="#707070" strokeWidth="1"/>
          </svg>
          <div style={{ marginLeft: -8, zIndex: 1, animation: "tv90-flapR 0.25s ease-in-out infinite", transformOrigin: "left center" }}>
            <svg viewBox="0 0 40 28" width="36" height="25">
              <ellipse cx="20" cy="14" rx="20" ry="10" fill="#C8C8C8" stroke="#999" strokeWidth="1"/>
              <ellipse cx="20" cy="14" rx="14" ry="7" fill="#E0E0E0"/>
              <line x1="4" y1="14" x2="32" y2="14" stroke="#AAA" strokeWidth="1"/>
            </svg>
          </div>
        </div>
      ))}
      {TOASTS.map((t) => (
        <div key={t.id} style={{
          position: "absolute",
          top: `${t.top}%`, right: `${t.right}%`,
          animation: `tv90-fly ${t.dur}s ${t.delay}s linear infinite`,
        }}>
          <svg viewBox="0 0 30 30" width="26" height="26">
            <rect x="2" y="2" width="26" height="26" rx="2" fill="#D4A843" stroke="#8B5A1A" strokeWidth="1.5"/>
            <rect x="5" y="5" width="20" height="3" rx="1" fill="#B8863A" opacity="0.7"/>
            <rect x="5" y="10" width="20" height="3" rx="1" fill="#B8863A" opacity="0.5"/>
            <rect x="5" y="15" width="14" height="3" rx="1" fill="#B8863A" opacity="0.3"/>
          </svg>
        </div>
      ))}
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        color: "white", textAlign: "center", pointerEvents: "none",
        fontFamily: "monospace",
      }}>
        <p style={{ fontSize: "clamp(14px,2.5vw,22px)", fontWeight: "bold", textShadow: "0 0 20px #0ff, 0 0 40px #0ff", marginBottom: 8 }}>
          {coupleName}
        </p>
        <p style={{ fontSize: "clamp(10px,1.5vw,14px)", opacity: 0.7 }}>Cargando Invitación.exe...</p>
      </div>
    </div>
  );
}

/* ─── TV 90 Intro wrapper (CodePen tv90) ────────────────────────────────── */
function TV90Intro({ wedding }: { wedding: Wedding }) {
  const [snow, setSnow] = useState(false);

  const videoId = wedding.videoType === "youtube" && wedding.videoUrl
    ? (wedding.videoUrl.includes("youtu.be/")
        ? wedding.videoUrl.split("youtu.be/")[1]?.split("?")[0]
        : wedding.videoUrl.split("v=")[1]?.split("&")[0])
    : null;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "#000",
      display: "flex", alignItems: "center", justifyContent: "center",
      overflow: "hidden",
    }}>
      {/* TV outer shell image */}
      <div style={{
        position: "absolute",
        width: "90vw", height: "50vw",
        maxWidth: "100%", maxHeight: "100vh",
        backgroundImage: "url(https://alexandrevacassin.fr/codepen/old-tv/base.webp)",
        zIndex: 10,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        pointerEvents: "none",
      }} />

      {/* TV screen content container */}
      <div style={{
        position: "absolute",
        marginBottom: "3vw",
        width: "60vw",
        marginRight: "10vw",
        height: "45vw",
        maxWidth: "100%",
        maxHeight: "70vh",
        zIndex: 1,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
      }}>
        {/* VCR noise */}
        <VCRCanvas />

        {/* Content */}
        {videoId ? (
          <iframe
            title="wedding-video"
            style={{ width: "100%", height: "100%", border: "none", filter: "contrast(1.2) brightness(1.1)" }}
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&controls=0&loop=1&mute=1`}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        ) : wedding.videoType === "mp4" && wedding.videoUrl ? (
          <video
            style={{ width: "100%", height: "100%", filter: "contrast(1.2) brightness(1.1)" }}
            autoPlay muted playsInline loop
          >
            <source src={wedding.videoUrl} type="video/mp4" />
          </video>
        ) : (
          <FlyingToasters coupleName={wedding.coupleName} />
        )}

        {/* Glitch overlay */}
        <div style={{
          pointerEvents: "none",
          position: "absolute", top: 0, left: 0,
          width: "100%", height: "100%",
          background: "url('https://upload.wikimedia.org/wikipedia/commons/0/02/Television_static.gif')",
          mixBlendMode: "multiply",
          opacity: 0.3,
          animation: "tv90-glitch 0.2s infinite linear",
          zIndex: 2,
        }} />

        {/* Scan lines */}
        <div style={{
          position: "absolute", top: 0, left: 0,
          width: "100%", height: "100%",
          background: "repeating-linear-gradient(to bottom, rgba(0,0,0,0) 0px, rgba(0,0,0,0.2) 1px, rgba(0,0,0,0) 2px)",
          pointerEvents: "none",
          zIndex: 2,
        }} />

        {/* Snow effect (channel switch) */}
        <div style={{
          position: "absolute", top: 0, left: 0,
          width: "100%", height: "100%",
          background: "url('https://upload.wikimedia.org/wikipedia/commons/0/02/Television_static.gif')",
          backgroundSize: "cover",
          opacity: snow ? 1 : 0,
          zIndex: 3,
          pointerEvents: "none",
          transition: "opacity 0.5s ease-in-out",
        }} />
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
    queryKey: previewTemplate
      ? ["/api/demo", previewTemplate]
      : ["/api/invitations", invitationId],
    queryFn: previewTemplate
      ? async () => { const r = await fetch(`/api/demo/${previewTemplate}`); return r.json(); }
      : undefined,
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
    if (!wedding?.weddingDate) return { days: 12, hours: 5, mins: 42, secs: 10, progress: 65 };
    const now = Date.now();
    const target = new Date(wedding.weddingDate).getTime();
    const diff = Math.max(0, target - now);
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    const progress = isNaN(target) ? 65 : Math.min(99, Math.max(1, 100 - (diff / (365 * 86400000)) * 100));
    return {
      days: isNaN(target) ? 12 : days,
      hours: isNaN(target) ? 5 : hours,
      mins: isNaN(target) ? 42 : mins,
      secs: isNaN(target) ? 10 : secs,
      progress: isNaN(progress) ? 65 : Math.round(progress),
    };
  }, [wedding, clock]);

  if (isLoading || !data) {
    return <div className="min-h-screen bg-[#008080] flex items-center justify-center text-white font-mono">Cargando Boda.exe...</div>;
  }

  return (
    <div className="min-h-screen bg-[#008080] overflow-x-hidden text-black" style={{ fontFamily: "'Arial', sans-serif" }}>
      <style>{`
        @keyframes tv90-fly    { 0%{transform:translate(0,0);opacity:1} 100%{transform:translate(-140vw,120vh);opacity:.8} }
        @keyframes tv90-flapL  { 0%,100%{transform:rotate(-30deg)} 50%{transform:rotate(10deg)} }
        @keyframes tv90-flapR  { 0%,100%{transform:rotate(30deg)}  50%{transform:rotate(-10deg)} }
        @keyframes tv90-glitch { 0%{transform:translateX(0)} 33%{transform:translateX(-5px)} 66%{transform:translateX(5px)} 100%{transform:translateX(0)} }
        @keyframes tv90-scan   { 0%{transform:translateY(-100%)} 100%{transform:translateY(100vh)} }
        @keyframes tv90-blink  { 0%,100%{opacity:1} 50%{opacity:0} }

        .win-window {
          background:#C0C0C0;
          border-top:2px solid #FFF; border-left:2px solid #FFF;
          border-right:2px solid #808080; border-bottom:2px solid #808080;
          box-shadow:1px 1px 0 #000;
          padding:2px; margin-bottom:20px;
        }
        .win-title-bar {
          background:linear-gradient(90deg,#000080,#1084d0);
          color:white; padding:3px 6px;
          display:flex; align-items:center; justify-content:space-between;
          font-weight:bold; font-size:13px; user-select:none;
        }
        .win-title-buttons { display:flex; gap:2px; }
        .win-btn-small {
          width:16px; height:14px; background:#C0C0C0;
          border-top:1px solid #FFF; border-left:1px solid #FFF;
          border-right:1px solid #808080; border-bottom:1px solid #808080;
          color:black; font-size:10px;
          display:flex; align-items:center; justify-content:center; cursor:pointer;
        }
        .win-content { padding:10px; }
        .win-inset {
          background:#FFF;
          border-top:2px solid #808080; border-left:2px solid #808080;
          border-right:2px solid #FFF; border-bottom:2px solid #FFF;
          padding:10px;
        }
        .win-button {
          background:#C0C0C0;
          border-top:2px solid #FFF; border-left:2px solid #FFF;
          border-right:2px solid #808080; border-bottom:2px solid #808080;
          box-shadow:1px 1px 0 #000;
          padding:4px 16px; cursor:pointer; font-size:13px; outline:none;
        }
        .win-button:active {
          border-top:2px solid #808080; border-left:2px solid #808080;
          border-right:2px solid #FFF; border-bottom:2px solid #FFF;
          box-shadow:none; transform:translate(1px,1px);
        }
        .win-progress-bg {
          height:20px; background:#C0C0C0;
          border-top:1px solid #808080; border-left:1px solid #808080;
          border-right:1px solid #FFF; border-bottom:1px solid #FFF;
          position:relative; overflow:hidden;
        }
        .win-progress-fill { height:100%; display:flex; gap:2px; padding:2px; }
        .win-progress-block { width:10px; height:100%; background:#000080; flex-shrink:0; }
        .start-bar {
          position:fixed; bottom:0; left:0; right:0;
          height:30px; background:#C0C0C0;
          border-top:2px solid #FFF;
          display:flex; align-items:center; padding:0 4px; z-index:200;
        }
        .start-button {
          font-weight:bold; display:flex; align-items:center;
          gap:4px; padding:2px 8px; background:#C0C0C0;
          border-top:2px solid #FFF; border-left:2px solid #FFF;
          border-right:2px solid #808080; border-bottom:2px solid #808080;
          box-shadow:1px 1px 0 #000; font-size:13px; cursor:pointer;
        }
        .task-item {
          border-top:1px solid #808080; border-left:1px solid #808080;
          border-right:1px solid #FFF; border-bottom:1px solid #FFF;
          padding:2px 8px; font-size:12px; margin-left:4px; background:#B0B0B0;
        }
        .tv-channel-badge {
          position:fixed; top:12px; right:16px; z-index:300;
          background:#000; color:#fff;
          font-family:monospace; font-size:11px;
          padding:2px 8px; border:1px solid #555;
          opacity:0.7;
        }
        .scanline-bar {
          position:absolute; left:0; right:0; height:2px;
          background:rgba(255,255,255,0.08);
          animation:tv90-scan 4s linear infinite;
          pointer-events:none;
        }
      `}</style>

      {/* TV Intro */}
      <AnimatePresence>
        {showIntro && wedding && (
          <motion.div key="intro" exit={{ opacity: 0 }} transition={{ duration: 1.2 }}>
            <TV90Intro wedding={wedding} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main invitation content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showIntro ? 0 : 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Channel badge */}
        <div className="tv-channel-badge" data-testid="text-channel">📺 CH-{Math.floor(Math.random() * 30) + 2}</div>

        <div className="max-w-3xl mx-auto pt-8 pb-36 px-4">

          {/* Main title window */}
          <div className="win-window" data-testid="window-main">
            <div className="win-title-bar">
              <span>📺 Invitación.exe — Boda TV</span>
              <div className="win-title-buttons">
                <div className="win-btn-small">_</div>
                <div className="win-btn-small">□</div>
                <div className="win-btn-small">✕</div>
              </div>
            </div>
            <div className="win-content">
              <div className="win-inset text-center space-y-3">
                <h1 className="text-2xl font-bold uppercase tracking-widest" data-testid="text-couple-names">
                  {wedding?.coupleName}
                </h1>
                <p className="text-lg" data-testid="text-wedding-date">{wedding?.weddingDate}</p>
                <div style={{ borderTop: "1px solid #808080", margin: "12px 0" }} />
                <p className="italic text-sm leading-relaxed">
                  "{wedding?.message || "¡Acompáñanos en este día tan especial!"}"
                </p>
                {wedding?.couplePhotoUrl && (
                  <div className="win-window inline-block p-1 mt-2">
                    <img
                      src={wedding.couplePhotoUrl}
                      alt="Pareja"
                      className="max-w-[200px] border border-black"
                      data-testid="img-couple"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Ceremony + Venue windows */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="win-window" data-testid="window-church">
              <div className="win-title-bar">
                <span>⛪ Ceremonia_Religiosa.cfg</span>
                <div className="win-title-buttons"><div className="win-btn-small">✕</div></div>
              </div>
              <div className="win-content space-y-2 text-sm">
                <p><strong>Lugar:</strong> {wedding?.churchName}</p>
                <p><strong>Dirección:</strong> {wedding?.churchAddress}</p>
                <p><strong>Hora:</strong> {wedding?.churchTime}</p>
                <button
                  className="win-button w-full mt-2"
                  onClick={() => window.open(`https://maps.google.com/?q=${wedding?.churchAddress}`, "_blank")}
                  data-testid="button-map-church"
                >
                  Abrir en Mapa
                </button>
              </div>
            </div>

            <div className="win-window" data-testid="window-venue">
              <div className="win-title-bar">
                <span>🎉 Recepción_Detalles.cfg</span>
                <div className="win-title-buttons"><div className="win-btn-small">✕</div></div>
              </div>
              <div className="win-content space-y-2 text-sm">
                <p><strong>Lugar:</strong> {wedding?.venueName}</p>
                <p><strong>Dirección:</strong> {wedding?.venueAddress}</p>
                <p><strong>Hora:</strong> {wedding?.venueTime}</p>
                <button
                  className="win-button w-full mt-2"
                  onClick={() => window.open(`https://maps.google.com/?q=${wedding?.venueAddress}`, "_blank")}
                  data-testid="button-map-venue"
                >
                  Abrir en Mapa
                </button>
              </div>
            </div>
          </div>

          {/* Dress code */}
          {wedding?.dressCode && (
            <div className="win-window" data-testid="window-dresscode">
              <div className="win-title-bar">
                <span>👔 Código_de_Vestimenta.txt</span>
              </div>
              <div className="win-content">
                <div className="win-inset text-sm">
                  <p><strong>Vestimenta requerida:</strong> {wedding.dressCode}</p>
                </div>
              </div>
            </div>
          )}

          {/* Countdown */}
          <div className="win-window" data-testid="window-countdown">
            <div className="win-title-bar">
              <span>⏳ Progreso_Instalación_Boda.exe</span>
            </div>
            <div className="win-content space-y-3">
              <p className="text-sm">Calculando tiempo hasta el gran día...</p>
              <div className="win-progress-bg">
                <div className="win-progress-fill" style={{ width: `${countdown.progress}%` }}>
                  {Array.from({ length: Math.floor(countdown.progress / 4) }).map((_, i) => (
                    <div key={i} className="win-progress-block" />
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-4 text-center text-xs font-mono gap-1">
                <div className="win-inset p-1"><div className="font-bold text-base">{countdown.days}</div><div>Días</div></div>
                <div className="win-inset p-1"><div className="font-bold text-base">{countdown.hours}</div><div>Horas</div></div>
                <div className="win-inset p-1"><div className="font-bold text-base">{countdown.mins}</div><div>Min</div></div>
                <div className="win-inset p-1"><div className="font-bold text-base">{countdown.secs}</div><div>Seg</div></div>
              </div>
            </div>
          </div>

          {/* RSVP Dialog */}
          <div className="win-window max-w-md mx-auto" data-testid="window-rsvp">
            <div className="win-title-bar">
              <span>📨 Confirmar_Asistencia.exe</span>
              <div className="win-title-buttons"><div className="win-btn-small">✕</div></div>
            </div>
            <div className="win-content text-center space-y-4">
              <p className="text-sm"><strong>Invitado:</strong> <span data-testid="text-guest-name">{invitation?.guestName}</span></p>
              <p className="text-sm">Tienes <span className="font-bold" data-testid="text-assigned-seats">{invitation?.seats}</span> lugar(es) reservado(s).</p>
              {responded || invitation?.status !== "pending" ? (
                <div className="win-inset bg-white text-center p-4">
                  <p className="text-sm font-bold text-blue-900" data-testid="text-rsvp-status">
                    {invitation?.status === "accepted"
                      ? `¡Nos vemos pronto, ${invitation.guestName}! 🎉`
                      : `¡Te extrañaremos, ${invitation?.guestName}!`}
                  </p>
                  <p className="text-xs mt-2 text-gray-600">Respuesta registrada exitosamente.</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-center gap-3 text-sm">
                    <label>Asistentes:</label>
                    <select
                      className="win-inset py-1 px-2 text-sm outline-none"
                      value={confirmedSeats}
                      onChange={(e) => setConfirmedSeats(parseInt(e.target.value))}
                      data-testid="select-seats"
                    >
                      {Array.from({ length: invitation?.seats || 1 }).map((_, i) => (
                        <option key={i + 1} value={i + 1}>{i + 1} persona{i > 0 ? "s" : ""}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex justify-center gap-4">
                    <button
                      className="win-button"
                      onClick={() => respondMutation.mutate({ status: "accepted", confirmedSeats })}
                      disabled={respondMutation.isPending}
                      data-testid="button-accept"
                    >
                      ✅ Sí, asistiré
                    </button>
                    <button
                      className="win-button"
                      onClick={() => respondMutation.mutate({ status: "declined", confirmedSeats: 0 })}
                      disabled={respondMutation.isPending}
                      data-testid="button-decline"
                    >
                      ❌ No podré ir
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Gifts window */}
          {(wedding?.giftLabel1 || wedding?.giftLabel2) && (
            <div className="win-window" data-testid="window-gifts">
              <div className="win-title-bar">
                <span>🎁 C:\Boda\Mesa_de_Regalos</span>
                <div className="win-title-buttons"><div className="win-btn-small">✕</div></div>
              </div>
              <div className="win-content">
                <div className="win-inset bg-white p-0">
                  <table className="w-full text-sm text-left border-collapse">
                    <thead className="bg-gray-200 border-b border-gray-400">
                      <tr>
                        <th className="px-2 py-1">Nombre</th>
                        <th className="px-2 py-1">Tipo</th>
                        <th className="px-2 py-1">Enlace</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { label: wedding?.giftLabel1, url: wedding?.giftUrl1 },
                        { label: wedding?.giftLabel2, url: wedding?.giftUrl2 },
                      ].filter(g => g.label && g.url).map((gift, idx) => (
                        <tr key={idx} className="hover:bg-blue-800 hover:text-white cursor-pointer group">
                          <td className="px-2 py-1">📁 {gift.label}</td>
                          <td className="px-2 py-1">Mesa de regalos</td>
                          <td className="px-2 py-1">
                            <button
                              className="text-blue-600 group-hover:text-white underline"
                              onClick={() => gift.url && window.open(gift.url, "_blank")}
                              data-testid={`button-gift-${idx}`}
                            >
                              Visitar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* QR Code */}
          {invitation?.qrCode && (
            <div className="win-window max-w-[260px] mx-auto" data-testid="window-qr">
              <div className="win-title-bar"><span>🔐 Acceso_Seguro.exe</span></div>
              <div className="win-content text-center">
                <div className="win-inset inline-block">
                  <img src={invitation.qrCode} alt="QR" className="w-40 h-40" data-testid="img-qr-code" />
                </div>
                <p className="text-[10px] mt-2 text-gray-600 uppercase tracking-wider">Token de entrada válido</p>
              </div>
            </div>
          )}
        </div>

        {/* Start Bar */}
        <div className="start-bar">
          <button className="start-button" data-testid="button-start">
            <span>💾</span> Inicio
          </button>
          <div className="task-item">Boda.exe</div>
          <div className="task-item">TV Invitación</div>
          <div className="flex-1" />
          <div className="win-inset py-0 px-2 flex items-center gap-1 text-xs font-mono" style={{ borderRadius: 0 }}>
            <span>📺</span>
            <span>{clock.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
