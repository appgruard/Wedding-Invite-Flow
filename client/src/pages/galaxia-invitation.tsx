import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { MusicPlayer } from "@/components/music-player";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Invitation, Wedding } from "@shared/schema";

type InvitationWithWedding = Invitation & { wedding: Wedding };

const GOLD = "#D4AF37";
const NAVY = "#0B0D21";
const SILVER = "#E8E8F0";
const GOLD_DIM = "#D4AF3780";
const NAVY_LIGHT = "#141833";
const GLASS_BG = "rgba(11, 13, 33, 0.55)";
const GLASS_BORDER = "rgba(212, 175, 55, 0.2)";

function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf: number;

    const layers = [
      { count: 120, speed: 0.15, size: 1, opacity: 0.4 },
      { count: 80, speed: 0.3, size: 1.5, opacity: 0.6 },
      { count: 40, speed: 0.5, size: 2, opacity: 0.85 },
    ];

    type Star = { x: number; y: number; size: number; opacity: number; twinkleSpeed: number; layerSpeed: number };
    let stars: Star[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      stars = [];
      for (const layer of layers) {
        for (let i = 0; i < layer.count; i++) {
          stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height * 3,
            size: layer.size + Math.random() * 0.5,
            opacity: layer.opacity * (0.5 + Math.random() * 0.5),
            twinkleSpeed: 0.5 + Math.random() * 2,
            layerSpeed: layer.speed,
          });
        }
      }
    };
    resize();
    window.addEventListener("resize", resize);

    const handleScroll = () => { scrollRef.current = window.scrollY; };
    window.addEventListener("scroll", handleScroll, { passive: true });

    let t = 0;
    const draw = () => {
      t += 0.016;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const scroll = scrollRef.current;

      for (const star of stars) {
        const parallaxY = (star.y - scroll * star.layerSpeed) % (canvas.height * 3);
        const drawY = parallaxY < 0 ? parallaxY + canvas.height * 3 : parallaxY;
        if (drawY > canvas.height) continue;

        const twinkle = 0.5 + 0.5 * Math.sin(t * star.twinkleSpeed + star.x);
        ctx.globalAlpha = star.opacity * twinkle;
        ctx.fillStyle = SILVER;
        ctx.beginPath();
        ctx.arc(star.x, drawY, star.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}

function ShootingStar({ delay, top, duration }: { delay: number; top: string; duration: number }) {
  return (
    <div
      style={{
        position: "absolute",
        top,
        right: "-10%",
        width: 120,
        height: 2,
        background: `linear-gradient(to left, transparent, ${GOLD}, transparent)`,
        borderRadius: 999,
        opacity: 0,
        animation: `galaxia-shoot ${duration}s ${delay}s ease-in infinite`,
        boxShadow: `0 0 8px ${GOLD}, 0 0 20px ${GOLD_DIM}`,
      }}
    />
  );
}

function GalaxiaIntro({ coupleName }: { coupleName: string }) {
  const [name1, name2] = coupleName.includes("&")
    ? coupleName.split("&").map((s) => s.trim())
    : [coupleName, ""];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: NAVY,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        cursor: "pointer",
      }}
    >
      <style>{`
        @keyframes galaxia-constellation-in {
          0% { opacity: 0; transform: scale(0.7); filter: blur(10px); }
          60% { opacity: 1; transform: scale(1.05); filter: blur(0px); }
          100% { opacity: 1; transform: scale(1); filter: blur(0px); }
        }
        @keyframes galaxia-glow-pulse {
          0%, 100% { text-shadow: 0 0 20px rgba(212,175,55,0.3), 0 0 40px rgba(212,175,55,0.1); }
          50% { text-shadow: 0 0 30px rgba(212,175,55,0.6), 0 0 60px rgba(212,175,55,0.3), 0 0 100px rgba(212,175,55,0.1); }
        }
        @keyframes galaxia-line-grow {
          0% { width: 0; opacity: 0; }
          100% { width: 120px; opacity: 1; }
        }
        @keyframes galaxia-subtitle-in {
          0% { opacity: 0; letter-spacing: 1em; }
          100% { opacity: 0.6; letter-spacing: 0.4em; }
        }
      `}</style>

      {[0.5, 2.2, 4, 1.3, 3.5].map((d, i) => (
        <ShootingStar key={i} delay={d} top={`${10 + i * 18}%`} duration={2.5 + i * 0.3} />
      ))}

      <div style={{ textAlign: "center", zIndex: 2 }}>
        <div
          style={{
            animation: "galaxia-constellation-in 2s 0.5s ease-out both",
            fontFamily: "'Cormorant Garamond', serif",
          }}
        >
          <p
            style={{
              color: GOLD,
              fontSize: "clamp(32px, 7vw, 64px)",
              fontWeight: 300,
              lineHeight: 1.2,
              animation: "galaxia-glow-pulse 3s 1.5s ease-in-out infinite",
              letterSpacing: "0.05em",
            }}
          >
            {name1}
          </p>
          {name2 && (
            <>
              <p
                style={{
                  color: SILVER,
                  fontSize: "clamp(16px, 3vw, 24px)",
                  margin: "8px 0",
                  opacity: 0.7,
                  fontWeight: 300,
                }}
              >
                &
              </p>
              <p
                style={{
                  color: GOLD,
                  fontSize: "clamp(32px, 7vw, 64px)",
                  fontWeight: 300,
                  lineHeight: 1.2,
                  animation: "galaxia-glow-pulse 3s 2s ease-in-out infinite",
                  letterSpacing: "0.05em",
                }}
              >
                {name2}
              </p>
            </>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginTop: 24 }}>
          <div style={{ height: 1, background: `linear-gradient(to right, transparent, ${GOLD})`, animation: "galaxia-line-grow 1.5s 1.8s ease-out both" }} />
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: GOLD,
              boxShadow: `0 0 12px ${GOLD}`,
              animation: "galaxia-constellation-in 1s 2s ease-out both",
            }}
          />
          <div style={{ height: 1, background: `linear-gradient(to left, transparent, ${GOLD})`, animation: "galaxia-line-grow 1.5s 1.8s ease-out both" }} />
        </div>

        <p
          style={{
            color: SILVER,
            fontSize: "clamp(10px, 1.5vw, 14px)",
            marginTop: 20,
            fontFamily: "'Cormorant Garamond', serif",
            textTransform: "uppercase",
            animation: "galaxia-subtitle-in 2s 2.5s ease-out both",
            opacity: 0,
          }}
        >
          Los astros se alinean
        </p>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 32,
          left: 0,
          right: 0,
          textAlign: "center",
          pointerEvents: "none",
        }}
      >
        <span
          style={{
            color: `${SILVER}99`,
            fontSize: 12,
            letterSpacing: "0.15em",
            fontFamily: "'Cormorant Garamond', serif",
          }}
        >
          Toca para continuar
        </span>
      </div>
    </div>
  );
}

function GlassCard({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      style={{
        marginBottom: 32,
        background: GLASS_BG,
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: `1px solid ${GLASS_BORDER}`,
        borderRadius: 12,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          borderBottom: `1px solid ${GLASS_BORDER}`,
          padding: "12px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          background: "rgba(212, 175, 55, 0.05)",
        }}
      >
        <div style={{ width: 4, height: 4, borderRadius: "50%", background: GOLD, opacity: 0.5 }} />
        <span
          style={{
            color: GOLD,
            fontSize: 11,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 600,
          }}
        >
          {label}
        </span>
        <div style={{ width: 4, height: 4, borderRadius: "50%", background: GOLD, opacity: 0.5 }} />
      </div>
      <div style={{ padding: "28px 28px", color: SILVER }}>
        {children}
      </div>
    </motion.div>
  );
}

function CelestialDivider() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, margin: "36px auto", maxWidth: 480, color: GOLD }}>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, transparent, ${GOLD_DIM})` }} />
      <svg width="24" height="24" viewBox="0 0 24 24" style={{ margin: "0 16px", opacity: 0.6 }}>
        <path d="M12 2l2.4 7.2H22l-6 4.8 2.4 7.2L12 16.4l-6.4 4.8 2.4-7.2-6-4.8h7.6z" fill={GOLD} opacity="0.7" />
      </svg>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(to left, transparent, ${GOLD_DIM})` }} />
    </div>
  );
}

function OrbitalCountdown({ days, hours, mins, secs }: { days: number; hours: number; mins: number; secs: number }) {
  const units = [
    { val: days, label: "Días" },
    { val: hours, label: "Horas" },
    { val: mins, label: "Min" },
    { val: secs, label: "Seg" },
  ];
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-start", gap: 8, flexWrap: "wrap" }}>
      {units.map((u, i) => (
        <div key={u.label} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                position: "relative",
                width: 68,
                height: 68,
                borderRadius: "50%",
                border: `2px solid ${GOLD_DIM}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(212, 175, 55, 0.05)",
                boxShadow: `0 0 20px rgba(212, 175, 55, 0.08), inset 0 0 20px rgba(212, 175, 55, 0.03)`,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: -3,
                  left: "50%",
                  transform: `translateX(-50%) rotate(${(u.val / (i === 0 ? 365 : i === 1 ? 24 : 60)) * 360}deg)`,
                  transformOrigin: "center 37px",
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: GOLD,
                  boxShadow: `0 0 6px ${GOLD}`,
                }}
              />
              <span
                style={{
                  fontSize: "clamp(22px, 4vw, 30px)",
                  fontWeight: 300,
                  color: GOLD,
                  fontFamily: "'Cormorant Garamond', serif",
                }}
              >
                {String(u.val).padStart(2, "0")}
              </span>
            </div>
            <p
              style={{
                fontSize: 10,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: `${SILVER}99`,
                marginTop: 8,
                fontFamily: "'Cormorant Garamond', serif",
              }}
            >
              {u.label}
            </p>
          </div>
          {i < 3 && (
            <span style={{ color: `${GOLD}40`, fontSize: 28, lineHeight: "68px", fontWeight: 300 }}>:</span>
          )}
        </div>
      ))}
    </div>
  );
}

export default function GalaxiaInvitationPage() {
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
  const allowedColors: string[] = useMemo(() => {
    try { return JSON.parse(wedding?.allowedColors || "[]"); } catch { return []; }
  }, [wedding?.allowedColors]);

  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (wedding) {
      const dur = wedding.introDuration || 6000;
      const t = setTimeout(() => setShowIntro(false), dur);
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
    onError: () => toast({ title: "Error", description: "No se pudo enviar tu respuesta.", variant: "destructive" }),
  });

  const countdown = useMemo(() => {
    const target = wedding?.weddingDate ? (() => {
      const clean = wedding.weddingDate.toLowerCase().replace(/\./g, "").trim();
      const match = clean.match(/(\d{1,2})\s+de\s+(\w+)\s+de\s+(\d{4})/);
      if (!match) return NaN;
      const months: Record<string, number> = {
        enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5,
        julio: 6, agosto: 7, septiembre: 8, octubre: 9, noviembre: 10, diciembre: 11,
      };
      const m = months[match[2]];
      if (m === undefined) return NaN;
      return new Date(parseInt(match[3]), m, parseInt(match[1]), 18, 0, 0).getTime();
    })() : NaN;
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
      <div
        style={{
          minHeight: "100vh",
          background: NAVY,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            border: `2px solid ${GOLD_DIM}`,
            borderTopColor: GOLD,
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: NAVY,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
        }}
      >
        <p style={{ color: `${SILVER}99`, fontFamily: "'Cormorant Garamond', serif", fontSize: 16 }}>
          Error al cargar la invitación.
        </p>
        <button
          onClick={() => queryClient.resetQueries({ queryKey: ["/api/invitations", invitationId] })}
          style={{
            padding: "10px 28px",
            background: GOLD,
            color: NAVY,
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 14,
            fontWeight: 600,
            letterSpacing: "0.1em",
          }}
          data-testid="button-retry"
        >
          Reintentar
        </button>
      </div>
    );
  }

  const [name1, name2] = (wedding?.coupleName || "").includes("&")
    ? (wedding?.coupleName || "").split("&").map((s) => s.trim())
    : [wedding?.coupleName || "", ""];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `linear-gradient(180deg, ${NAVY} 0%, #0a0e2a 30%, #0d1030 60%, ${NAVY} 100%)`,
        color: SILVER,
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        position: "relative",
        overflowX: "hidden",
      }}
    >
      <style>{`
        @keyframes galaxia-shoot {
          0%   { transform: translateX(0) rotate(-25deg); opacity: 0; }
          10%  { opacity: 1; }
          100% { transform: translateX(-120vw) rotate(-25deg); opacity: 0; }
        }
        .galaxia-btn {
          display: inline-block;
          background: transparent;
          border: 1px solid ${GOLD_DIM};
          color: ${GOLD};
          padding: 10px 28px;
          font-family: 'Cormorant Garamond', serif;
          font-size: 14px;
          letter-spacing: 0.12em;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .galaxia-btn:hover {
          background: rgba(212, 175, 55, 0.1);
          border-color: ${GOLD};
          box-shadow: 0 0 16px rgba(212, 175, 55, 0.15);
        }
        .galaxia-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .galaxia-btn-primary {
          background: linear-gradient(135deg, ${GOLD}, #B8962E);
          border: none;
          color: ${NAVY};
          font-weight: 700;
        }
        .galaxia-btn-primary:hover {
          background: linear-gradient(135deg, #E0C04A, ${GOLD});
          box-shadow: 0 0 24px rgba(212, 175, 55, 0.3);
        }
        .galaxia-select {
          background: rgba(11, 13, 33, 0.7);
          border: 1px solid ${GOLD_DIM};
          color: ${SILVER};
          padding: 10px 14px;
          font-family: 'Cormorant Garamond', serif;
          font-size: 14px;
          border-radius: 8px;
          cursor: pointer;
          outline: none;
          width: 100%;
          appearance: none;
        }
        .galaxia-select:focus {
          border-color: ${GOLD};
          box-shadow: 0 0 0 2px rgba(212, 175, 55, 0.15);
        }
        .galaxia-select option {
          background: ${NAVY};
          color: ${SILVER};
        }
        .galaxia-detail {
          font-size: 15px;
          color: ${SILVER};
          margin-bottom: 12px;
          line-height: 1.7;
        }
        .galaxia-detail strong {
          color: ${GOLD};
          font-weight: 600;
        }
        .galaxia-label {
          font-size: 11px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: ${SILVER}99;
          display: block;
          margin-bottom: 8px;
        }
      `}</style>

      <Starfield />

      <AnimatePresence>
        {showIntro && wedding && (
          <motion.div
            key="intro"
            exit={{ opacity: 0 }}
            transition={{ duration: 1.4 }}
            onClick={() => setShowIntro(false)}
          >
            <GalaxiaIntro coupleName={wedding.coupleName} />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showIntro ? 0 : 1 }}
        transition={{ duration: 1.2 }}
      >
        <div style={{ maxWidth: 600, margin: "0 auto", padding: "56px 20px 80px", position: "relative", zIndex: 1 }}>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{ position: "relative", padding: "52px 32px", textAlign: "center", marginBottom: 36 }}
          >
            <div style={{ position: "absolute", top: 0, left: 0, width: 28, height: 28, borderTop: `1px solid ${GOLD_DIM}`, borderLeft: `1px solid ${GOLD_DIM}` }} />
            <div style={{ position: "absolute", top: 0, right: 0, width: 28, height: 28, borderTop: `1px solid ${GOLD_DIM}`, borderRight: `1px solid ${GOLD_DIM}` }} />
            <div style={{ position: "absolute", bottom: 0, left: 0, width: 28, height: 28, borderBottom: `1px solid ${GOLD_DIM}`, borderLeft: `1px solid ${GOLD_DIM}` }} />
            <div style={{ position: "absolute", bottom: 0, right: 0, width: 28, height: 28, borderBottom: `1px solid ${GOLD_DIM}`, borderRight: `1px solid ${GOLD_DIM}` }} />

            <p style={{ fontSize: 11, letterSpacing: "0.5em", color: `${SILVER}88`, textTransform: "uppercase", marginBottom: 24 }}>
              Los astros se alinean para
            </p>

            <h1
              style={{
                fontSize: "clamp(30px, 7vw, 56px)",
                fontWeight: 300,
                color: GOLD,
                lineHeight: 1.2,
                marginBottom: 4,
                letterSpacing: "0.03em",
                textShadow: `0 0 30px rgba(212, 175, 55, 0.2)`,
              }}
              data-testid="text-couple-names"
            >
              {name1}
              {name2 && (
                <>
                  <span style={{ display: "block", fontSize: "clamp(18px, 3vw, 26px)", color: `${SILVER}88`, margin: "4px 0", fontWeight: 300 }}>&</span>
                  {name2}
                </>
              )}
            </h1>

            <div style={{ display: "flex", alignItems: "center", gap: 14, justifyContent: "center", margin: "20px 0" }}>
              <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, transparent, ${GOLD_DIM})` }} />
              <span style={{ fontSize: 15, color: `${SILVER}CC`, fontStyle: "italic", letterSpacing: "0.06em" }} data-testid="text-wedding-date">
                {wedding?.weddingDate}
              </span>
              <div style={{ flex: 1, height: 1, background: `linear-gradient(to left, transparent, ${GOLD_DIM})` }} />
            </div>

            {wedding?.message && (
              <p style={{ fontSize: 15, color: `${SILVER}AA`, fontStyle: "italic", lineHeight: 1.8, maxWidth: 440, margin: "0 auto" }}>
                &ldquo;{wedding.message}&rdquo;
              </p>
            )}

            {wedding?.couplePhotoUrl && (
              <div style={{ display: "inline-block", position: "relative", marginTop: 28 }}>
                <div
                  style={{
                    padding: 4,
                    background: `linear-gradient(135deg, ${GOLD_DIM}, transparent, ${GOLD_DIM})`,
                    borderRadius: "50%",
                    boxShadow: `0 0 40px rgba(212, 175, 55, 0.1)`,
                  }}
                >
                  <img
                    src={wedding.couplePhotoUrl}
                    alt="Pareja"
                    style={{
                      width: 200,
                      height: 200,
                      objectFit: "cover",
                      borderRadius: "50%",
                      display: "block",
                      border: `2px solid ${NAVY}`,
                    }}
                    data-testid="img-couple"
                  />
                </div>
              </div>
            )}
          </motion.div>

          <CelestialDivider />

          <GlassCard label="Ceremonia Religiosa">
            <div className="galaxia-detail"><strong>Lugar</strong><br />{wedding?.churchName}</div>
            <div className="galaxia-detail"><strong>Direcci&oacute;n</strong><br />{wedding?.churchAddress}</div>
            <div className="galaxia-detail" style={{ marginBottom: 20 }}><strong>Hora</strong><br />{wedding?.churchTime}</div>
            <button
              className="galaxia-btn"
              style={{ width: "100%" }}
              onClick={() => window.open(`https://maps.google.com/?q=${wedding?.churchAddress}`, "_blank")}
              data-testid="button-map-church"
            >
              Ver en mapa
            </button>
          </GlassCard>

          <GlassCard label="Recepci&oacute;n">
            <div className="galaxia-detail"><strong>Lugar</strong><br />{wedding?.venueName}</div>
            <div className="galaxia-detail"><strong>Direcci&oacute;n</strong><br />{wedding?.venueAddress}</div>
            <div className="galaxia-detail" style={{ marginBottom: 20 }}><strong>Hora</strong><br />{wedding?.venueTime}</div>
            <button
              className="galaxia-btn"
              style={{ width: "100%" }}
              onClick={() => window.open(`https://maps.google.com/?q=${wedding?.venueAddress}`, "_blank")}
              data-testid="button-map-venue"
            >
              Ver en mapa
            </button>
          </GlassCard>

          {wedding?.dressCode && (
            <GlassCard label="Vestimenta">
              <p className="galaxia-detail" data-testid="text-dress-code">{wedding.dressCode}</p>
            </GlassCard>
          )}

          {allowedColors.length > 0 && (
            <GlassCard label="Colores Permitidos">
              <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }} data-testid="section-allowed-colors">
                {allowedColors.map((color: string, idx: number) => (
                  <div key={idx} style={{ textAlign: "center" }} data-testid={`swatch-color-${idx}`}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        backgroundColor: color,
                        border: `2px solid ${GOLD_DIM}`,
                        boxShadow: `0 0 12px ${color}40`,
                      }}
                    />
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          <CelestialDivider />

          <GlassCard label="Cuenta regresiva">
            <OrbitalCountdown days={countdown.days} hours={countdown.hours} mins={countdown.mins} secs={countdown.secs} />
          </GlassCard>

          <CelestialDivider />

          <GlassCard label="Confirmar asistencia">
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: 15, marginBottom: 4, color: SILVER }}>
                Invitado: <span style={{ color: GOLD, fontStyle: "italic", fontWeight: 600 }} data-testid="text-guest-name">{invitation?.guestName}</span>
              </p>
              <p style={{ fontSize: 13, marginBottom: 24, color: `${SILVER}88`, letterSpacing: "0.04em" }}>
                {invitation?.seats} lugar(es) reservado(s)
              </p>

              {responded || invitation?.status !== "pending" ? (
                <div
                  style={{
                    border: `1px solid ${GLASS_BORDER}`,
                    padding: "24px 20px",
                    background: "rgba(212, 175, 55, 0.05)",
                    borderRadius: 8,
                  }}
                >
                  <p style={{ color: GOLD, fontSize: 16, fontStyle: "italic" }} data-testid="text-rsvp-status">
                    {invitation?.status === "accepted"
                      ? `¡Nos vemos pronto, ${invitation.guestName}!`
                      : `¡Te extrañaremos, ${invitation?.guestName}!`}
                  </p>
                  <p style={{ fontSize: 11, marginTop: 10, color: `${SILVER}88`, letterSpacing: "0.15em", textTransform: "uppercase" }}>
                    Respuesta registrada
                  </p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 20, alignItems: "center" }}>
                  <div style={{ width: "100%", maxWidth: 260 }}>
                    <label className="galaxia-label">N&uacute;mero de asistentes</label>
                    <select
                      className="galaxia-select"
                      value={confirmedSeats}
                      onChange={(e) => setConfirmedSeats(parseInt(e.target.value))}
                      data-testid="select-seats"
                    >
                      {Array.from({ length: invitation?.seats || 1 }).map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1} persona{i > 0 ? "s" : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
                    <button
                      className="galaxia-btn galaxia-btn-primary"
                      onClick={() => respondMutation.mutate({ status: "accepted", confirmedSeats })}
                      disabled={respondMutation.isPending}
                      data-testid="button-accept"
                    >
                      S&iacute;, asistir&eacute;
                    </button>
                    <button
                      className="galaxia-btn"
                      onClick={() => respondMutation.mutate({ status: "declined", confirmedSeats: 0 })}
                      disabled={respondMutation.isPending}
                      data-testid="button-decline"
                    >
                      No podr&eacute; ir
                    </button>
                  </div>
                </div>
              )}
            </div>
          </GlassCard>

          {(wedding?.giftLabel1 || wedding?.giftLabel2) && (
            <GlassCard label="Mesa de regalos">
              <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                {[
                  { label: wedding?.giftLabel1, url: wedding?.giftUrl1 },
                  { label: wedding?.giftLabel2, url: wedding?.giftUrl2 },
                ].filter((g) => g.label && g.url).map((g, i) => (
                  <button
                    key={i}
                    className="galaxia-btn"
                    onClick={() => g.url && window.open(g.url, "_blank")}
                    data-testid={`button-gift-${i}`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </GlassCard>
          )}

          {invitation?.qrCode && (
            <>
              <CelestialDivider />
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                style={{ textAlign: "center" }}
                data-testid="window-qr"
              >
                <label className="galaxia-label" style={{ display: "block", textAlign: "center", marginBottom: 16 }}>
                  Tu pase de entrada
                </label>
                <div
                  style={{
                    display: "inline-block",
                    border: `1px solid ${GLASS_BORDER}`,
                    padding: 12,
                    borderRadius: 12,
                    background: "rgba(255, 255, 255, 0.95)",
                    boxShadow: `0 0 30px rgba(212, 175, 55, 0.1)`,
                  }}
                >
                  <img
                    src={invitation.qrCode}
                    alt="QR"
                    style={{ width: 148, height: 148, display: "block" }}
                    data-testid="img-qr-code"
                  />
                </div>
                <p style={{ fontSize: 11, marginTop: 14, color: `${SILVER}88`, letterSpacing: "0.2em", textTransform: "uppercase" }}>
                  Presenta en la entrada
                </p>
              </motion.div>
            </>
          )}

          <CelestialDivider />

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            style={{
              textAlign: "center",
              color: `${SILVER}88`,
              fontSize: 12,
              letterSpacing: "0.2em",
              lineHeight: 2.2,
              paddingBottom: 20,
            }}
          >
            <div style={{ fontSize: 14, fontStyle: "italic", color: GOLD }}>{wedding?.coupleName}</div>
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
