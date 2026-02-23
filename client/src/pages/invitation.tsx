import { useState, useEffect, useMemo, lazy, Suspense } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
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
import {
  Church,
  PartyPopper,
  Shirt,
  Gift,
  Banknote,
  Clock,
  MapPin,
  Heart,
  Check,
  X,
  Copy,
} from "lucide-react";
import type { Invitation, Wedding } from "@shared/schema";
import { INVITATION_STYLES } from "@shared/schema";

const NetflixInvitationPage = lazy(() => import("./netflix-invitation"));
const NinetiesInvitationPage = lazy(() => import("./nineties-invitation"));

type InvitationWithWedding = Invitation & { wedding: Wedding | null };
type Colors = { bg: string; primary: string; accent: string; text: string };

const FALLBACK_COLORS: Colors = { bg: "#FDF8F0", primary: "#800020", accent: "#C9A96E", text: "#5C4033" };

function darkenHex(hex: string, amount: number): string {
  const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - amount);
  const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - amount);
  const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - amount);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

function lightenHex(hex: string, amount: number): string {
  const r = Math.min(255, parseInt(hex.slice(1, 3), 16) + amount);
  const g = Math.min(255, parseInt(hex.slice(3, 5), 16) + amount);
  const b = Math.min(255, parseInt(hex.slice(5, 7), 16) + amount);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

function getInvitationId(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

function GoldDivider({ colors }: { colors: Colors }) {
  return (
    <div className="flex items-center justify-center gap-4 my-8">
      <div className="h-px w-16" style={{ background: `linear-gradient(to right, transparent, ${colors.accent})` }} />
      <Heart className="w-4 h-4" style={{ color: colors.accent, fill: colors.accent }} />
      <div className="h-px w-16" style={{ background: `linear-gradient(to left, transparent, ${colors.accent})` }} />
    </div>
  );
}

function SectionWrapper({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`w-full max-w-lg mx-auto px-6 py-10 text-center ${className}`}
    >
      {children}
    </motion.section>
  );
}

function CountdownTimer({ colors, weddingDate }: { colors: Colors; weddingDate?: string | null }) {
  const textMuted = colors.text + "BB";
  const targetDate = useMemo(() => {
    return new Date("2026-03-15T16:00:00").getTime();
  }, []);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const diff = Math.max(0, targetDate - now);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return (
    <div className="flex justify-center gap-3 flex-wrap" data-testid="countdown-timer">
      {[{ label: "Días", value: days }, { label: "Horas", value: hours }, { label: "Min", value: minutes }, { label: "Seg", value: seconds }].map((u) => (
        <div
          key={u.label}
          className="flex flex-col items-center rounded-md bg-white/60 dark:bg-black/30 px-4 py-3 min-w-[70px]"
          style={{ borderWidth: 1, borderStyle: "solid", borderColor: colors.accent + "4D" }}
        >
          <span className="text-3xl font-sans font-bold" style={{ color: colors.primary }}>
            {String(u.value).padStart(2, "0")}
          </span>
          <span className="text-xs font-serif uppercase tracking-widest mt-1" style={{ color: textMuted }}>
            {u.label}
          </span>
        </div>
      ))}
    </div>
  );
}

function RSVPSection({ invitation, invitationId, colors }: { invitation: Invitation; invitationId: string; colors: Colors }) {
  const textMuted = colors.text + "BB";
  const { toast } = useToast();
  const [selectedSeats, setSelectedSeats] = useState("1");
  const [responded, setResponded] = useState(invitation.status !== "pending");

  const respondMutation = useMutation({
    mutationFn: async ({ status, confirmedSeats }: { status: string; confirmedSeats: number }) => {
      const res = await apiRequest("POST", `/api/invitations/${invitationId}/respond`, { status, confirmedSeats });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invitations", invitationId] });
      setResponded(true);
      toast({ title: "Respuesta enviada", description: "Gracias por confirmar tu asistencia." });
    },
    onError: () => {
      toast({ title: "Error", description: "No se pudo enviar tu respuesta. Inténtalo de nuevo.", variant: "destructive" });
    },
  });

  const seatOptions = useMemo(() => Array.from({ length: invitation.seats }, (_, i) => i + 1), [invitation.seats]);

  if (responded || invitation.status !== "pending") {
    return (
      <SectionWrapper>
        <div className="rounded-md bg-white/70 dark:bg-black/30 p-8" style={{ borderWidth: 1, borderStyle: "solid", borderColor: colors.accent + "4D" }}>
          <Check className="w-12 h-12 text-[#9CAF88] mx-auto mb-4" />
          <h3 className="text-2xl font-sans mb-2" style={{ color: colors.primary }}>
            {invitation.status === "accepted" ? "Asistencia Confirmada" : invitation.status === "declined" ? "Invitación Declinada" : "Respuesta Registrada"}
          </h3>
          <p className="font-serif" style={{ color: textMuted }} data-testid="text-rsvp-status">
            {invitation.status === "accepted"
              ? `Has confirmado ${invitation.confirmedSeats} lugar${(invitation.confirmedSeats || 0) > 1 ? "es" : ""}.`
              : invitation.status === "declined"
              ? "Lamentamos que no puedas asistir."
              : "Tu respuesta ha sido registrada."}
          </p>
          <p className="font-serif mt-4 italic" style={{ color: textMuted }}>Gracias, {invitation.guestName}</p>
        </div>
      </SectionWrapper>
    );
  }

  return (
    <SectionWrapper>
      <h2 className="text-3xl font-sans mb-2" style={{ color: colors.primary }}>Confirma tu Asistencia</h2>
      <GoldDivider colors={colors} />
      <div className="rounded-md bg-white/70 dark:bg-black/30 p-8 space-y-6" style={{ borderWidth: 1, borderStyle: "solid", borderColor: colors.accent + "4D" }}>
        <p className="font-serif text-lg" style={{ color: colors.text }} data-testid="text-guest-name">
          Estimado/a <span className="font-bold">{invitation.guestName}</span>
        </p>
        <p className="font-serif" style={{ color: textMuted }} data-testid="text-assigned-seats">
          Lugares asignados: <span className="font-bold">{invitation.seats}</span>
        </p>
        <div className="space-y-2">
          <label className="text-sm font-serif" style={{ color: textMuted }}>¿Cuántos lugares confirmas?</label>
          <Select value={selectedSeats} onValueChange={setSelectedSeats}>
            <SelectTrigger data-testid="select-seats" className="w-full max-w-[200px] mx-auto">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {seatOptions.map((n) => (
                <SelectItem key={n} value={String(n)}>{n} {n === 1 ? "lugar" : "lugares"}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex justify-center gap-4 flex-wrap">
          <Button
            data-testid="button-accept"
            className="text-white"
            style={{ backgroundColor: colors.primary, borderColor: colors.primary }}
            disabled={respondMutation.isPending}
            onClick={() => respondMutation.mutate({ status: "accepted", confirmedSeats: parseInt(selectedSeats) })}
          >
            <Check className="w-4 h-4 mr-2" />
            Acepto con Gusto
          </Button>
          <Button
            data-testid="button-decline"
            variant="outline"
            disabled={respondMutation.isPending}
            onClick={() => respondMutation.mutate({ status: "declined", confirmedSeats: 0 })}
          >
            <X className="w-4 h-4 mr-2" />
            No Podré Asistir
          </Button>
        </div>
      </div>
    </SectionWrapper>
  );
}

function QRCodeSection({ invitation, colors }: { invitation: Invitation; colors: Colors }) {
  const textMuted = colors.text + "BB";
  if (!invitation.qrCode) return null;
  return (
    <SectionWrapper>
      <h2 className="text-2xl font-sans mb-2" style={{ color: colors.primary }}>Código QR</h2>
      <GoldDivider colors={colors} />
      <div className="rounded-md bg-white/80 dark:bg-black/30 p-6 inline-block" style={{ borderWidth: 1, borderStyle: "solid", borderColor: colors.accent + "4D" }}>
        <img src={invitation.qrCode} alt="QR Code de invitación" className="w-48 h-48 mx-auto" data-testid="img-qr-code" />
      </div>
      <p className="font-serif mt-4 italic text-sm" style={{ color: textMuted }}>Presenta este código QR en la entrada</p>
    </SectionWrapper>
  );
}

function VideoIntro({ wedding, onDone }: { wedding: Wedding; onDone: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDone, wedding.introDuration);
    return () => clearTimeout(timer);
  }, [wedding.introDuration, onDone]);

  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const hideTimer = setTimeout(() => setVisible(false), wedding.introDuration - 400);
    return () => clearTimeout(hideTimer);
  }, [wedding.introDuration]);

  if (!visible) return null;

  if (wedding.videoType === "youtube" && wedding.videoUrl) {
    const videoId = wedding.videoUrl.includes("youtu.be/")
      ? wedding.videoUrl.split("youtu.be/")[1]?.split("?")[0]
      : wedding.videoUrl.split("v=")[1]?.split("&")[0];
    return (
      <motion.div
        className="fixed inset-0 z-50 bg-black flex items-center justify-center"
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
      >
        {videoId && (
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1`}
            allow="autoplay; fullscreen"
            allowFullScreen
          />
        )}
      </motion.div>
    );
  }

  if (wedding.videoType === "mp4" && wedding.videoUrl) {
    return (
      <motion.div
        className="fixed inset-0 z-50 bg-black flex items-center justify-center"
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
      >
        <video
          className="w-full h-full object-cover"
          src={wedding.videoUrl}
          autoPlay
          muted
          playsInline
          loop
        />
      </motion.div>
    );
  }

  return null;
}

function ClassicTemplate({ invData, invitationId }: { invData: InvitationWithWedding; invitationId: string }) {
  const wedding = invData.wedding;
  const introDuration = wedding?.introDuration ?? 4000;
  const videoType = wedding?.videoType ?? "none";

  const [curtainsOpen, setCurtainsOpen] = useState(false);
  const [curtainsMounted, setCurtainsMounted] = useState(videoType === "none");
  const [contentVisible, setContentVisible] = useState(false);
  const [videoDone, setVideoDone] = useState(videoType === "none");

  const colorStyleId = wedding?.colorStyleId ?? "clasico";
  const styleDef = INVITATION_STYLES.find(s => s.id === colorStyleId);
  const colors: Colors = styleDef?.preview ?? FALLBACK_COLORS;
  const textMuted = colors.text + "BB";
  const primaryDark = darkenHex(colors.primary, 36);
  const primaryLight = lightenHex(colors.primary, 50);

  const { toast } = useToast();
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copiado", description: "CLABE copiada al portapapeles" });
  };

  useEffect(() => {
    if (!videoDone) return;
    const openDelay = Math.max(500, introDuration - 2200);
    const t1 = setTimeout(() => setCurtainsOpen(true), openDelay);
    const t2 = setTimeout(() => setContentVisible(true), introDuration);
    const t3 = setTimeout(() => setCurtainsMounted(false), introDuration + 400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [videoDone, introDuration]);

  const handleVideoDone = () => {
    setVideoDone(true);
    setCurtainsMounted(true);
  };

  const coupleName = wedding?.coupleName ?? "Ana María & Carlos Eduardo";
  const [name1, name2] = coupleName.includes("&") ? coupleName.split("&").map(s => s.trim()) : [coupleName, ""];
  const weddingDate = wedding?.weddingDate ?? "15 de marzo de 2026";
  const churchName = wedding?.churchName ?? "Parroquia San José";
  const churchAddress = wedding?.churchAddress ?? "";
  const churchTime = wedding?.churchTime ?? "4:00 PM";
  const venueName = wedding?.venueName ?? "Salón Imperial";
  const venueAddress = wedding?.venueAddress ?? "";
  const venueTime = wedding?.venueTime ?? "7:00 PM";
  const dressCode = wedding?.dressCode ?? "Formal / Etiqueta";
  const message = wedding?.message ?? "";
  const couplePhotoUrl = wedding?.couplePhotoUrl ?? "/images/couple.png";
  const giftUrl1 = wedding?.giftUrl1 ?? "https://www.liverpool.com.mx";
  const giftLabel1 = wedding?.giftLabel1 ?? "Liverpool";
  const giftUrl2 = wedding?.giftUrl2 ?? "https://www.amazon.com.mx";
  const giftLabel2 = wedding?.giftLabel2 ?? "Amazon";

  return (
    <div className="relative min-h-screen overflow-x-hidden" style={{ backgroundImage: "url(/images/pattern-bg.png)", backgroundRepeat: "repeat", backgroundSize: "300px" }}>
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundColor: colors.bg + "E6" }} />
      <div className="absolute inset-0 dark:bg-[#1a1512]/90 pointer-events-none" />

      {videoType !== "none" && !videoDone && (
        <VideoIntro wedding={wedding!} onDone={handleVideoDone} />
      )}

      <div className="relative z-10">
        {curtainsMounted && (
          <div
            className="rn-outer"
            style={{ "--rn-accent": colors.primary, "--rn-dark": primaryDark, "--rn-light": primaryLight } as React.CSSProperties}
          >
            <div className={`rn-inner-left${curtainsOpen ? " rn-open" : ""}`}>
              {Array.from({ length: 12 }).map((_, i) => <div key={i} className="rn-unit" />)}
            </div>
            <div className={`rn-inner-right${curtainsOpen ? " rn-open" : ""}`}>
              {Array.from({ length: 12 }).map((_, i) => <div key={i} className="rn-unit" />)}
            </div>
            <div className={`rn-center-text${curtainsOpen ? " rn-text-hide" : ""}`}>
              <p className="font-sans text-lg tracking-[0.3em] uppercase" style={{ color: colors.accent }}>Estás Invitado</p>
            </div>
          </div>
        )}

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: contentVisible ? 1 : 0 }} transition={{ duration: 1.2 }} className="flex flex-col items-center pt-12 pb-6 px-4">
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 mx-auto mb-8">
            <div className="w-full h-full rounded-full p-1" style={{ borderWidth: 4, borderStyle: "solid", borderColor: colors.accent + "80" }}>
              <img src={couplePhotoUrl} alt={coupleName} className="w-full h-full object-cover rounded-full" data-testid="img-couple" />
            </div>
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: contentVisible ? 1 : 0, y: contentVisible ? 0 : 20 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-4xl sm:text-5xl font-sans text-center leading-tight"
            style={{ color: colors.primary }}
            data-testid="text-couple-names"
          >
            {name1}
            {name2 && <><span className="block text-2xl my-1" style={{ color: colors.accent }}>&</span>{name2}</>}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: contentVisible ? 1 : 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="font-serif text-lg mt-4 tracking-widest uppercase"
            style={{ color: textMuted }}
            data-testid="text-wedding-date"
          >
            {weddingDate}
          </motion.p>

          <GoldDivider colors={colors} />

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: contentVisible ? 1 : 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="font-serif text-center max-w-md italic"
            style={{ color: textMuted }}
          >
            {message || "Con la bendición de Dios y de nuestros padres, tenemos el honor de invitarte a celebrar nuestra unión en matrimonio."}
          </motion.p>
        </motion.div>

        <SectionWrapper>
          <div className="flex items-center justify-center gap-2 mb-4">
            <Church className="w-6 h-6" style={{ color: colors.accent }} />
            <h2 className="text-3xl font-sans" style={{ color: colors.primary }}>Ceremonia Religiosa</h2>
          </div>
          <GoldDivider colors={colors} />
          <div className="rounded-md overflow-visible bg-white/50 dark:bg-black/20" style={{ borderWidth: 1, borderStyle: "solid", borderColor: colors.accent + "33" }}>
            <img src="/images/church.png" alt={churchName} className="w-full h-48 object-cover" data-testid="img-church" />
            <div className="p-6">
              <h3 className="text-xl font-sans mb-1" style={{ color: colors.text }}>{churchName}</h3>
              {churchAddress && <p className="font-serif text-sm mb-1" style={{ color: textMuted }}><MapPin className="w-4 h-4 inline mr-1" />{churchAddress}</p>}
              <p className="font-serif mb-1" style={{ color: textMuted }}><Clock className="w-4 h-4 inline mr-1" />{churchTime}</p>
              <Button variant="outline" className="mt-4" data-testid="button-map-church" onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(churchAddress || churchName)}`, "_blank")}>
                <MapPin className="w-4 h-4 mr-2" />Ver en Google Maps
              </Button>
            </div>
          </div>
        </SectionWrapper>

        <SectionWrapper>
          <div className="flex items-center justify-center gap-2 mb-4">
            <PartyPopper className="w-6 h-6" style={{ color: colors.accent }} />
            <h2 className="text-3xl font-sans" style={{ color: colors.primary }}>Recepción</h2>
          </div>
          <GoldDivider colors={colors} />
          <div className="rounded-md overflow-visible bg-white/50 dark:bg-black/20" style={{ borderWidth: 1, borderStyle: "solid", borderColor: colors.accent + "33" }}>
            <img src="/images/venue.png" alt={venueName} className="w-full h-48 object-cover" data-testid="img-venue" />
            <div className="p-6">
              <h3 className="text-xl font-sans mb-1" style={{ color: colors.text }}>{venueName}</h3>
              {venueAddress && <p className="font-serif text-sm mb-1" style={{ color: textMuted }}><MapPin className="w-4 h-4 inline mr-1" />{venueAddress}</p>}
              <p className="font-serif mb-1" style={{ color: textMuted }}><Clock className="w-4 h-4 inline mr-1" />{venueTime}</p>
              <Button variant="outline" className="mt-4" data-testid="button-map-venue" onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(venueAddress || venueName)}`, "_blank")}>
                <MapPin className="w-4 h-4 mr-2" />Ver en Google Maps
              </Button>
            </div>
          </div>
        </SectionWrapper>

        <SectionWrapper>
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shirt className="w-6 h-6" style={{ color: colors.accent }} />
            <h2 className="text-3xl font-sans" style={{ color: colors.primary }}>Código de Vestimenta</h2>
          </div>
          <GoldDivider colors={colors} />
          <div className="rounded-md bg-white/50 dark:bg-black/20 p-8" style={{ borderWidth: 1, borderStyle: "solid", borderColor: colors.accent + "33" }}>
            <p className="text-2xl font-sans mb-4" style={{ color: colors.text }}>{dressCode}</p>
          </div>
        </SectionWrapper>

        <SectionWrapper>
          <div className="flex items-center justify-center gap-2 mb-4">
            <Gift className="w-6 h-6" style={{ color: colors.accent }} />
            <h2 className="text-3xl font-sans" style={{ color: colors.primary }}>Mesa de Regalos</h2>
          </div>
          <GoldDivider colors={colors} />
          <div className="space-y-4">
            {giftUrl1 && (
              <div className="rounded-md bg-white/50 dark:bg-black/20 p-6" style={{ borderWidth: 1, borderStyle: "solid", borderColor: colors.accent + "33" }}>
                <h3 className="font-sans text-lg mb-1" style={{ color: colors.text }}>{giftLabel1}</h3>
                <Button variant="outline" data-testid="button-gift-1" onClick={() => window.open(giftUrl1, "_blank")}>
                  <Gift className="w-4 h-4 mr-2" />Ver Lista
                </Button>
              </div>
            )}
            {giftUrl2 && (
              <div className="rounded-md bg-white/50 dark:bg-black/20 p-6" style={{ borderWidth: 1, borderStyle: "solid", borderColor: colors.accent + "33" }}>
                <h3 className="font-sans text-lg mb-1" style={{ color: colors.text }}>{giftLabel2}</h3>
                <Button variant="outline" data-testid="button-gift-2" onClick={() => window.open(giftUrl2, "_blank")}>
                  <Gift className="w-4 h-4 mr-2" />Ver Lista
                </Button>
              </div>
            )}
          </div>
        </SectionWrapper>

        <SectionWrapper>
          <div className="flex items-center justify-center gap-2 mb-4">
            <Banknote className="w-6 h-6" style={{ color: colors.accent }} />
            <h2 className="text-3xl font-sans" style={{ color: colors.primary }}>Lluvia de Sobres</h2>
          </div>
          <GoldDivider colors={colors} />
          <div className="rounded-md bg-white/50 dark:bg-black/20 p-8" style={{ borderWidth: 1, borderStyle: "solid", borderColor: colors.accent + "33" }}>
            <p className="font-serif mb-6 italic" style={{ color: textMuted }}>
              Si deseas obsequiarnos un detalle monetario, puedes hacerlo a través de la siguiente cuenta bancaria:
            </p>
            <div className="rounded-md p-4 mb-4 dark:bg-black/30" style={{ backgroundColor: colors.bg }}>
              <p className="font-serif text-xs uppercase tracking-wider mb-1" style={{ color: textMuted }}>CLABE Interbancaria</p>
              <div className="flex items-center justify-center gap-2">
                <p className="font-mono text-lg tracking-wider" style={{ color: colors.text }} data-testid="text-clabe">012345678901234567</p>
                <Button size="icon" variant="ghost" data-testid="button-copy-clabe" onClick={() => copyToClipboard("012345678901234567")}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <p className="font-serif italic text-sm" style={{ color: colors.accent }}>Tu presencia es nuestro mejor regalo</p>
          </div>
        </SectionWrapper>

        <SectionWrapper>
          <div className="flex items-center justify-center gap-2 mb-4">
            <Clock className="w-6 h-6" style={{ color: colors.accent }} />
            <h2 className="text-3xl font-sans" style={{ color: colors.primary }}>Cuenta Regresiva</h2>
          </div>
          <GoldDivider colors={colors} />
          <CountdownTimer colors={colors} weddingDate={weddingDate} />
        </SectionWrapper>

        {invitationId && invData && (
          <>
            <RSVPSection invitation={invData} invitationId={invitationId} colors={colors} />
            <QRCodeSection invitation={invData} colors={colors} />
          </>
        )}

        <motion.footer
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center py-12 px-4"
        >
          <GoldDivider colors={colors} />
          <p className="font-sans text-2xl" style={{ color: colors.primary }}>{coupleName}</p>
          <p className="font-serif mt-2 text-sm tracking-widest uppercase" style={{ color: textMuted }}>{weddingDate}</p>
          <p className="font-serif mt-4 italic text-sm" style={{ color: colors.accent }}>Con amor, los esperamos</p>
        </motion.footer>
      </div>
    </div>
  );
}

export default function InvitationPage() {
  const invitationId = getInvitationId();

  const { data: invData, isLoading } = useQuery<InvitationWithWedding>({
    queryKey: ["/api/invitations", invitationId],
    enabled: !!invitationId,
  });

  const template = invData?.wedding?.template ?? "clasico";

  if (isLoading || (invitationId && !invData)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FDF8F0]">
        <div className="w-10 h-10 border-4 border-[#C9A96E] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (template === "netflix") {
    return (
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-black"><div className="w-10 h-10 border-4 border-[#E50914] border-t-transparent rounded-full animate-spin" /></div>}>
        <NetflixInvitationPage />
      </Suspense>
    );
  }

  if (template === "nineties") {
    return (
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-[#008080]"><div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin" /></div>}>
        <NinetiesInvitationPage />
      </Suspense>
    );
  }

  if (!invData) {
    return (
      <ClassicTemplate
        invData={{ id: "", weddingId: null, guestName: "", seats: 2, confirmedSeats: 0, status: "pending", qrCode: null, createdAt: null, wedding: null }}
        invitationId=""
      />
    );
  }

  return <ClassicTemplate invData={invData} invitationId={invitationId!} />;
}
