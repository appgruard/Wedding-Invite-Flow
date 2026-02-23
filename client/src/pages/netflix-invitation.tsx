import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Play, Info, MapPin, Gift, Tv, QrCode, Check } from "lucide-react";
import { MusicPlayer } from "@/components/music-player";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import type { Invitation, Wedding } from "@shared/schema";

type InvitationWithWedding = Invitation & { wedding: Wedding };

function getInvitationId(): string | null {
  return new URLSearchParams(window.location.search).get("id");
}
function getPreviewTemplate(): string | null {
  return new URLSearchParams(window.location.search).get("preview");
}

/* ─── CodePen mdryxPv data ─────────────────────────────────────────────── */
const FURS: Array<{ left: string; width: string; s1: string; s2: string }> = [
  { left:"0%",    width:"3.8%",  s1:"15%", s2:"81%"  },
  { left:"3.8%",  width:"2.8%",  s1:"10%", s2:"62%"  },
  { left:"6.6%",  width:"4.8%",  s1:"37%", s2:"100%" },
  { left:"11.4%", width:"4%",    s1:"23%", s2:"100%" },
  { left:"15.4%", width:"4%",    s1:"15%", s2:"86%"  },
  { left:"19.4%", width:"2.5%",  s1:"27%", s2:"89%"  },
  { left:"21.9%", width:"4%",    s1:"20%", s2:"100%" },
  { left:"25.9%", width:"2%",    s1:"30%", s2:"100%" },
  { left:"27.9%", width:"4%",    s1:"35%", s2:"95%"  },
  { left:"31.9%", width:"3.5%",  s1:"39%", s2:"95%"  },
  { left:"35.4%", width:"2%",    s1:"34%", s2:"95%"  },
  { left:"37.4%", width:"2.6%",  s1:"22%", s2:"95%"  },
  { left:"40%",   width:"6%",    s1:"47%", s2:"100%" },
  { left:"46%",   width:"2%",    s1:"36%", s2:"100%" },
  { left:"48%",   width:"5.5%",  s1:"29%", s2:"100%" },
  { left:"53.5%", width:"3%",    s1:"39%", s2:"95%"  },
  { left:"56.5%", width:"4.1%",  s1:"45%", s2:"100%" },
  { left:"60.6%", width:"2.4%",  s1:"34%", s2:"100%" },
  { left:"63%",   width:"4%",    s1:"47%", s2:"100%" },
  { left:"67%",   width:"1.5%",  s1:"27%", s2:"95%"  },
  { left:"68.5%", width:"2.8%",  s1:"37%", s2:"100%" },
  { left:"71.3%", width:"2.3%",  s1:"9%",  s2:"100%" },
  { left:"73.6%", width:"2.2%",  s1:"28%", s2:"92%"  },
  { left:"75.8%", width:"1%",    s1:"37%", s2:"100%" },
  { left:"76.8%", width:"2.1%",  s1:"28%", s2:"100%" },
  { left:"78.9%", width:"4.1%",  s1:"34%", s2:"100%" },
  { left:"83%",   width:"2.5%",  s1:"21%", s2:"100%" },
  { left:"85.5%", width:"4.5%",  s1:"39%", s2:"100%" },
  { left:"90%",   width:"2.8%",  s1:"30%", s2:"100%" },
  { left:"92.8%", width:"3.5%",  s1:"19%", s2:"100%" },
  { left:"96.3%", width:"3.7%",  s1:"37%", s2:"100%" },
];

const LAMPS = [
  { c:"#ff0100", l:"0.7%",  w:"1%",   d:"0.4s", dir:"l" },
  { c:"#ffde01", l:"2.2%",  w:"1.4%", d:"1.3s", dir:"r" },
  { c:"#ff00cc", l:"5.8%",  w:"2.1%", d:"0.9s", dir:"l" },
  { c:"#04fd8f", l:"10.1%", w:"2%",   d:"1.7s", dir:"r" },
  { c:"#ff0100", l:"12.9%", w:"1.4%", d:"0.6s", dir:"l" },
  { c:"#ff9600", l:"15.3%", w:"2.8%", d:"1.1s", dir:"r" },
  { c:"#0084ff", l:"21.2%", w:"2.5%", d:"0.3s", dir:"l" },
  { c:"#f84006", l:"25%",   w:"2.5%", d:"1.9s", dir:"r" },
  { c:"#ffc601", l:"30.5%", w:"3%",   d:"0.8s", dir:"l" },
  { c:"#ff4800", l:"36.3%", w:"3%",   d:"1.4s", dir:"r" },
  { c:"#fd0100", l:"41%",   w:"2.2%", d:"0.5s", dir:"l" },
  { c:"#01ffff", l:"44.2%", w:"2.6%", d:"1.2s", dir:"r" },
  { c:"#ffc601", l:"51.7%", w:"0.5%", d:"0.7s", dir:"l" },
  { c:"#ffc601", l:"52.1%", w:"1.8%", d:"1.6s", dir:"r" },
  { c:"#0078fe", l:"53.8%", w:"2.3%", d:"0.2s", dir:"l" },
  { c:"#0080ff", l:"57.2%", w:"2%",   d:"1.8s", dir:"r" },
  { c:"#ffae01", l:"62.3%", w:"2.9%", d:"0.4s", dir:"l" },
  { c:"#ff00bf", l:"65.8%", w:"1.7%", d:"1.0s", dir:"r" },
  { c:"#a601f4", l:"72.8%", w:"0.8%", d:"0.6s", dir:"l" },
  { c:"#f30b34", l:"74.3%", w:"2%",   d:"1.5s", dir:"r" },
  { c:"#ff00bf", l:"79.8%", w:"2%",   d:"0.9s", dir:"l" },
  { c:"#04fd8f", l:"78.2%", w:"2%",   d:"1.3s", dir:"r" },
  { c:"#01ffff", l:"78.5%", w:"2%",   d:"0.7s", dir:"l" },
  { c:"#a201ff", l:"85.3%", w:"1.1%", d:"1.1s", dir:"r" },
];

function EffectBrush({ bottom = "10%", height = "30%" }: { bottom?: string; height?: string }) {
  return (
    <div className="ni-brush">
      {FURS.map((f, i) => (
        <span key={i} style={{
          display:"block", position:"absolute",
          left:f.left, width:f.width, bottom, height,
          background:`linear-gradient(to bottom,#e40913 0%,#e40913 ${f.s1},rgba(0,0,0,0) ${f.s2},rgba(0,0,0,0) 100%)`,
        }} />
      ))}
    </div>
  );
}

function EffectLumieres() {
  return (
    <div className="ni-lumieres">
      {LAMPS.map((l, i) => (
        <span key={i} className={l.dir === "l" ? "ni-lamp-l" : "ni-lamp-r"} style={{
          position:"absolute", display:"block", height:"100%",
          left:l.l, width:l.w, animationDelay:l.d,
          background:l.c, boxShadow:`0 0 10px 0 ${l.c}bf`,
        }} />
      ))}
    </div>
  );
}

/* ─── Intro wrapper ──────────────────────────────────────────────────────── */
const NetflixIntro = ({}: {
  duration: number;
}) => {
  useEffect(() => {
    const audio = new Audio("/sounds/netflix-intro.mp3");
    audio.volume = 0.85;
    audio.play().catch(() => {});
    return () => { audio.pause(); audio.src = ""; };
  }, []);
  /* ── CodePen mdryxPv exact recreation ── */
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black overflow-hidden">
      <style>{`
        @keyframes ni-zoom   { 0%{transform:scale(1)} 100%{transform:scale(15)} }
        @keyframes ni-brush  { 0%{transform:translateY(0)} 100%{transform:translateY(-100%)} }
        @keyframes ni-fadeout{ 0%{opacity:1} 100%{opacity:0} }
        @keyframes ni-fadlum { 0%{background-color:rgba(228,9,19,.5)} 100%{background-color:rgba(228,9,19,0)} }
        @keyframes ni-showlum{ 0%{opacity:0} 100%{opacity:1} }
        @keyframes ni-lum-r  { 0%{transform:translate(0)} 40%{transform:translate(-10px) scaleX(1)}
                                50%{transform:translate(-60px)} 100%{transform:translate(-120px) scaleX(3)} }
        @keyframes ni-lum-l  { 0%{transform:translate(0)} 40%{transform:translate(10px) scaleX(1)}
                                50%{transform:translate(60px)} 100%{transform:translate(120px) scaleX(3)} }

        .ni-intro {
          position:relative; width:300px; height:300px; overflow:hidden;
          transform-origin:30% center;
          animation:ni-zoom 3.5s .5s ease-in forwards;
        }
        .ni-intro::before {
          content:""; position:absolute; display:block;
          background:#000; width:150%; height:30%;
          left:-25%; bottom:-27%; border-radius:50%; z-index:5;
        }
        .ni-h { position:absolute; }

        .ni-h1 {
          width:19.5%; height:100%; background-color:#e40913;
          left:22.4%; top:0; transform:rotate(180deg);
          animation:ni-fadlum 2s .6s forwards;
        }
        .ni-h1 .ni-brush { animation:ni-brush 2.5s 1.2s forwards; }

        .ni-h3 {
          width:19%; height:150%; background-color:#e40913;
          left:40.5%; top:-25%; transform:rotate(-19.5deg);
          box-shadow:0 0 35px -12px rgba(0,0,0,.4); overflow:hidden;
        }
        .ni-h3 .ni-brush { animation:ni-brush 2s .8s forwards; }

        .ni-h2 {
          width:19.5%; height:100%; background-color:#e40913;
          left:57.8%; top:0; transform:rotate(180deg); overflow:hidden;
        }
        .ni-h2 .ni-brush { animation:ni-brush 2s .5s forwards; }

        .ni-brush {
          position:absolute; width:100%; height:300%; top:0; overflow:hidden;
        }
        .ni-brush::before {
          display:block; content:""; position:absolute;
          background-color:#e40913; width:100%; height:70%;
          box-shadow:0 0 29px 24px #e40913;
        }

        .ni-lumieres {
          position:absolute; width:100%; height:100%;
          opacity:0; animation:ni-showlum 2s 1.6s forwards;
        }
        .ni-lamp-l { animation:ni-lum-l 5s forwards; }
        .ni-lamp-r { animation:ni-lum-r 5s forwards; }
      `}</style>

      <div className="ni-intro">
        <div className="ni-h ni-h1">
          <EffectBrush bottom="0" height="40%" />
          <EffectLumieres />
        </div>
        <div className="ni-h ni-h3">
          <EffectBrush />
        </div>
        <div className="ni-h ni-h2">
          <EffectBrush />
        </div>
      </div>
    </div>
  );
};

/* ─── Main page ──────────────────────────────────────────────────────────── */
export default function NetflixInvitationPage() {
  const [showIntro, setShowIntro] = useState(true);
  const invitationId = getInvitationId();
  const previewTemplate = getPreviewTemplate();
  const { toast } = useToast();

  const { data: invitation, isLoading, isError } = useQuery<InvitationWithWedding>({
    queryKey: previewTemplate ? ["/api/demo", previewTemplate] : ["/api/invitations", invitationId],
    queryFn: previewTemplate
      ? async () => { const r = await fetch(`/api/demo/${previewTemplate}`); return r.json(); }
      : undefined,
    enabled: previewTemplate ? true : !!invitationId,
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  useEffect(() => {
    if (invitation) {
      const t = setTimeout(() => setShowIntro(false), invitation.wedding?.introDuration || 4000);
      return () => clearTimeout(t);
    }
  }, [invitation]);

  const respondMutation = useMutation({
    mutationFn: async ({ status, confirmedSeats }: { status: string; confirmedSeats: number }) => {
      const r = await apiRequest("POST", `/api/invitations/${invitationId}/respond`, { status, confirmedSeats });
      return r.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invitations", invitationId] });
      toast({ title: "Respuesta enviada", description: "¡Gracias por confirmar!" });
    },
    onError: () => {
      toast({ title: "Error", description: "No se pudo enviar tu respuesta.", variant: "destructive" });
    },
  });

  const [selectedSeats, setSelectedSeats] = useState("1");
  const seatOptions = useMemo(() => {
    if (!invitation) return [];
    return Array.from({ length: invitation.seats }, (_, i) => i + 1);
  }, [invitation?.seats]);

  if (isLoading) return <div className="min-h-screen bg-black flex items-center justify-center"><div className="w-10 h-10 border-4 border-[#E50914] border-t-transparent rounded-full animate-spin" /></div>;
  if (isError || !invitation) return <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4"><p className="text-white/60 font-sans">No se pudo cargar la invitación.</p><button onClick={() => queryClient.resetQueries({ queryKey: ["/api/invitations", invitationId] })} className="px-6 py-2 rounded text-white text-sm" style={{ background: "#E50914" }}>Reintentar</button></div>;

  const { wedding } = invitation;

  return (
    <div className="min-h-screen bg-[#141414] text-white font-sans selection:bg-[#E50914] selection:text-white">
      <AnimatePresence>
        {showIntro && (
          <motion.div key="intro" exit={{ opacity: 0 }} transition={{ duration: 0.8 }}>
            <NetflixIntro duration={wedding.introDuration} />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showIntro ? 0 : 1 }}
        transition={{ duration: 1 }}
        className="pb-20"
      >
        {/* Hero */}
        <section className="relative h-[70vh] w-full">
          <div className="absolute inset-0">
            <img src={wedding.couplePhotoUrl || "/images/couple.png"} alt={wedding.coupleName}
              className="w-full h-full object-cover" data-testid="img-hero"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
            <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/40 to-transparent" />
          </div>
          <div className="absolute bottom-10 left-0 right-0 px-6 max-w-4xl mx-auto">
            <motion.p initial={{ y:20,opacity:0 }} animate={{ y:0,opacity:1 }} transition={{ delay:.2 }}
              className="text-[#E50914] font-bold tracking-widest text-sm mb-2 uppercase" data-testid="text-now-streaming">
              Transmitiendo ahora
            </motion.p>
            <motion.h1 initial={{ y:20,opacity:0 }} animate={{ y:0,opacity:1 }} transition={{ delay:.4 }}
              className="text-4xl md:text-6xl font-black mb-4" data-testid="text-couple-name">
              {wedding.coupleName}
            </motion.h1>
            <motion.div initial={{ y:20,opacity:0 }} animate={{ y:0,opacity:1 }} transition={{ delay:.6 }}
              className="flex items-center gap-4 text-[#999] font-bold flex-wrap">
              <span className="text-green-500">98% Compatibles</span>
              <span>{wedding.weddingDate}</span>
              <span className="border border-[#999] px-1 text-xs">4K</span>
              <span className="border border-[#999] px-1 text-xs">HDR</span>
            </motion.div>
            <div className="flex gap-3 mt-6">
              <Button className="bg-white text-black hover:bg-white/90 font-bold px-8" data-testid="button-play"
                onClick={() => document.getElementById("rsvp-section")?.scrollIntoView({ behavior:"smooth" })}>
                <Play className="w-5 h-5 mr-2 fill-current" /> Confirmar asistencia
              </Button>
              <Button variant="outline" className="bg-[#515151]/50 border-none hover:bg-[#515151]/70 font-bold px-8 text-white"
                data-testid="button-info"
                onClick={() => document.getElementById("details-section")?.scrollIntoView({ behavior:"smooth" })}>
                <Info className="w-5 h-5 mr-2" /> Más info
              </Button>
            </div>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-6 mt-10 space-y-12" id="details-section">
          {/* Synopsis */}
          <section className="max-w-2xl">
            <h2 className="text-xl font-bold mb-4">Nuestra Historia de Amor</h2>
            <p className="text-[#999] text-lg leading-relaxed" data-testid="text-wedding-message">
              {wedding.message || "Únete a nosotros para el episodio más especial de nuestras vidas."}
            </p>
          </section>

          {/* Episode cards */}
          <section>
            <h2 className="text-2xl font-bold mb-6">Los Episodios de la Boda</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { label:"EPISODIO 1", title: wedding.churchName || "Ceremonia Religiosa", time: wedding.churchTime, addr: wedding.churchAddress, testid:"card-church" },
                { label:"EPISODIO 2", title: wedding.venueName || "Recepción",            time: wedding.venueTime,  addr: wedding.venueAddress,  testid:"card-venue" },
              ].map((ep) => (
                <motion.div key={ep.testid} whileHover={{ scale:1.02 }}
                  className="bg-[#181818] rounded-md overflow-hidden group border-b-4 border-transparent hover:border-[#E50914] transition-all"
                  data-testid={ep.testid}>
                  <div className="aspect-video relative bg-[#0d0d0d] flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/40" />
                    <div className="absolute top-2 left-2 bg-black/60 px-2 py-1 rounded text-xs font-bold">{ep.label}</div>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold">{ep.title}</h3>
                      <span className="text-[#999] text-sm">{ep.time}</span>
                    </div>
                    <p className="text-[#999] text-sm mb-4"><MapPin className="w-3 h-3 inline mr-1" />{ep.addr}</p>
                    <Button variant="ghost" className="p-0 text-[#E50914] hover:text-[#E50914] hover:bg-transparent h-auto"
                      onClick={() => window.open(`https://maps.google.com/?q=${ep.addr}`, "_blank")}>
                      Cómo llegar
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Dress code + gifts */}
          <div className="grid md:grid-cols-2 gap-12">
            <section>
              <h2 className="text-2xl font-bold mb-6">Código de Vestimenta</h2>
              <div className="bg-[#181818] p-6 rounded-md flex items-center gap-4">
                <Tv className="w-10 h-10 text-[#E50914] shrink-0" />
                <div>
                  <h3 className="text-xl font-bold">Vestimenta</h3>
                  <p className="text-[#999]" data-testid="text-dress-code">{wedding.dressCode}</p>
                </div>
              </div>
            </section>
            <section>
              <h2 className="text-2xl font-bold mb-6">Mesa de Regalos</h2>
              <div className="flex flex-wrap gap-4">
                {wedding.giftLabel1 && (
                  <Button className="bg-[#181818] hover:bg-[#252525] border border-white/10" data-testid="button-gift-1"
                    onClick={() => window.open(wedding.giftUrl1 || "#", "_blank")}>
                    <Gift className="w-4 h-4 mr-2" />{wedding.giftLabel1}
                  </Button>
                )}
                {wedding.giftLabel2 && (
                  <Button className="bg-[#181818] hover:bg-[#252525] border border-white/10" data-testid="button-gift-2"
                    onClick={() => window.open(wedding.giftUrl2 || "#", "_blank")}>
                    <Gift className="w-4 h-4 mr-2" />{wedding.giftLabel2}
                  </Button>
                )}
              </div>
            </section>
          </div>

          {/* RSVP */}
          <section id="rsvp-section" className="bg-[#181818] p-8 md:p-12 rounded-md border-l-8 border-[#E50914]">
            <div className="max-w-xl">
              <h2 className="text-3xl font-black mb-4">¿Listo para verlo?</h2>
              <p className="text-lg text-[#999] mb-8">
                Confirma tu asistencia al estreno de temporada de {wedding.coupleName}.
              </p>
              {invitation.status !== "pending" ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-green-500 font-bold text-xl">
                    <Check className="w-6 h-6" />
                    {invitation.status === "accepted" ? "¡Confirmado!" : "Declinado"}
                  </div>
                  <p className="text-[#999]">
                    {invitation.status === "accepted"
                      ? `Hemos reservado ${invitation.confirmedSeats} lugar(es) para ti, ${invitation.guestName}.`
                      : `Te extrañaremos, ${invitation.guestName}.`}
                  </p>
                  <Button variant="ghost" className="text-[#E50914] hover:text-[#E50914] hover:bg-transparent h-auto p-0 font-bold"
                    onClick={() => respondMutation.mutate({ status:"pending", confirmedSeats:0 })}>
                    Cambiar respuesta
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold uppercase tracking-wider text-[#999]">Nombre del invitado</label>
                    <p className="text-xl font-bold" data-testid="text-guest-name">{invitation.guestName}</p>
                  </div>
                  <div className="space-y-4">
                    <label className="text-sm font-bold uppercase tracking-wider text-[#999]">Número de asistentes</label>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Select value={selectedSeats} onValueChange={setSelectedSeats}>
                        <SelectTrigger className="w-full sm:w-[200px] bg-white text-black font-bold h-12" data-testid="select-seats">
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
                        <Button className="flex-1 bg-[#E50914] hover:bg-[#B9090B] text-white font-bold h-12"
                          data-testid="button-confirm" disabled={respondMutation.isPending}
                          onClick={() => respondMutation.mutate({ status:"accepted", confirmedSeats:parseInt(selectedSeats) })}>
                          Confirmar
                        </Button>
                        <Button className="flex-1 bg-transparent hover:bg-white/10 border border-white/30 text-white font-bold h-12"
                          data-testid="button-decline" disabled={respondMutation.isPending}
                          onClick={() => respondMutation.mutate({ status:"declined", confirmedSeats:0 })}>
                          No podré ir
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* QR */}
          {invitation.qrCode && (
            <section className="flex flex-col items-center py-12 border-t border-white/10">
              <QrCode className="w-12 h-12 text-[#E50914] mb-4" />
              <h2 className="text-2xl font-bold mb-6">Tu Boleto de Entrada</h2>
              <div className="bg-white p-4 rounded-md">
                <img src={invitation.qrCode} alt="Código QR" className="w-48 h-48" data-testid="img-qr-code" />
              </div>
              <p className="text-[#999] mt-4 text-sm font-bold uppercase tracking-widest">Presenta en la entrada</p>
            </section>
          )}
        </div>

        <footer className="mt-20 py-10 border-t border-white/10 text-center text-[#999]">
          <p className="font-bold text-sm tracking-widest uppercase">Una Boda Original</p>
          <p className="mt-2">© {new Date().getFullYear()} {wedding.coupleName}</p>
        </footer>
      </motion.div>
      <MusicPlayer
        musicUrl={wedding.musicUrl}
        musicType={wedding.musicType ?? "none"}
        started={!showIntro}
      />
    </div>
  );
}
