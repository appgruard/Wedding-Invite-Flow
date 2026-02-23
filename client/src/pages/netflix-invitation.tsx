import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Invitation, Wedding } from "@shared/schema";
import {
  Play,
  Info,
  Calendar,
  MapPin,
  Clock,
  Church,
  Gift,
  Check,
  X,
  QrCode,
  Tv,
} from "lucide-react";

type InvitationWithWedding = Invitation & { wedding: Wedding };

function getInvitationId(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

const NetflixIntro = ({
  duration,
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
        <video
          className="w-full h-full object-cover"
          autoPlay
          muted
          playsInline
          src={videoUrl}
        />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center overflow-hidden">
      <style>{`
        @keyframes reveal-strip {
          from { clip-path: inset(100% 0 0 0); }
          to { clip-path: inset(0 0 0 0); }
        }
        .netflix-n {
          position: relative;
          width: 40vw;
          height: 56vw;
          max-width: 214px;
          max-height: 300px;
        }
        .strip {
          position: absolute;
          background: #E50914;
          animation: reveal-strip 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        .strip-1 {
          left: 0;
          width: 33%;
          height: 100%;
          z-index: 2;
        }
        .strip-2 {
          left: 0;
          width: 100%;
          height: 100%;
          background: #B9090B;
          clip-path: polygon(0 0, 100% 100%, 100% 100%, 0 0);
          animation: reveal-strip-2 1.2s cubic-bezier(0.4, 0, 0.2, 1) 0.3s forwards;
          z-index: 1;
        }
        .strip-3 {
          right: 0;
          width: 33%;
          height: 100%;
          animation-delay: 0.6s;
          z-index: 2;
        }
        @keyframes reveal-strip-2 {
          from { clip-path: polygon(0 0, 0 0, 0 0, 0 0); }
          to { clip-path: polygon(0 0, 100% 100%, 67% 100%, 33% 0); }
        }
      `}</style>
      <div className="netflix-n">
        <div className="strip strip-1" />
        <div className="strip strip-2" />
        <div className="strip strip-3" />
      </div>
    </div>
  );
};

export default function NetflixInvitationPage() {
  const [showIntro, setShowIntro] = useState(true);
  const invitationId = getInvitationId();
  const { toast } = useToast();

  const { data: invitation, isLoading } = useQuery<InvitationWithWedding>({
    queryKey: ["/api/invitations", invitationId],
    enabled: !!invitationId,
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
        {/* Hero Section */}
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
              Now Streaming
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
              className="flex items-center gap-4 text-[#999999] font-bold"
            >
              <span className="text-green-500">98% Match</span>
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
                Play
              </Button>
              <Button
                variant="outline"
                className="bg-[#515151]/50 border-none hover:bg-[#515151]/70 font-bold px-8 text-white"
                data-testid="button-info"
              >
                <Info className="w-5 h-5 mr-2" />
                More Info
              </Button>
            </div>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-6 mt-10 space-y-12">
          {/* Synopsis */}
          <section className="max-w-2xl">
            <h2 className="text-xl font-bold mb-4">Our Love Story</h2>
            <p className="text-[#999999] text-lg leading-relaxed" data-testid="text-wedding-message">
              {wedding.message || "Join us for the most important episode of our lives."}
            </p>
          </section>

          {/* Episode Cards (Event Details) */}
          <section>
            <h2 className="text-2xl font-bold mb-6">The Wedding Episodes</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Church */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-[#181818] rounded-md overflow-hidden group border-b-4 border-transparent hover:border-[#E50914] transition-all"
                data-testid="card-church"
              >
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src="/images/church.png"
                    alt="The Ceremony"
                    className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all"
                  />
                  <div className="absolute inset-0 bg-black/40" />
                  <div className="absolute top-2 left-2 bg-black/60 px-2 py-1 rounded text-xs font-bold">
                    EPISODE 1
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold">{wedding.churchName || "Ceremonia Religiosa"}</h3>
                    <span className="text-[#999999]">{wedding.churchTime}</span>
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
                    Get Directions
                  </Button>
                </div>
              </motion.div>

              {/* Venue */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-[#181818] rounded-md overflow-hidden group border-b-4 border-transparent hover:border-[#E50914] transition-all"
                data-testid="card-venue"
              >
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src="/images/venue.png"
                    alt="The Celebration"
                    className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all"
                  />
                  <div className="absolute inset-0 bg-black/40" />
                  <div className="absolute top-2 left-2 bg-black/60 px-2 py-1 rounded text-xs font-bold">
                    EPISODE 2
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold">{wedding.venueName || "Recepción"}</h3>
                    <span className="text-[#999999]">{wedding.venueTime}</span>
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
                    Get Directions
                  </Button>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Dress Code & Gifts */}
          <div className="grid md:grid-cols-2 gap-12">
            <section>
              <h2 className="text-2xl font-bold mb-6">Costume Design</h2>
              <div className="bg-[#181818] p-6 rounded-md">
                <div className="flex items-center gap-4">
                  <Tv className="w-10 h-10 text-[#E50914]" />
                  <div>
                    <h3 className="text-xl font-bold">Dress Code</h3>
                    <p className="text-[#999999]" data-testid="text-dress-code">{wedding.dressCode}</p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-6">Gift Registry</h2>
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

          {/* RSVP Section */}
          <section id="rsvp-section" className="bg-[#181818] p-8 md:p-12 rounded-md border-l-8 border-[#E50914]">
            <div className="max-w-xl">
              <h2 className="text-3xl font-black mb-4">Ready to watch?</h2>
              <p className="text-lg text-[#999999] mb-8">
                Confirm your presence for the season premiere of {wedding.coupleName}.
              </p>

              {invitation.status !== "pending" ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-green-500 font-bold text-xl">
                    <Check className="w-6 h-6" />
                    {invitation.status === "accepted" ? "Confirmed!" : "Declined"}
                  </div>
                  <p className="text-[#999999]">
                    {invitation.status === "accepted"
                      ? `We've saved ${invitation.confirmedSeats} seats for you, ${invitation.guestName}.`
                      : `We'll miss you, ${invitation.guestName}.`}
                  </p>
                  <Button
                    variant="ghost"
                    className="text-[#E50914] hover:text-[#E50914] hover:bg-transparent h-auto p-0 font-bold"
                    onClick={() => respondMutation.mutate({ status: "pending", confirmedSeats: 0 })}
                  >
                    Change response
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold uppercase tracking-wider text-[#999999]">
                      Guest Name
                    </label>
                    <p className="text-xl font-bold" data-testid="text-guest-name">{invitation.guestName}</p>
                  </div>

                  <div className="space-y-4">
                    <label className="text-sm font-bold uppercase tracking-wider text-[#999999]">
                      Number of Guests
                    </label>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Select value={selectedSeats} onValueChange={setSelectedSeats}>
                        <SelectTrigger className="w-full sm:w-[200px] bg-white text-black font-bold h-12">
                          <SelectValue placeholder="Select seats" />
                        </SelectTrigger>
                        <SelectContent className="bg-white text-black">
                          {seatOptions.map((n) => (
                            <SelectItem key={n} value={String(n)} className="font-bold">
                              {n} {n === 1 ? "Guest" : "Guests"}
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
                          Confirm
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
                          Decline
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* QR Code Section */}
          {invitation.qrCode && (
            <section className="flex flex-col items-center py-12 border-t border-white/10">
              <QrCode className="w-12 h-12 text-[#E50914] mb-4" />
              <h2 className="text-2xl font-bold mb-6">Your Entry Ticket</h2>
              <div className="bg-white p-4 rounded-md">
                <img
                  src={invitation.qrCode}
                  alt="QR Ticket"
                  className="w-48 h-48"
                  data-testid="img-qr-code"
                />
              </div>
              <p className="text-[#999999] mt-4 text-sm font-bold uppercase tracking-widest">
                Scan at the entrance
              </p>
            </section>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-20 py-10 border-t border-white/10 text-center text-[#999999]">
          <p className="font-bold text-sm tracking-widest uppercase">
            Netflix Original Wedding
          </p>
          <p className="mt-2">© {new Date().getFullYear()} {wedding.coupleName}</p>
        </footer>
      </motion.div>
    </div>
  );
}
