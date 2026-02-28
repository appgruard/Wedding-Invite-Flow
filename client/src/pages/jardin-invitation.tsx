import { useState, useEffect, useMemo } from "react";
import { MusicPlayer } from "@/components/music-player";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Invitation, Wedding } from "@shared/schema";

type InvitationWithWedding = Invitation & { wedding: Wedding };

const SAGE = "#7A8B6F";
const DUSTY_ROSE = "#C4A882";
const CREAM = "#FFF8F0";
const PLUM = "#8B6F7A";
const LEAF_GREEN = "#5E7A52";

const MONTHS_ES: Record<string, number> = {
  enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5,
  julio: 6, agosto: 7, septiembre: 8, octubre: 9, noviembre: 10, diciembre: 11,
};

function parseSpanishDate(dateStr: string): number | null {
  if (!dateStr) return null;
  const clean = dateStr.toLowerCase().replace(/\./g, "").trim();
  const match = clean.match(/(\d{1,2})\s+de\s+(\w+)\s+de\s+(\d{4})/);
  if (!match) return null;
  const day = parseInt(match[1]);
  const month = MONTHS_ES[match[2]];
  const year = parseInt(match[3]);
  if (month === undefined) return null;
  return new Date(year, month, day, 18, 0, 0).getTime();
}

function BotanicalBorder({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ position: "relative", padding: "40px 24px", margin: "0 auto 32px" }}>
      <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none" }} viewBox="0 0 400 500" preserveAspectRatio="none" fill="none">
        <path d="M40,20 Q20,20 20,40 L20,460 Q20,480 40,480 L360,480 Q380,480 380,460 L380,40 Q380,20 360,20 Z" stroke={SAGE} strokeWidth="1.5" strokeDasharray="6 4" opacity="0.5" />
        <path d="M15,60 Q8,45 15,30" stroke={LEAF_GREEN} strokeWidth="1" fill="none" opacity="0.4" />
        <path d="M12,45 C5,40 3,32 8,28" stroke={LEAF_GREEN} strokeWidth="0.8" fill="none" opacity="0.3" />
        <ellipse cx="14" cy="25" rx="5" ry="8" fill={LEAF_GREEN} opacity="0.15" transform="rotate(-20 14 25)" />
        <path d="M385,440 Q392,455 385,470" stroke={LEAF_GREEN} strokeWidth="1" fill="none" opacity="0.4" />
        <path d="M388,455 C395,460 397,468 392,472" stroke={LEAF_GREEN} strokeWidth="0.8" fill="none" opacity="0.3" />
        <ellipse cx="386" cy="475" rx="5" ry="8" fill={LEAF_GREEN} opacity="0.15" transform="rotate(160 386 475)" />
        <circle cx="30" cy="25" r="3" fill={DUSTY_ROSE} opacity="0.3" />
        <circle cx="370" cy="475" r="3" fill={DUSTY_ROSE} opacity="0.3" />
        <circle cx="25" cy="475" r="2" fill={DUSTY_ROSE} opacity="0.2" />
        <circle cx="375" cy="25" r="2" fill={DUSTY_ROSE} opacity="0.2" />
      </svg>
      {children}
    </div>
  );
}

function WatercolorHeading({ text }: { text: string }) {
  return (
    <div style={{ position: "relative", display: "inline-block", marginBottom: 16 }}>
      <div style={{
        position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
        width: "120%", height: "180%",
        background: `radial-gradient(ellipse, ${DUSTY_ROSE}25 0%, ${DUSTY_ROSE}10 40%, transparent 70%)`,
        borderRadius: "50%", pointerEvents: "none",
      }} />
      <h2 style={{
        position: "relative",
        fontFamily: "'Lora', 'Georgia', serif",
        fontSize: "clamp(22px, 4.5vw, 30px)",
        fontWeight: 700,
        color: PLUM,
        letterSpacing: "0.02em",
      }}>{text}</h2>
    </div>
  );
}

function VineDivider() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, margin: "24px auto", maxWidth: 300 }}>
      <svg width="60" height="20" viewBox="0 0 60 20" fill="none">
        <path d="M0,10 Q15,0 30,10 Q45,20 60,10" stroke={SAGE} strokeWidth="1" opacity="0.5" />
        <ellipse cx="15" cy="6" rx="4" ry="6" fill={LEAF_GREEN} opacity="0.2" transform="rotate(-30 15 6)" />
        <ellipse cx="45" cy="14" rx="4" ry="6" fill={LEAF_GREEN} opacity="0.2" transform="rotate(30 45 14)" />
      </svg>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="4" fill={DUSTY_ROSE} opacity="0.4" />
        <circle cx="8" cy="8" r="2" fill={DUSTY_ROSE} opacity="0.6" />
      </svg>
      <svg width="60" height="20" viewBox="0 0 60 20" fill="none">
        <path d="M0,10 Q15,20 30,10 Q45,0 60,10" stroke={SAGE} strokeWidth="1" opacity="0.5" />
        <ellipse cx="15" cy="14" rx="4" ry="6" fill={LEAF_GREEN} opacity="0.2" transform="rotate(30 15 14)" />
        <ellipse cx="45" cy="6" rx="4" ry="6" fill={LEAF_GREEN} opacity="0.2" transform="rotate(-30 45 6)" />
      </svg>
    </div>
  );
}

function GardenCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      style={{
        marginBottom: 28,
        background: `linear-gradient(135deg, ${CREAM}, #FFF5E8)`,
        border: `1px solid ${SAGE}30`,
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: `0 4px 20px ${SAGE}15`,
      }}
    >
      <div style={{
        padding: "12px 24px",
        background: `linear-gradient(90deg, ${SAGE}15, ${SAGE}08, ${SAGE}15)`,
        borderBottom: `1px solid ${SAGE}20`,
        textAlign: "center",
      }}>
        <span style={{
          fontFamily: "'Dancing Script', cursive, 'Georgia', serif",
          fontSize: 18,
          color: PLUM,
          fontWeight: 700,
          letterSpacing: "0.05em",
        }}>{label}</span>
      </div>
      <div style={{ padding: "24px 28px", color: "#4A3D35" }}>
        {children}
      </div>
    </motion.div>
  );
}

function PetalCountdownDigit({ val, label }: { val: number; label: string }) {
  return (
    <div style={{ textAlign: "center", padding: "0 4px" }}>
      <div style={{ position: "relative", display: "inline-block" }}>
        <svg width="64" height="72" viewBox="0 0 64 72" fill="none" style={{ position: "absolute", top: 0, left: 0 }}>
          <ellipse cx="32" cy="16" rx="12" ry="16" fill={DUSTY_ROSE} opacity="0.15" />
          <ellipse cx="16" cy="36" rx="16" ry="12" fill={DUSTY_ROSE} opacity="0.12" transform="rotate(-20 16 36)" />
          <ellipse cx="48" cy="36" rx="16" ry="12" fill={DUSTY_ROSE} opacity="0.12" transform="rotate(20 48 36)" />
          <ellipse cx="24" cy="56" rx="14" ry="10" fill={SAGE} opacity="0.1" transform="rotate(15 24 56)" />
          <ellipse cx="40" cy="56" rx="14" ry="10" fill={SAGE} opacity="0.1" transform="rotate(-15 40 56)" />
        </svg>
        <div style={{
          position: "relative",
          width: 64,
          height: 72,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Lora', 'Georgia', serif",
          fontSize: "clamp(26px, 5vw, 36px)",
          fontWeight: 700,
          color: PLUM,
        }}>
          {String(val).padStart(2, "0")}
        </div>
      </div>
      <div style={{
        fontSize: 10,
        letterSpacing: "0.2em",
        textTransform: "uppercase" as const,
        color: SAGE,
        marginTop: 4,
        fontFamily: "'Lora', 'Georgia', serif",
      }}>{label}</div>
    </div>
  );
}

function FloatingPetals() {
  const petals = useMemo(() => Array.from({ length: 18 }, (_, i) => ({
    id: i,
    left: (i * 17 + 5) % 100,
    size: 8 + (i % 5) * 3,
    delay: (i * 1.3) % 12,
    dur: 10 + (i % 7) * 2,
    rotate: (i * 37) % 360,
    color: i % 3 === 0 ? DUSTY_ROSE : i % 3 === 1 ? SAGE : LEAF_GREEN,
    opacity: 0.15 + (i % 4) * 0.05,
  })), []);

  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1, overflow: "hidden" }}>
      {petals.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.left}%`,
            top: -20,
            width: p.size,
            height: p.size * 1.4,
            background: p.color,
            borderRadius: "50% 0 50% 50%",
            opacity: p.opacity,
            animation: `jardin-fall ${p.dur}s ${p.delay}s linear infinite`,
            transform: `rotate(${p.rotate}deg)`,
          }}
        />
      ))}
    </div>
  );
}

function WatercolorIntro({ coupleName, onSkip }: { coupleName: string; onSkip: () => void }) {
  return (
    <motion.div
      key="jardin-intro"
      exit={{ opacity: 0 }}
      transition={{ duration: 1.2 }}
      onClick={onSkip}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: CREAM,
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", inset: 0 }}>
        <div style={{
          position: "absolute", top: "-10%", left: "-10%", width: "60%", height: "60%",
          background: `radial-gradient(ellipse, ${SAGE}40 0%, ${SAGE}15 30%, transparent 60%)`,
          animation: "jardin-wash1 3s ease-out forwards",
          borderRadius: "50%",
        }} />
        <div style={{
          position: "absolute", bottom: "-10%", right: "-10%", width: "65%", height: "65%",
          background: `radial-gradient(ellipse, ${DUSTY_ROSE}35 0%, ${DUSTY_ROSE}10 35%, transparent 60%)`,
          animation: "jardin-wash2 3.5s 0.5s ease-out forwards",
          borderRadius: "50%",
          opacity: 0,
        }} />
        <div style={{
          position: "absolute", top: "20%", right: "10%", width: "40%", height: "40%",
          background: `radial-gradient(ellipse, ${PLUM}20 0%, transparent 50%)`,
          animation: "jardin-wash3 4s 1s ease-out forwards",
          borderRadius: "50%",
          opacity: 0,
        }} />
        <div style={{
          position: "absolute", bottom: "15%", left: "15%", width: "35%", height: "35%",
          background: `radial-gradient(ellipse, ${LEAF_GREEN}20 0%, transparent 50%)`,
          animation: "jardin-wash3 4s 1.5s ease-out forwards",
          borderRadius: "50%",
          opacity: 0,
        }} />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.5, duration: 1.5, ease: "easeOut" }}
        style={{ position: "relative", textAlign: "center", zIndex: 2 }}
      >
        <svg width="200" height="40" viewBox="0 0 200 40" fill="none" style={{ margin: "0 auto 16px", display: "block" }}>
          <path d="M20,35 Q40,5 60,20 Q80,35 100,20 Q120,5 140,20 Q160,35 180,20" stroke={SAGE} strokeWidth="1.5" opacity="0.4" />
          {[30, 70, 110, 150].map((cx, i) => (
            <ellipse key={i} cx={cx} cy={i % 2 === 0 ? 12 : 28} rx="6" ry="9" fill={LEAF_GREEN} opacity="0.2" transform={`rotate(${i % 2 === 0 ? -25 : 25} ${cx} ${i % 2 === 0 ? 12 : 28})`} />
          ))}
          {[50, 130].map((cx, i) => (
            <circle key={`f${i}`} cx={cx} cy={20} r="4" fill={DUSTY_ROSE} opacity="0.35" />
          ))}
        </svg>
        <p style={{
          fontFamily: "'Dancing Script', cursive, 'Georgia', serif",
          fontSize: "clamp(32px, 7vw, 56px)",
          color: PLUM,
          lineHeight: 1.3,
          textShadow: `0 2px 20px ${DUSTY_ROSE}40`,
        }}>
          {coupleName}
        </p>
        <p style={{
          fontFamily: "'Lora', 'Georgia', serif",
          fontSize: "clamp(11px, 1.5vw, 14px)",
          color: SAGE,
          letterSpacing: "0.3em",
          textTransform: "uppercase" as const,
          marginTop: 12,
          opacity: 0.7,
        }}>
          Te invitan a su boda
        </p>
      </motion.div>

      <div style={{
        position: "absolute", bottom: 32, left: 0, right: 0,
        textAlign: "center", pointerEvents: "none",
      }}>
        <span style={{
          color: SAGE,
          fontSize: 12,
          fontFamily: "'Lora', 'Georgia', serif",
          letterSpacing: "0.15em",
          opacity: 0.6,
        }}>
          Toca para continuar
        </span>
      </div>
    </motion.div>
  );
}

export default function JardinInvitationPage() {
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
  useEffect(() => {
    if (wedding) {
      const dur = wedding.introDuration || 6000;
      const t = setTimeout(() => setShowIntro(false), dur);
      return () => clearTimeout(t);
    }
  }, [wedding]);

  useEffect(() => { if (!showIntro) window.scrollTo(0, 0); }, [showIntro]);

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
    const parsed = wedding?.weddingDate ? parseSpanishDate(wedding.weddingDate) : null;
    const target = parsed ?? new Date("2026-03-15T18:00:00").getTime();
    const diff = Math.max(0, target - Date.now());
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      mins: Math.floor((diff % 3600000) / 60000),
      secs: Math.floor((diff % 60000) / 1000),
    };
  }, [wedding, clock]);

  if (isLoading) {
    return (
      <div style={{
        minHeight: "100vh",
        background: CREAM,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: SAGE,
        fontFamily: "'Lora', 'Georgia', serif",
        fontSize: 18,
        letterSpacing: "0.15em",
      }}>
        Cargando...
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div style={{
        minHeight: "100vh",
        background: CREAM,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
      }}>
        <p style={{ color: PLUM, fontFamily: "'Lora', 'Georgia', serif", fontSize: 15 }}>
          Error al cargar la invitación.
        </p>
        <button
          onClick={() => queryClient.resetQueries({ queryKey: ["/api/invitations", invitationId] })}
          data-testid="button-retry"
          style={{
            padding: "10px 24px",
            background: SAGE,
            color: CREAM,
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            fontFamily: "'Lora', 'Georgia', serif",
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
      background: CREAM,
      color: "#4A3D35",
      fontFamily: "'Lora', 'Georgia', serif",
      position: "relative",
      overflowX: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&family=Lora:wght@400;600;700&display=swap');

        @keyframes jardin-fall {
          0% { transform: translateY(-20px) rotate(0deg); }
          25% { transform: translateY(25vh) rotate(90deg) translateX(15px); }
          50% { transform: translateY(50vh) rotate(180deg) translateX(-10px); }
          75% { transform: translateY(75vh) rotate(270deg) translateX(20px); }
          100% { transform: translateY(105vh) rotate(360deg) translateX(-5px); }
        }

        @keyframes jardin-wash1 {
          0% { transform: scale(0.3); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes jardin-wash2 {
          0% { transform: scale(0.3); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes jardin-wash3 {
          0% { transform: scale(0.3); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }

        .jardin-btn {
          display: inline-block;
          background: transparent;
          border: 1px solid ${SAGE};
          color: ${PLUM};
          padding: 10px 28px;
          font-family: 'Lora', 'Georgia', serif;
          font-size: 14px;
          letter-spacing: 0.06em;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.25s ease;
        }
        .jardin-btn:hover {
          background: ${SAGE}15;
          border-color: ${LEAF_GREEN};
        }
        .jardin-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .jardin-btn-primary {
          background: linear-gradient(135deg, ${SAGE}, ${LEAF_GREEN});
          border: none;
          color: ${CREAM};
          font-weight: 600;
        }
        .jardin-btn-primary:hover {
          background: linear-gradient(135deg, ${LEAF_GREEN}, ${SAGE});
          box-shadow: 0 2px 12px ${SAGE}40;
        }
        .jardin-select {
          background: ${CREAM};
          border: 1px solid ${SAGE}50;
          color: #4A3D35;
          padding: 10px 14px;
          font-family: 'Lora', 'Georgia', serif;
          font-size: 14px;
          border-radius: 8px;
          cursor: pointer;
          outline: none;
          width: 100%;
        }
        .jardin-select:focus {
          border-color: ${SAGE};
          box-shadow: 0 0 0 2px ${SAGE}25;
        }
        .jardin-label {
          font-size: 11px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: ${SAGE};
          display: block;
          margin-bottom: 8px;
          font-family: 'Lora', 'Georgia', serif;
        }
        .jardin-detail {
          font-size: 15px;
          color: #4A3D35;
          margin-bottom: 12px;
          line-height: 1.7;
        }
        .jardin-detail strong {
          color: ${PLUM};
          font-weight: 600;
        }
      `}</style>

      <FloatingPetals />

      <AnimatePresence>
        {showIntro && wedding && (
          <WatercolorIntro
            coupleName={wedding.coupleName}
            onSkip={() => setShowIntro(false)}
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showIntro ? 0 : 1 }}
        transition={{ duration: 1.2 }}
        style={{ position: "relative", zIndex: 2 }}
      >
        <div style={{ maxWidth: 600, margin: "0 auto", padding: "56px 20px 80px" }}>

          <BotanicalBorder>
            <div style={{ textAlign: "center" }}>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <p style={{
                  fontSize: 11,
                  letterSpacing: "0.4em",
                  color: SAGE,
                  textTransform: "uppercase" as const,
                  marginBottom: 20,
                }}>Con todo nuestro amor</p>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                style={{
                  fontFamily: "'Dancing Script', cursive, 'Georgia', serif",
                  fontSize: "clamp(30px, 7vw, 52px)",
                  fontWeight: 700,
                  color: PLUM,
                  lineHeight: 1.3,
                  marginBottom: 16,
                }}
                data-testid="text-couple-names"
              >
                {wedding?.coupleName}
              </motion.h1>

              <div style={{ display: "flex", alignItems: "center", gap: 14, justifyContent: "center", marginBottom: 20 }}>
                <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, transparent, ${SAGE}50)` }} />
                <span style={{
                  fontSize: 14,
                  color: PLUM,
                  fontStyle: "italic",
                  letterSpacing: "0.06em",
                }} data-testid="text-wedding-date">{wedding?.weddingDate}</span>
                <div style={{ flex: 1, height: 1, background: `linear-gradient(to left, transparent, ${SAGE}50)` }} />
              </div>

              {wedding?.message && (
                <p style={{
                  fontSize: 15,
                  color: SAGE,
                  fontStyle: "italic",
                  lineHeight: 1.8,
                  maxWidth: 440,
                  margin: "0 auto",
                }}>
                  &ldquo;{wedding.message}&rdquo;
                </p>
              )}

              {wedding?.couplePhotoUrl && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.3 }}
                  style={{ marginTop: 28, display: "inline-block" }}
                >
                  <div style={{
                    padding: 6,
                    background: `linear-gradient(135deg, ${SAGE}25, ${DUSTY_ROSE}25)`,
                    borderRadius: "50%",
                    display: "inline-block",
                  }}>
                    <div style={{
                      padding: 3,
                      background: CREAM,
                      borderRadius: "50%",
                    }}>
                      <img
                        src={wedding.couplePhotoUrl}
                        alt="Pareja"
                        style={{
                          width: 200,
                          height: 200,
                          borderRadius: "50%",
                          objectFit: "cover",
                          display: "block",
                        }}
                        data-testid="img-couple"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </BotanicalBorder>

          <VineDivider />

          <GardenCard label="Ceremonia Religiosa">
            <div style={{ textAlign: "center" }}>
              <WatercolorHeading text="Ceremonia" />
              <div className="jardin-detail"><strong>Lugar</strong><br />{wedding?.churchName}</div>
              <div className="jardin-detail"><strong>Dirección</strong><br />{wedding?.churchAddress}</div>
              <div className="jardin-detail" style={{ marginBottom: 20 }}><strong>Hora</strong><br />{wedding?.churchTime}</div>
              <button
                className="jardin-btn"
                style={{ width: "100%" }}
                onClick={() => window.open(`https://maps.google.com/?q=${wedding?.churchAddress}`, "_blank")}
                data-testid="button-map-church"
              >
                Ver en mapa
              </button>
            </div>
          </GardenCard>

          <GardenCard label="Recepción">
            <div style={{ textAlign: "center" }}>
              <WatercolorHeading text="Recepción" />
              <div className="jardin-detail"><strong>Lugar</strong><br />{wedding?.venueName}</div>
              <div className="jardin-detail"><strong>Dirección</strong><br />{wedding?.venueAddress}</div>
              <div className="jardin-detail" style={{ marginBottom: 20 }}><strong>Hora</strong><br />{wedding?.venueTime}</div>
              <button
                className="jardin-btn"
                style={{ width: "100%" }}
                onClick={() => window.open(`https://maps.google.com/?q=${wedding?.venueAddress}`, "_blank")}
                data-testid="button-map-venue"
              >
                Ver en mapa
              </button>
            </div>
          </GardenCard>

          {wedding?.dressCode && (
            <GardenCard label="Código de Vestimenta">
              <div style={{ textAlign: "center" }}>
                <WatercolorHeading text="Vestimenta" />
                <p className="jardin-detail" data-testid="text-dress-code">{wedding.dressCode}</p>
              </div>
            </GardenCard>
          )}

          {allowedColors.length > 0 && (
            <GardenCard label="Colores Permitidos">
              <div style={{ textAlign: "center" }}>
                <WatercolorHeading text="Paleta de Colores" />
                <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }} data-testid="section-allowed-colors">
                  {allowedColors.map((color: string, idx: number) => (
                    <div key={idx} style={{ textAlign: "center" }} data-testid={`swatch-color-${idx}`}>
                      <div style={{
                        width: 40, height: 40,
                        borderRadius: "50%",
                        backgroundColor: color,
                        border: `2px solid ${SAGE}`,
                        boxShadow: `0 2px 8px ${SAGE}25`,
                      }} />
                    </div>
                  ))}
                </div>
              </div>
            </GardenCard>
          )}

          <VineDivider />

          <GardenCard label="Cuenta Regresiva">
            <div style={{ textAlign: "center" }}>
              <WatercolorHeading text="Faltan..." />
              <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-start", gap: 4, flexWrap: "wrap" }}>
                <PetalCountdownDigit val={countdown.days} label="Días" />
                <div style={{ color: `${PLUM}60`, fontSize: 28, lineHeight: "1.1", alignSelf: "center", paddingTop: 6 }}>:</div>
                <PetalCountdownDigit val={countdown.hours} label="Horas" />
                <div style={{ color: `${PLUM}60`, fontSize: 28, lineHeight: "1.1", alignSelf: "center", paddingTop: 6 }}>:</div>
                <PetalCountdownDigit val={countdown.mins} label="Min" />
                <div style={{ color: `${PLUM}60`, fontSize: 28, lineHeight: "1.1", alignSelf: "center", paddingTop: 6 }}>:</div>
                <PetalCountdownDigit val={countdown.secs} label="Seg" />
              </div>
            </div>
          </GardenCard>

          <VineDivider />

          <GardenCard label="Confirmar Asistencia">
            <div style={{ textAlign: "center" }}>
              <WatercolorHeading text="RSVP" />
              <p style={{ fontSize: 15, marginBottom: 4, color: "#4A3D35" }}>
                Invitado: <span style={{ color: PLUM, fontStyle: "italic", fontWeight: 600 }} data-testid="text-guest-name">{invitation?.guestName}</span>
              </p>
              <p style={{ fontSize: 13, marginBottom: 24, color: SAGE, letterSpacing: "0.04em" }}>
                {invitation?.seats} lugar(es) reservado(s)
              </p>

              {responded || invitation?.status !== "pending" ? (
                <div style={{
                  border: `1px solid ${SAGE}40`,
                  padding: "24px 20px",
                  background: `linear-gradient(135deg, ${SAGE}10, ${DUSTY_ROSE}10)`,
                  borderRadius: 10,
                }}>
                  <p style={{
                    color: PLUM,
                    fontSize: 16,
                    fontStyle: "italic",
                    fontFamily: "'Dancing Script', cursive, 'Georgia', serif",
                    fontWeight: 700,
                  }} data-testid="text-rsvp-status">
                    {invitation?.status === "accepted"
                      ? `¡Nos vemos pronto, ${invitation.guestName}!`
                      : `¡Te extrañaremos, ${invitation?.guestName}!`}
                  </p>
                  <p style={{ fontSize: 11, marginTop: 10, color: SAGE, letterSpacing: "0.15em", textTransform: "uppercase" as const }}>
                    Respuesta registrada
                  </p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 20, alignItems: "center" }}>
                  <div style={{ width: "100%", maxWidth: 260 }}>
                    <label className="jardin-label">Número de asistentes</label>
                    <select
                      className="jardin-select"
                      value={confirmedSeats}
                      onChange={(e) => setConfirmedSeats(parseInt(e.target.value))}
                      data-testid="select-seats"
                    >
                      {Array.from({ length: invitation?.seats || 1 }).map((_, i) => (
                        <option key={i + 1} value={i + 1}>{i + 1} persona{i > 0 ? "s" : ""}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
                    <button
                      className="jardin-btn jardin-btn-primary"
                      onClick={() => respondMutation.mutate({ status: "accepted", confirmedSeats })}
                      disabled={respondMutation.isPending}
                      data-testid="button-accept"
                    >
                      Sí, asistiré
                    </button>
                    <button
                      className="jardin-btn"
                      onClick={() => respondMutation.mutate({ status: "declined", confirmedSeats: 0 })}
                      disabled={respondMutation.isPending}
                      data-testid="button-decline"
                    >
                      No podré ir
                    </button>
                  </div>
                </div>
              )}
            </div>
          </GardenCard>

          {(wedding?.giftLabel1 || wedding?.giftLabel2) && (
            <GardenCard label="Mesa de Regalos">
              <div style={{ textAlign: "center" }}>
                <WatercolorHeading text="Regalos" />
                <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                  {[
                    { label: wedding?.giftLabel1, url: wedding?.giftUrl1 },
                    { label: wedding?.giftLabel2, url: wedding?.giftUrl2 },
                  ].filter(g => g.label && g.url).map((g, i) => (
                    <button
                      key={i}
                      className="jardin-btn"
                      onClick={() => g.url && window.open(g.url, "_blank")}
                      data-testid={`button-gift-${i}`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>
            </GardenCard>
          )}

          {invitation?.qrCode && (
            <>
              <VineDivider />
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                style={{ textAlign: "center" }}
                data-testid="window-qr"
              >
                <label className="jardin-label" style={{ display: "block", textAlign: "center", marginBottom: 16 }}>Tu pase de entrada</label>
                <div style={{
                  display: "inline-block",
                  border: `1px solid ${SAGE}40`,
                  padding: 10,
                  borderRadius: 10,
                  background: "white",
                  boxShadow: `0 4px 16px ${SAGE}15`,
                }}>
                  <img src={invitation.qrCode} alt="QR" style={{ width: 148, height: 148, display: "block" }} data-testid="img-qr-code" />
                </div>
                <p style={{ fontSize: 11, marginTop: 14, color: SAGE, letterSpacing: "0.2em", textTransform: "uppercase" as const }}>
                  Presenta en la entrada
                </p>
              </motion.div>
            </>
          )}

          <VineDivider />
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            style={{
              textAlign: "center",
              color: SAGE,
              fontSize: 12,
              letterSpacing: "0.2em",
              lineHeight: 2.2,
              paddingBottom: 20,
            }}
          >
            <div style={{
              fontFamily: "'Dancing Script', cursive, 'Georgia', serif",
              fontSize: 20,
              fontWeight: 700,
              color: PLUM,
            }}>{wedding?.coupleName}</div>
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
