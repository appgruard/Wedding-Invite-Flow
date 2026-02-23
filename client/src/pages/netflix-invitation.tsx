import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Play,
  Info,
  MapPin,
  Gift,
  Tv,
  QrCode,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Invitation, Wedding } from "@shared/schema";

type InvitationWithWedding = Invitation & { wedding: Wedding };

function getInvitationId(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

function getPreviewTemplate(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get("preview");
}

const NetflixIntro = ({
  videoUrl,
  videoType,
}: {
  duration: number;
  videoUrl?: string | null;
  videoType: string;
}) => {
  if (videoType === "youtube" && videoUrl) {
    const videoId = videoUrl.split("v=")[1] || videoUrl.split("/").pop();
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center overflow-hidden">
        <iframe
          className="w-full h-full"
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&modestbranding=1`}
          allow="autoplay; encrypted-media"
          allowFullScreen
        />
      </div>
    );
  }

  if (videoType === "mp4" && videoUrl) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center overflow-hidden">
        <video className="w-full h-full object-cover" autoPlay muted playsInline>
          <source src={videoUrl} type="video/mp4" />
        </video>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center overflow-hidden">
      <style>{`
        @keyframes nStrip1 {
          0%   { transform: scaleY(0); transform-origin: top; }
          40%  { transform: scaleY(1); transform-origin: top; }
          100% { transform: scaleY(1); }
        }
        @keyframes nStrip2 {
          0%,35% { transform: scaleY(0); transform-origin: top; }
          75%  { transform: scaleY(1); transform-origin: top; }
          100% { transform: scaleY(1); }
        }
        @keyframes nStrip3 {
          0%,60% { transform: scaleY(0); transform-origin: top; }
          100% { transform: scaleY(1); transform-origin: top; }
        }
        @keyframes nGlow {
          0%,60%  { opacity: 0; }
          80%  { opacity: 1; }
          100% { opacity: 1; }
        }
        .n-strip-1 { animation: nStrip1 1.8s cubic-bezier(.4,0,.2,1) forwards; }
        .n-strip-2 { animation: nStrip2 1.8s cubic-bezier(.4,0,.2,1) forwards; }
        .n-strip-3 { animation: nStrip3 1.8s cubic-bezier(.4,0,.2,1) forwards; }
        .n-glow    { animation: nGlow  1.8s ease forwards; }
      `}</style>
      <div className="relative" style={{ width: 120, height: 200 }}>
        <div className="n-glow absolute inset-0 rounded-lg" style={{ boxShadow: "0 0 80px 20px #E5091480", background: "transparent" }} />
        <svg viewBox="0 0 120 200" width="120" height="200" style={{ overflow: "visible" }}>
          <clipPath id="strip1-clip">
            <rect x="0" y="0" width="35" height="200" />
          </clipPath>
          <clipPath id="strip2-clip">
            <rect x="40" y="0" width="40" height="200" />
          </clipPath>
          <clipPath id="strip3-clip">
            <rect x="85" y="0" width="35" height="200" />
          </clipPath>
          <g clipPath="url(#strip1-clip)" className="n-strip-1">
            <rect x="0" y="0" width="35" height="200" fill="#E50914" />
          </g>
          <g clipPath="url(#strip2-clip)" className="n-strip-2">
            <polygon points="40,0 80,0 40,200 80,200 40,0" fill="none" />
            <polygon points="40,0 80,0 80,200 40,200" fill="#B5060F" />
            <polygon points="40,200 80,0 80,200" fill="#8B0000" />
            <line x1="40" y1="0" x2="80" y2="200" stroke="#E50914" strokeWidth="4" />
          </g>
          <g clipPath="url(#strip3-clip)" className="n-strip-3">
            <rect x="85" y="0" width="35" height="200" fill="#E50914" />
          </g>
        </svg>
      </div>
    </div>
  );
};

export default function NetflixInvitationPage() {
  const [showIntro, setShowIntro] = useState(true);
  const invitationId = getInvitationId();
  const previewTemplate = getPreviewTemplate();
  const { toast } = useToast();

  const { data: invitation, isLoading } = useQuery<InvitationWithWedding>({
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

  useEffect(() => {
    if (invitation) {
      const timer = setTimeout(() => {
        setShowIntro(false);
      }, invitation.wedding.introDuration || 4000);
      return () => clearTimeout(timer);
    }
  }, [invitation]);

  const respondMutation = useMutation({
    mutationFn: async ({
      status,
      confirmedSeats,
    }: {
      status: string;
      confirmedSeats: number;
    }) => {
      const res = await apiRequest("POST", `/api/invitations/${invitationId}/respond`, {
        status,
        confirmedSeats,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invitations", invitationId] });
      toast({ title: "Respuesta enviada", description: "¡Gracias por confirmar!" });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo enviar tu respuesta.",
        variant: "destructive",
      });
    },
  });

  const [selectedSeats, setSelectedSeats] = useState("1");

  const seatOptions = useMemo(() => {
    if (!invitation) return [];
    return Array.from({ length: invitation.seats }, (_, i) => i + 1);
  }, [invitation?.seats]);

  if (isLoading || !invitation) {
    return <div className="min-h-screen bg-black" />;
  }

  const { wedding } = invitation;

  return (
    <div className="min-h-screen bg-[#141414] text-white font-sans selection:bg-[#E50914] selection:text-white">
      <AnimatePresence>
        {showIntro && (
          <motion.div
            key="intro"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            <NetflixIntro
              duration={wedding.introDuration}
              videoUrl={wedding.videoUrl}
              videoType={wedding.videoType}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showIntro ? 0 : 1 }}
        transition={{ duration: 1 }}
        className="pb-20"
      >
        <section className="relative h-[70vh] w-full">
          <div className="absolute inset-0">
            <img
              src={wedding.couplePhotoUrl || "/images/couple.png"}
              alt={wedding.coupleName}
              className="w-full h-full object-cover"
              data-testid="img-hero"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/40 to-transparent" />
          </div>

          <div className="absolute bottom-10 left-0 right-0 px-6 max-w-4xl mx-auto">
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-[#E50914] font-bold tracking-widest text-sm mb-2 uppercase"
              data-testid="text-now-streaming"
            >
              Transmitiendo ahora
            </motion.p>
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-4xl md:text-6xl font-black mb-4"
              data-testid="text-couple-name"
            >
              {wedding.coupleName}
            </motion.h1>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex items-center gap-4 text-[#999999] font-bold flex-wrap"
            >
              <span className="text-green-500">98% Compatibles</span>
              <span>{wedding.weddingDate}</span>
              <span className="border border-[#999999] px-1 text-xs">4K</span>
              <span className="border border-[#999999] px-1 text-xs">HDR</span>
            </motion.div>

            <div className="flex gap-3 mt-6">
              <Button
                className="bg-white text-black hover:bg-white/90 font-bold px-8"
                data-testid="button-play"
                onClick={() => {
                  const el = document.getElementById("rsvp-section");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                <Play className="w-5 h-5 mr-2 fill-current" />
                Confirmar
              </Button>
              <Button
                variant="outline"
                className="bg-[#515151]/50 border-none hover:bg-[#515151]/70 font-bold px-8 text-white"
                data-testid="button-info"
                onClick={() => {
                  const el = document.getElementById("details-section");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                <Info className="w-5 h-5 mr-2" />
                Más info
              </Button>
            </div>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-6 mt-10 space-y-12" id="details-section">
          <section className="max-w-2xl">
            <h2 className="text-xl font-bold mb-4">Nuestra Historia de Amor</h2>
            <p className="text-[#999999] text-lg leading-relaxed" data-testid="text-wedding-message">
              {wedding.message || "Únete a nosotros para el episodio más importante de nuestras vidas."}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-6">Los Episodios de la Boda</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-[#181818] rounded-md overflow-hidden group border-b-4 border-transparent hover:border-[#E50914] transition-all"
                data-testid="card-church"
              >
                <div className="aspect-video relative overflow-hidden bg-[#0d0d0d] flex items-center justify-center">
                  <img
                    src="/images/church.png"
                    alt="La Ceremonia"
                    className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                  <div className="absolute inset-0 bg-black/40" />
                  <div className="absolute top-2 left-2 bg-black/60 px-2 py-1 rounded text-xs font-bold">
                    EPISODIO 1
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold">{wedding.churchName || "Ceremonia Religiosa"}</h3>
                    <span className="text-[#999999] text-sm">{wedding.churchTime}</span>
                  </div>
                  <p className="text-[#999999] text-sm mb-4">
                    <MapPin className="w-3 h-3 inline mr-1" />
                    {wedding.churchAddress}
                  </p>
                  <Button
                    variant="ghost"
                    className="p-0 text-[#E50914] hover:text-[#E50914] hover:bg-transparent h-auto"
                    data-testid="button-church-maps"
                    onClick={() => window.open(`https://maps.google.com/?q=${wedding.churchAddress}`, "_blank")}
                  >
                    Cómo llegar
                  </Button>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-[#181818] rounded-md overflow-hidden group border-b-4 border-transparent hover:border-[#E50914] transition-all"
                data-testid="card-venue"
              >
                <div className="aspect-video relative overflow-hidden bg-[#0d0d0d] flex items-center justify-center">
                  <img
                    src="/images/venue.png"
                    alt="La Recepción"
                    className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                  <div className="absolute inset-0 bg-black/40" />
                  <div className="absolute top-2 left-2 bg-black/60 px-2 py-1 rounded text-xs font-bold">
                    EPISODIO 2
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold">{wedding.venueName || "Recepción"}</h3>
                    <span className="text-[#999999] text-sm">{wedding.venueTime}</span>
                  </div>
                  <p className="text-[#999999] text-sm mb-4">
                    <MapPin className="w-3 h-3 inline mr-1" />
                    {wedding.venueAddress}
                  </p>
                  <Button
                    variant="ghost"
                    className="p-0 text-[#E50914] hover:text-[#E50914] hover:bg-transparent h-auto"
                    data-testid="button-venue-maps"
                    onClick={() => window.open(`https://maps.google.com/?q=${wedding.venueAddress}`, "_blank")}
                  >
                    Cómo llegar
                  </Button>
                </div>
              </motion.div>
            </div>
          </section>

          <div className="grid md:grid-cols-2 gap-12">
            <section>
              <h2 className="text-2xl font-bold mb-6">Código de Vestimenta</h2>
              <div className="bg-[#181818] p-6 rounded-md">
                <div className="flex items-center gap-4">
                  <Tv className="w-10 h-10 text-[#E50914]" />
                  <div>
                    <h3 className="text-xl font-bold">Vestimenta</h3>
                    <p className="text-[#999999]" data-testid="text-dress-code">{wedding.dressCode}</p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-6">Mesa de Regalos</h2>
              <div className="flex flex-wrap gap-4">
                {wedding.giftLabel1 && (
                  <Button
                    className="bg-[#181818] hover:bg-[#252525] border border-white/10"
                    data-testid="button-gift-1"
                    onClick={() => window.open(wedding.giftUrl1 || "#", "_blank")}
                  >
                    <Gift className="w-4 h-4 mr-2" />
                    {wedding.giftLabel1}
                  </Button>
                )}
                {wedding.giftLabel2 && (
                  <Button
                    className="bg-[#181818] hover:bg-[#252525] border border-white/10"
                    data-testid="button-gift-2"
                    onClick={() => window.open(wedding.giftUrl2 || "#", "_blank")}
                  >
                    <Gift className="w-4 h-4 mr-2" />
                    {wedding.giftLabel2}
                  </Button>
                )}
              </div>
            </section>
          </div>

          <section id="rsvp-section" className="bg-[#181818] p-8 md:p-12 rounded-md border-l-8 border-[#E50914]">
            <div className="max-w-xl">
              <h2 className="text-3xl font-black mb-4">¿Listo para verlo?</h2>
              <p className="text-lg text-[#999999] mb-8">
                Confirma tu asistencia al estreno de temporada de {wedding.coupleName}.
              </p>

              {invitation.status !== "pending" ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-green-500 font-bold text-xl">
                    <Check className="w-6 h-6" />
                    {invitation.status === "accepted" ? "¡Confirmado!" : "Declinado"}
                  </div>
                  <p className="text-[#999999]">
                    {invitation.status === "accepted"
                      ? `Hemos reservado ${invitation.confirmedSeats} lugar(es) para ti, ${invitation.guestName}.`
                      : `Te extrañaremos, ${invitation.guestName}.`}
                  </p>
                  <Button
                    variant="ghost"
                    className="text-[#E50914] hover:text-[#E50914] hover:bg-transparent h-auto p-0 font-bold"
                    onClick={() => respondMutation.mutate({ status: "pending", confirmedSeats: 0 })}
                  >
                    Cambiar respuesta
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold uppercase tracking-wider text-[#999999]">
                      Nombre del invitado
                    </label>
                    <p className="text-xl font-bold" data-testid="text-guest-name">{invitation.guestName}</p>
                  </div>

                  <div className="space-y-4">
                    <label className="text-sm font-bold uppercase tracking-wider text-[#999999]">
                      Número de asistentes
                    </label>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Select value={selectedSeats} onValueChange={setSelectedSeats}>
                        <SelectTrigger className="w-full sm:w-[200px] bg-white text-black font-bold h-12">
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent className="bg-white text-black">
                          {seatOptions.map((n) => (
                            <SelectItem key={n} value={String(n)} className="font-bold">
                              {n} {n === 1 ? "Persona" : "Personas"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="flex gap-2 w-full">
                        <Button
                          className="flex-1 bg-[#E50914] hover:bg-[#B9090B] text-white font-bold h-12"
                          data-testid="button-confirm"
                          disabled={respondMutation.isPending}
                          onClick={() =>
                            respondMutation.mutate({
                              status: "accepted",
                              confirmedSeats: parseInt(selectedSeats),
                            })
                          }
                        >
                          Confirmar
                        </Button>
                        <Button
                          className="flex-1 bg-transparent hover:bg-white/10 border border-white/30 text-white font-bold h-12"
                          data-testid="button-decline"
                          disabled={respondMutation.isPending}
                          onClick={() =>
                            respondMutation.mutate({
                              status: "declined",
                              confirmedSeats: 0,
                            })
                          }
                        >
                          No podré ir
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {invitation.qrCode && (
            <section className="flex flex-col items-center py-12 border-t border-white/10">
              <QrCode className="w-12 h-12 text-[#E50914] mb-4" />
              <h2 className="text-2xl font-bold mb-6">Tu Boleto de Entrada</h2>
              <div className="bg-white p-4 rounded-md">
                <img
                  src={invitation.qrCode}
                  alt="Código QR"
                  className="w-48 h-48"
                  data-testid="img-qr-code"
                />
              </div>
              <p className="text-[#999999] mt-4 text-sm font-bold uppercase tracking-widest">
                Presenta en la entrada
              </p>
            </section>
          )}
        </div>

        <footer className="mt-20 py-10 border-t border-white/10 text-center text-[#999999]">
          <p className="font-bold text-sm tracking-widest uppercase">
            Una Boda Original
          </p>
          <p className="mt-2">© {new Date().getFullYear()} {wedding.coupleName}</p>
        </footer>
      </motion.div>
    </div>
  );
}
