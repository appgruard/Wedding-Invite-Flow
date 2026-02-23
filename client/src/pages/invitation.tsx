import { useState, useEffect, useMemo } from "react";
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
  Palette,
  Gift,
  Banknote,
  Clock,
  MapPin,
  Heart,
  Check,
  X,
  Copy,
} from "lucide-react";
import type { Invitation } from "@shared/schema";

type StyleDef = { id: string; name: string; description: string; preview: { bg: string; primary: string; accent: string; text: string } };
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

function SectionWrapper({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
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

function CountdownTimer({ colors }: { colors: Colors }) {
  const textMuted = colors.text + "BB";
  const targetDate = new Date("2026-03-15T16:00:00").getTime();
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

  const units = [
    { label: "Días", value: days },
    { label: "Horas", value: hours },
    { label: "Min", value: minutes },
    { label: "Seg", value: seconds },
  ];

  return (
    <div className="flex justify-center gap-3 flex-wrap" data-testid="countdown-timer">
      {units.map((u) => (
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

function RSVPSection({
  invitation,
  invitationId,
  colors,
}: {
  invitation: Invitation;
  invitationId: string;
  colors: Colors;
}) {
  const textMuted = colors.text + "BB";
  const { toast } = useToast();
  const [selectedSeats, setSelectedSeats] = useState("1");
  const [responded, setResponded] = useState(invitation.status !== "pending");

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
      setResponded(true);
      toast({ title: "Respuesta enviada", description: "Gracias por confirmar tu asistencia." });
    },
    onError: () => {
      toast({ title: "Error", description: "No se pudo enviar tu respuesta. Inténtalo de nuevo.", variant: "destructive" });
    },
  });

  const seatOptions = useMemo(() => {
    return Array.from({ length: invitation.seats }, (_, i) => i + 1);
  }, [invitation.seats]);

  if (responded || invitation.status !== "pending") {
    return (
      <SectionWrapper>
        <div
          className="rounded-md bg-white/70 dark:bg-black/30 p-8"
          style={{ borderWidth: 1, borderStyle: "solid", borderColor: colors.accent + "4D" }}
        >
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
          <p className="font-serif mt-4 italic" style={{ color: textMuted }}>
            Gracias, {invitation.guestName}
          </p>
        </div>
      </SectionWrapper>
    );
  }

  return (
    <SectionWrapper>
      <h2 className="text-3xl font-sans mb-2" style={{ color: colors.primary }}>Confirma tu Asistencia</h2>
      <GoldDivider colors={colors} />
      <div
        className="rounded-md bg-white/70 dark:bg-black/30 p-8 space-y-6"
        style={{ borderWidth: 1, borderStyle: "solid", borderColor: colors.accent + "4D" }}
      >
        <p className="font-serif text-lg" style={{ color: colors.text }} data-testid="text-guest-name">
          Estimado/a <span className="font-bold">{invitation.guestName}</span>
        </p>
        <p className="font-serif" style={{ color: textMuted }} data-testid="text-assigned-seats">
          Lugares asignados: <span className="font-bold">{invitation.seats}</span>
        </p>

        <div className="space-y-2">
          <label className="text-sm font-serif" style={{ color: textMuted }}>
            ¿Cuántos lugares confirmas?
          </label>
          <Select value={selectedSeats} onValueChange={setSelectedSeats}>
            <SelectTrigger data-testid="select-seats" className="w-full max-w-[200px] mx-auto">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {seatOptions.map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n} {n === 1 ? "lugar" : "lugares"}
                </SelectItem>
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
            onClick={() =>
              respondMutation.mutate({
                status: "accepted",
                confirmedSeats: parseInt(selectedSeats),
              })
            }
          >
            <Check className="w-4 h-4 mr-2" />
            Acepto con Gusto
          </Button>
          <Button
            data-testid="button-decline"
            variant="outline"
            disabled={respondMutation.isPending}
            onClick={() =>
              respondMutation.mutate({ status: "declined", confirmedSeats: 0 })
            }
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
      <div
        className="rounded-md bg-white/80 dark:bg-black/30 p-6 inline-block"
        style={{ borderWidth: 1, borderStyle: "solid", borderColor: colors.accent + "4D" }}
      >
        <img
          src={invitation.qrCode}
          alt="QR Code de invitación"
          className="w-48 h-48 mx-auto"
          data-testid="img-qr-code"
        />
      </div>
      <p className="font-serif mt-4 italic text-sm" style={{ color: textMuted }}>
        Presenta este código QR en la entrada
      </p>
    </SectionWrapper>
  );
}

export default function InvitationPage() {
  const [curtainsOpen, setCurtainsOpen] = useState(false);
  const [curtainsMounted, setCurtainsMounted] = useState(true);
  const [contentVisible, setContentVisible] = useState(false);
  const invitationId = getInvitationId();

  const { data: settingsData } = useQuery<{ id: string; activeStyle: string }>({ queryKey: ["/api/settings"] });
  const { data: styles } = useQuery<StyleDef[]>({ queryKey: ["/api/styles"] });
  const activeStyle = styles?.find(s => s.id === settingsData?.activeStyle) ?? null;
  const colors: Colors = activeStyle?.preview ?? FALLBACK_COLORS;
  const textMuted = colors.text + "BB";

  const primaryDark = darkenHex(colors.primary, 36);
  const primaryLight = lightenHex(colors.primary, 50);

  const { data: invitation, isLoading } = useQuery<Invitation>({
    queryKey: ["/api/invitations", invitationId],
    enabled: !!invitationId,
  });

  useEffect(() => {
    const timer1 = setTimeout(() => setCurtainsOpen(true), 2000);
    const timer2 = setTimeout(() => setContentVisible(true), 3200);
    const timer3 = setTimeout(() => setCurtainsMounted(false), 3600);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copiado", description: "CLABE copiada al portapapeles" });
  };

  return (
    <div
      className="relative min-h-screen overflow-x-hidden"
      style={{
        backgroundImage: "url(/images/pattern-bg.png)",
        backgroundRepeat: "repeat",
        backgroundSize: "300px",
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ backgroundColor: colors.bg + "E6" }}
      />
      <div className="absolute inset-0 dark:bg-[#1a1512]/90 pointer-events-none" />

      <div className="relative z-10">
        {/* Curtain Overlay – TimLamber / jEmEaP style */}
        {curtainsMounted && (
          <div
            className="rn-outer"
            style={{
              "--rn-accent": colors.primary,
              "--rn-dark": primaryDark,
              "--rn-light": primaryLight,
            } as React.CSSProperties}
          >
            <div className={`rn-inner${curtainsOpen ? " rn-open" : ""}`}>
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="rn-unit" />
              ))}
            </div>
            <div className={`rn-center-text${curtainsOpen ? " rn-text-hide" : ""}`}>
              <p className="font-sans text-lg tracking-[0.3em] uppercase" style={{ color: colors.accent }}>
                Estás Invitado
              </p>
            </div>
          </div>
        )}

        {/* Hero / Couple Photo Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: contentVisible ? 1 : 0 }}
          transition={{ duration: 1.2 }}
          className="flex flex-col items-center pt-12 pb-6 px-4"
        >
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 mx-auto mb-8">
            <div
              className="w-full h-full rounded-full p-1"
              style={{ borderWidth: 4, borderStyle: "solid", borderColor: colors.accent + "80" }}
            >
              <img
                src="/images/couple.png"
                alt="Ana Maria y Carlos Eduardo"
                className="w-full h-full object-cover rounded-full"
                data-testid="img-couple"
              />
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
            Ana Maria
            <span className="block text-2xl my-1" style={{ color: colors.accent }}>&</span>
            Carlos Eduardo
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: contentVisible ? 1 : 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="font-serif text-lg mt-4 tracking-widest uppercase"
            style={{ color: textMuted }}
            data-testid="text-wedding-date"
          >
            15 de Marzo, 2026
          </motion.p>

          <GoldDivider colors={colors} />

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: contentVisible ? 1 : 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="font-serif text-center max-w-md italic"
            style={{ color: textMuted }}
          >
            Con la bendición de Dios y de nuestros padres, tenemos el honor de
            invitarte a celebrar nuestra unión en matrimonio.
          </motion.p>
        </motion.div>

        {/* Ceremonia Religiosa */}
        <SectionWrapper>
          <div className="flex items-center justify-center gap-2 mb-4">
            <Church className="w-6 h-6" style={{ color: colors.accent }} />
            <h2 className="text-3xl font-sans" style={{ color: colors.primary }}>Ceremonia Religiosa</h2>
          </div>
          <GoldDivider colors={colors} />
          <div
            className="rounded-md overflow-visible bg-white/50 dark:bg-black/20"
            style={{ borderWidth: 1, borderStyle: "solid", borderColor: colors.accent + "33" }}
          >
            <img
              src="/images/church.png"
              alt="Parroquia San José"
              className="w-full h-48 object-cover"
              data-testid="img-church"
            />
            <div className="p-6">
              <h3 className="text-xl font-sans mb-1" style={{ color: colors.text }}>Parroquia San José</h3>
              <p className="font-serif mb-1" style={{ color: textMuted }}>
                <Clock className="w-4 h-4 inline mr-1" />
                4:00 PM
              </p>
              <Button
                variant="outline"
                className="mt-4"
                data-testid="button-map-church"
                onClick={() =>
                  window.open("https://maps.google.com/?q=Parroquia+San+Jose", "_blank")
                }
              >
                <MapPin className="w-4 h-4 mr-2" />
                Ver en Google Maps
              </Button>
            </div>
          </div>
        </SectionWrapper>

        {/* Recepción */}
        <SectionWrapper>
          <div className="flex items-center justify-center gap-2 mb-4">
            <PartyPopper className="w-6 h-6" style={{ color: colors.accent }} />
            <h2 className="text-3xl font-sans" style={{ color: colors.primary }}>Recepción</h2>
          </div>
          <GoldDivider colors={colors} />
          <div
            className="rounded-md overflow-visible bg-white/50 dark:bg-black/20"
            style={{ borderWidth: 1, borderStyle: "solid", borderColor: colors.accent + "33" }}
          >
            <img
              src="/images/venue.png"
              alt="Salón Imperial"
              className="w-full h-48 object-cover"
              data-testid="img-venue"
            />
            <div className="p-6">
              <h3 className="text-xl font-sans mb-1" style={{ color: colors.text }}>Salón Imperial</h3>
              <p className="font-serif mb-1" style={{ color: textMuted }}>
                <Clock className="w-4 h-4 inline mr-1" />
                7:00 PM
              </p>
              <Button
                variant="outline"
                className="mt-4"
                data-testid="button-map-venue"
                onClick={() =>
                  window.open("https://maps.google.com/?q=Salon+Imperial", "_blank")
                }
              >
                <MapPin className="w-4 h-4 mr-2" />
                Ver en Google Maps
              </Button>
            </div>
          </div>
        </SectionWrapper>

        {/* Código de Vestimenta */}
        <SectionWrapper>
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shirt className="w-6 h-6" style={{ color: colors.accent }} />
            <h2 className="text-3xl font-sans" style={{ color: colors.primary }}>Código de Vestimenta</h2>
          </div>
          <GoldDivider colors={colors} />
          <div
            className="rounded-md bg-white/50 dark:bg-black/20 p-8"
            style={{ borderWidth: 1, borderStyle: "solid", borderColor: colors.accent + "33" }}
          >
            <p className="text-2xl font-sans mb-4" style={{ color: colors.text }}>Formal / Etiqueta</p>
            <p className="font-serif" style={{ color: textMuted }}>
              Caballeros: Traje oscuro
            </p>
            <p className="font-serif mt-1" style={{ color: textMuted }}>
              Damas: Vestido largo
            </p>
          </div>
        </SectionWrapper>

        {/* Colores Permitidos */}
        <SectionWrapper>
          <div className="flex items-center justify-center gap-2 mb-4">
            <Palette className="w-6 h-6" style={{ color: colors.accent }} />
            <h2 className="text-3xl font-sans" style={{ color: colors.primary }}>Paleta de Colores</h2>
          </div>
          <GoldDivider colors={colors} />
          <div className="flex justify-center gap-4 flex-wrap mb-6">
            {[
              { color: "#1B2A4A", name: "Navy" },
              { color: "#F7E7CE", name: "Champagne" },
              { color: "#800020", name: "Burgundy" },
              { color: "#B76E79", name: "Rose Gold" },
              { color: "#9CAF88", name: "Sage Green" },
            ].map((c) => (
              <div key={c.name} className="flex flex-col items-center gap-2" data-testid={`swatch-${c.name.toLowerCase().replace(" ", "-")}`}>
                <div
                  className="w-14 h-14 rounded-full"
                  style={{ backgroundColor: c.color, borderWidth: 2, borderStyle: "solid", borderColor: colors.accent + "66" }}
                />
                <span className="text-xs font-serif" style={{ color: textMuted }}>{c.name}</span>
              </div>
            ))}
          </div>
          <p className="font-serif italic text-sm" style={{ color: colors.primary }}>
            Por favor evitar el color blanco
          </p>
        </SectionWrapper>

        {/* Mesa de Regalos */}
        <SectionWrapper>
          <div className="flex items-center justify-center gap-2 mb-4">
            <Gift className="w-6 h-6" style={{ color: colors.accent }} />
            <h2 className="text-3xl font-sans" style={{ color: colors.primary }}>Mesa de Regalos</h2>
          </div>
          <GoldDivider colors={colors} />
          <div className="space-y-4">
            <div
              className="rounded-md bg-white/50 dark:bg-black/20 p-6"
              style={{ borderWidth: 1, borderStyle: "solid", borderColor: colors.accent + "33" }}
            >
              <h3 className="font-sans text-lg mb-1" style={{ color: colors.text }}>Liverpool</h3>
              <p className="font-serif text-sm mb-3" style={{ color: textMuted }}>Lista de regalos #12345</p>
              <Button
                variant="outline"
                data-testid="button-liverpool"
                onClick={() => window.open("https://www.liverpool.com.mx", "_blank")}
              >
                <Gift className="w-4 h-4 mr-2" />
                Ver Lista
              </Button>
            </div>
            <div
              className="rounded-md bg-white/50 dark:bg-black/20 p-6"
              style={{ borderWidth: 1, borderStyle: "solid", borderColor: colors.accent + "33" }}
            >
              <h3 className="font-sans text-lg mb-1" style={{ color: colors.text }}>Amazon</h3>
              <p className="font-serif text-sm mb-3" style={{ color: textMuted }}>Lista de regalos</p>
              <Button
                variant="outline"
                data-testid="button-amazon"
                onClick={() => window.open("https://www.amazon.com.mx", "_blank")}
              >
                <Gift className="w-4 h-4 mr-2" />
                Ver Lista
              </Button>
            </div>
          </div>
        </SectionWrapper>

        {/* Lluvia de Sobres */}
        <SectionWrapper>
          <div className="flex items-center justify-center gap-2 mb-4">
            <Banknote className="w-6 h-6" style={{ color: colors.accent }} />
            <h2 className="text-3xl font-sans" style={{ color: colors.primary }}>Lluvia de Sobres</h2>
          </div>
          <GoldDivider colors={colors} />
          <div
            className="rounded-md bg-white/50 dark:bg-black/20 p-8"
            style={{ borderWidth: 1, borderStyle: "solid", borderColor: colors.accent + "33" }}
          >
            <p className="font-serif mb-6 italic" style={{ color: textMuted }}>
              Si deseas obsequiarnos un detalle monetario, puedes hacerlo a
              través de la siguiente cuenta bancaria:
            </p>
            <div
              className="rounded-md p-4 mb-4 dark:bg-black/30"
              style={{ backgroundColor: colors.bg }}
            >
              <p className="font-serif text-xs uppercase tracking-wider mb-1" style={{ color: textMuted }}>
                CLABE Interbancaria
              </p>
              <div className="flex items-center justify-center gap-2">
                <p
                  className="font-mono text-lg tracking-wider"
                  style={{ color: colors.text }}
                  data-testid="text-clabe"
                >
                  012345678901234567
                </p>
                <Button
                  size="icon"
                  variant="ghost"
                  data-testid="button-copy-clabe"
                  onClick={() => copyToClipboard("012345678901234567")}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <p className="font-serif italic text-sm" style={{ color: colors.accent }}>
              Tu presencia es nuestro mejor regalo
            </p>
          </div>
        </SectionWrapper>

        {/* Countdown */}
        <SectionWrapper>
          <div className="flex items-center justify-center gap-2 mb-4">
            <Clock className="w-6 h-6" style={{ color: colors.accent }} />
            <h2 className="text-3xl font-sans" style={{ color: colors.primary }}>Cuenta Regresiva</h2>
          </div>
          <GoldDivider colors={colors} />
          <CountdownTimer colors={colors} />
        </SectionWrapper>

        {/* RSVP Section */}
        {invitationId && !isLoading && invitation && (
          <>
            <RSVPSection invitation={invitation} invitationId={invitationId} colors={colors} />
            <QRCodeSection invitation={invitation} colors={colors} />
          </>
        )}

        {invitationId && isLoading && (
          <SectionWrapper>
            <div className="animate-pulse space-y-4">
              <div className="h-8 rounded-md w-3/4 mx-auto" style={{ backgroundColor: colors.accent + "33" }} />
              <div className="h-4 rounded-md w-1/2 mx-auto" style={{ backgroundColor: colors.accent + "1A" }} />
            </div>
          </SectionWrapper>
        )}

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center py-12 px-4"
        >
          <GoldDivider colors={colors} />
          <p className="font-sans text-2xl" style={{ color: colors.primary }}>
            Ana Maria & Carlos Eduardo
          </p>
          <p className="font-serif mt-2 text-sm tracking-widest uppercase" style={{ color: textMuted }}>
            15 de Marzo, 2026
          </p>
          <p className="font-serif mt-4 italic text-sm" style={{ color: colors.accent }}>
            Con amor, los esperamos
          </p>
        </motion.footer>
      </div>
    </div>
  );
}
