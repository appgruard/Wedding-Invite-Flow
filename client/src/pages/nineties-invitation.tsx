import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Invitation, Wedding } from "@shared/schema";

type InvitationWithWedding = Invitation & { wedding: Wedding };

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
      ? async () => {
          const res = await fetch(`/api/demo/${previewTemplate}`);
          return res.json();
        }
      : undefined,
    enabled: previewTemplate ? true : !!invitationId,
  });

  const wedding = data?.wedding;
  const invitation = data;

  useEffect(() => {
    const timer = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (wedding) {
      const timer = setTimeout(() => setShowIntro(false), wedding.introDuration || 4000);
      return () => clearTimeout(timer);
    }
  }, [wedding]);

  const respondMutation = useMutation({
    mutationFn: async ({ status, confirmedSeats }: { status: string; confirmedSeats: number }) => {
      const res = await apiRequest("POST", `/api/invitations/${invitationId}/respond`, {
        status,
        confirmedSeats,
      });
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
    if (!wedding?.weddingDate) return { days: 0, hours: 0, mins: 0, secs: 0, progress: 0 };
    const now = Date.now();
    const target = new Date(wedding.weddingDate).getTime();
    const diff = Math.max(0, target - now);
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    const progress = isNaN(target) ? 65 : Math.min(99, Math.max(1, 100 - (diff / (365 * 86400000)) * 100));
    return { days: isNaN(target) ? 12 : days, hours: isNaN(target) ? 5 : hours, mins: isNaN(target) ? 42 : mins, secs: isNaN(target) ? 10 : secs, progress: isNaN(progress) ? 65 : Math.round(progress) };
  }, [wedding, clock]);

  const toasters = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      id: i,
      top: Math.random() * 100,
      right: -10 - Math.random() * 50,
      duration: 3 + Math.random() * 4,
      delay: Math.random() * 3,
      isToast: i >= 9,
    }));
  }, []);

  if (isLoading || !data) {
    return <div className="min-h-screen bg-[#008080] flex items-center justify-center text-white font-mono">Cargando Boda.exe...</div>;
  }

  return (
    <div className="min-h-screen bg-[#008080] overflow-x-hidden font-sans text-black relative" style={{ fontFamily: "'Arial', sans-serif" }}>
      <style>{`
        @keyframes flyDiagonal {
          0%   { transform: translate(0, 0); opacity: 1; }
          100% { transform: translate(-140vw, 120vh); opacity: 0.8; }
        }
        @keyframes flapLeft {
          0%, 100% { transform: rotate(-30deg); }
          50%       { transform: rotate(10deg); }
        }
        @keyframes flapRight {
          0%, 100% { transform: rotate(30deg); }
          50%       { transform: rotate(-10deg); }
        }
        @keyframes glitchShift {
          0%   { clip-path: inset(10% 0 80% 0); transform: translate(-4px, 0); }
          20%  { clip-path: inset(50% 0 30% 0); transform: translate(4px, 0); }
          40%  { clip-path: inset(80% 0 5% 0);  transform: translate(-2px, 0); }
          60%  { clip-path: inset(30% 0 60% 0); transform: translate(3px, 0); }
          80%  { clip-path: inset(5% 0 90% 0);  transform: translate(-3px, 0); }
          100% { clip-path: inset(60% 0 20% 0); transform: translate(2px, 0); }
        }
        @keyframes scanline {
          0%   { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        .toaster-fly {
          position: absolute;
          animation: flyDiagonal linear infinite;
        }
        .wing-left-anim  { animation: flapLeft  0.25s ease-in-out infinite; transform-origin: right center; }
        .wing-right-anim { animation: flapRight 0.25s ease-in-out infinite; transform-origin: left center; }
        .glitch-layer {
          position: absolute;
          inset: 0;
          animation: glitchShift 0.15s steps(1) infinite;
        }
        .scanline-bar {
          position: absolute;
          left: 0; right: 0;
          height: 2px;
          background: rgba(255,255,255,0.08);
          animation: scanline 4s linear infinite;
          pointer-events: none;
        }
        .win-window {
          background: #C0C0C0;
          border-top: 2px solid #FFF;
          border-left: 2px solid #FFF;
          border-right: 2px solid #808080;
          border-bottom: 2px solid #808080;
          box-shadow: 1px 1px 0 #000;
          padding: 2px;
          margin-bottom: 20px;
        }
        .win-title-bar {
          background: linear-gradient(90deg, #000080, #1084d0);
          color: white;
          padding: 3px 6px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-weight: bold;
          font-size: 13px;
          user-select: none;
        }
        .win-title-buttons { display: flex; gap: 2px; }
        .win-btn-small {
          width: 16px; height: 14px;
          background: #C0C0C0;
          border-top: 1px solid #FFF;
          border-left: 1px solid #FFF;
          border-right: 1px solid #808080;
          border-bottom: 1px solid #808080;
          color: black; font-size: 10px;
          display: flex; align-items: center; justify-content: center; cursor: pointer;
        }
        .win-content { padding: 10px; }
        .win-inset {
          background: #FFF;
          border-top: 2px solid #808080;
          border-left: 2px solid #808080;
          border-right: 2px solid #FFF;
          border-bottom: 2px solid #FFF;
          padding: 10px;
        }
        .win-button {
          background: #C0C0C0;
          border-top: 2px solid #FFF;
          border-left: 2px solid #FFF;
          border-right: 2px solid #808080;
          border-bottom: 2px solid #808080;
          box-shadow: 1px 1px 0 #000;
          padding: 4px 16px;
          cursor: pointer; font-size: 13px; outline: none;
        }
        .win-button:active {
          border-top: 2px solid #808080; border-left: 2px solid #808080;
          border-right: 2px solid #FFF; border-bottom: 2px solid #FFF;
          box-shadow: none; transform: translate(1px,1px);
        }
        .win-progress-bg {
          height: 20px;
          background: #C0C0C0;
          border-top: 1px solid #808080; border-left: 1px solid #808080;
          border-right: 1px solid #FFF; border-bottom: 1px solid #FFF;
          position: relative; overflow: hidden;
        }
        .win-progress-fill { height: 100%; display: flex; gap: 2px; padding: 2px; }
        .win-progress-block { width: 10px; height: 100%; background: #000080; flex-shrink: 0; }
        .start-bar {
          position: fixed; bottom: 0; left: 0; right: 0;
          height: 30px; background: #C0C0C0;
          border-top: 2px solid #FFF;
          display: flex; align-items: center; padding: 0 4px; z-index: 200;
        }
        .start-button {
          font-weight: bold; display: flex; align-items: center;
          gap: 4px; padding: 2px 8px;
          background: #C0C0C0;
          border-top: 2px solid #FFF; border-left: 2px solid #FFF;
          border-right: 2px solid #808080; border-bottom: 2px solid #808080;
          box-shadow: 1px 1px 0 #000;
          font-size: 13px; cursor: pointer;
        }
        .task-item {
          border-top: 1px solid #808080; border-left: 1px solid #808080;
          border-right: 1px solid #FFF; border-bottom: 1px solid #FFF;
          padding: 2px 8px; font-size: 12px; margin-left: 4px;
          background: #B0B0B0;
        }
      `}</style>

      {/* INTRO SCREENSAVER */}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="fixed inset-0 z-[1000] overflow-hidden bg-black"
          >
            {wedding?.videoType === "youtube" && wedding.videoUrl ? (
              <div className="relative w-full h-full">
                <iframe
                  className="w-full h-full border-none"
                  src={`https://www.youtube.com/embed/${wedding.videoUrl.split("v=")[1] || wedding.videoUrl.split("/").pop()}?autoplay=1&mute=0&controls=0&showinfo=0&rel=0`}
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                />
                {/* Glitch overlay on YouTube */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="scanline-bar" />
                  <div className="glitch-layer" style={{ background: "rgba(255,0,0,0.04)", mixBlendMode: "screen" }} />
                </div>
                {/* TV frame */}
                <div className="absolute inset-0 pointer-events-none" style={{
                  border: "clamp(8px,3vw,40px) solid #555",
                  borderRadius: "clamp(8px,2vw,24px)",
                  boxShadow: "inset 0 0 60px #000, 0 0 0 4px #333, 0 0 60px rgba(0,0,0,0.8)"
                }} />
              </div>
            ) : wedding?.videoType === "mp4" && wedding.videoUrl ? (
              <div className="relative w-full h-full">
                <video className="w-full h-full object-cover" autoPlay playsInline>
                  <source src={wedding.videoUrl} type="video/mp4" />
                </video>
                <div className="absolute inset-0 pointer-events-none">
                  <div className="scanline-bar" />
                  <div className="glitch-layer" style={{ background: "rgba(255,0,0,0.04)", mixBlendMode: "screen" }} />
                </div>
                <div className="absolute inset-0 pointer-events-none" style={{
                  border: "clamp(8px,3vw,40px) solid #555",
                  borderRadius: "clamp(8px,2vw,24px)",
                  boxShadow: "inset 0 0 60px #000, 0 0 0 4px #333"
                }} />
              </div>
            ) : (
              /* Flying Toasters screensaver */
              <div className="relative w-full h-full bg-black">
                {toasters.map((t) => (
                  t.isToast ? (
                    <div
                      key={`toast-${t.id}`}
                      className="toaster-fly"
                      style={{
                        top: `${t.top}%`,
                        right: `${t.right}%`,
                        animationDuration: `${t.duration}s`,
                        animationDelay: `${t.delay}s`,
                        width: 30, height: 30,
                      }}
                    >
                      <svg viewBox="0 0 30 30" width="30" height="30">
                        <rect x="2" y="2" width="26" height="26" rx="2" fill="#DAA520" stroke="#8B4513" strokeWidth="1.5"/>
                        <rect x="5" y="5" width="20" height="3" rx="1" fill="#CD853F" opacity="0.7"/>
                        <rect x="5" y="10" width="20" height="3" rx="1" fill="#CD853F" opacity="0.5"/>
                        <rect x="5" y="15" width="14" height="3" rx="1" fill="#CD853F" opacity="0.3"/>
                      </svg>
                    </div>
                  ) : (
                    <div
                      key={`toaster-${t.id}`}
                      className="toaster-fly"
                      style={{
                        top: `${t.top}%`,
                        right: `${t.right}%`,
                        animationDuration: `${t.duration}s`,
                        animationDelay: `${t.delay}s`,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {/* Left wing */}
                      <div className="wing-left-anim" style={{ marginRight: -8, zIndex: 1 }}>
                        <svg viewBox="0 0 40 28" width="40" height="28">
                          <ellipse cx="20" cy="14" rx="20" ry="10" fill="#D0D0D0" stroke="#999" strokeWidth="1"/>
                          <ellipse cx="20" cy="14" rx="14" ry="7" fill="#E8E8E8" />
                          <line x1="8" y1="14" x2="36" y2="14" stroke="#BBB" strokeWidth="1"/>
                        </svg>
                      </div>
                      {/* Toaster body */}
                      <svg viewBox="0 0 64 50" width="64" height="50">
                        <rect x="2" y="8" width="60" height="40" rx="6" fill="#C0C0C0" stroke="#808080" strokeWidth="2"/>
                        <rect x="2" y="8" width="60" height="40" rx="6" fill="url(#toasterGrad)" opacity="0.5"/>
                        <defs>
                          <linearGradient id="toasterGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#FFF" stopOpacity="0.4"/>
                            <stop offset="100%" stopColor="#000" stopOpacity="0.1"/>
                          </linearGradient>
                        </defs>
                        <rect x="14" y="2" width="12" height="14" rx="2" fill="#808080" stroke="#606060" strokeWidth="1"/>
                        <rect x="38" y="2" width="12" height="14" rx="2" fill="#808080" stroke="#606060" strokeWidth="1"/>
                        <rect x="8" y="16" width="48" height="4" rx="2" fill="#A0A0A0"/>
                        <rect x="6" y="22" width="52" height="2" fill="#B0B0B0" rx="1"/>
                        <circle cx="10" cy="38" r="4" fill="#D0B000" stroke="#A08000" strokeWidth="1"/>
                        <circle cx="10" cy="38" r="2" fill="#FFD700"/>
                        <rect x="20" y="34" width="28" height="10" rx="2" fill="#A0A0A0" stroke="#808080" strokeWidth="1"/>
                        <text x="34" y="43" textAnchor="middle" fontSize="6" fill="#606060" fontFamily="Arial">TOAST</text>
                      </svg>
                      {/* Right wing */}
                      <div className="wing-right-anim" style={{ marginLeft: -8, zIndex: 1 }}>
                        <svg viewBox="0 0 40 28" width="40" height="28">
                          <ellipse cx="20" cy="14" rx="20" ry="10" fill="#D0D0D0" stroke="#999" strokeWidth="1"/>
                          <ellipse cx="20" cy="14" rx="14" ry="7" fill="#E8E8E8" />
                          <line x1="4" y1="14" x2="32" y2="14" stroke="#BBB" strokeWidth="1"/>
                        </svg>
                      </div>
                    </div>
                  )
                ))}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center pointer-events-none">
                  <p className="font-mono text-2xl font-bold mb-2" style={{ textShadow: "0 0 20px #0ff, 0 0 40px #0ff" }}>
                    {wedding?.coupleName}
                  </p>
                  <p className="font-mono text-sm opacity-70">Cargando Invitación.exe...</p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN CONTENT */}
      <div className="max-w-3xl mx-auto pt-8 pb-36 px-4">

        {/* Main title window */}
        <div className="win-window" data-testid="window-main">
          <div className="win-title-bar">
            <span>💌 Invitación.exe — Bloc de Notas</span>
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
              <p className="italic text-sm leading-relaxed">"{wedding?.message || "¡Acompáñanos en este día tan especial!"}"</p>
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

        {/* Details windows */}
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
            <div className="grid grid-cols-4 text-center text-xs font-mono">
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
            <span>📨 Confirmar Asistencia</span>
            <div className="win-title-buttons"><div className="win-btn-small">✕</div></div>
          </div>
          <div className="win-content text-center space-y-4">
            <p className="text-sm"><strong>Invitado:</strong> <span data-testid="text-guest-name">{invitation?.guestName}</span></p>
            <p className="text-sm">Tienes <span className="font-bold" data-testid="text-assigned-seats">{invitation?.seats}</span> lugar(es) reservado(s).</p>

            {responded || (invitation?.status !== "pending") ? (
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

        {/* Gifts Explorer */}
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
                      { label: wedding?.giftLabel2, url: wedding?.giftUrl2 }
                    ].filter(g => g.label && g.url).map((gift, idx) => (
                      <tr key={idx} className="hover:bg-blue-800 hover:text-white cursor-pointer group">
                        <td className="px-2 py-1 flex items-center gap-1">
                          <span>📁</span> {gift.label}
                        </td>
                        <td className="px-2 py-1">Mesa de regalos</td>
                        <td className="px-2 py-1">
                          <button
                            className="text-blue-600 group-hover:text-white underline"
                            onClick={() => { if (gift.url) window.open(gift.url, "_blank"); }}
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
            <div className="win-title-bar">
              <span>🔐 Acceso_Seguro.exe</span>
            </div>
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
        <div className="task-item">Invitación - Bloc de Notas</div>
        <div className="flex-1" />
        <div className="win-inset py-0 px-2 flex items-center gap-1 text-xs font-mono" style={{ borderRadius: 0 }}>
          <span>🔊</span>
          <span>{clock.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}</span>
        </div>
      </div>
    </div>
  );
}
