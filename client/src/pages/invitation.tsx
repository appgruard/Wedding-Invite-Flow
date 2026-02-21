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

function getInvitationId(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

function GoldDivider() {
  return (
    <div className="flex items-center justify-center gap-4 my-8">
      <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#C9A96E]" />
      <Heart className="w-4 h-4 text-[#C9A96E] fill-[#C9A96E]" />
      <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#C9A96E]" />
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

function CountdownTimer() {
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
          className="flex flex-col items-center rounded-md border border-[#C9A96E]/30 bg-white/60 dark:bg-black/30 px-4 py-3 min-w-[70px]"
        >
          <span className="text-3xl font-sans font-bold text-[#800020]">
            {String(u.value).padStart(2, "0")}
          </span>
          <span className="text-xs font-serif text-[#8B7355] uppercase tracking-widest mt-1">
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
}: {
  invitation: Invitation;
  invitationId: string;
}) {
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
        <div className="rounded-md border border-[#C9A96E]/30 bg-white/70 dark:bg-black/30 p-8">
          <Check className="w-12 h-12 text-[#9CAF88] mx-auto mb-4" />
          <h3 className="text-2xl font-sans text-[#800020] mb-2">
            {invitation.status === "accepted" ? "Asistencia Confirmada" : invitation.status === "declined" ? "Invitación Declinada" : "Respuesta Registrada"}
          </h3>
          <p className="font-serif text-[#8B7355]" data-testid="text-rsvp-status">
            {invitation.status === "accepted"
              ? `Has confirmado ${invitation.confirmedSeats} lugar${(invitation.confirmedSeats || 0) > 1 ? "es" : ""}.`
              : invitation.status === "declined"
              ? "Lamentamos que no puedas asistir."
              : "Tu respuesta ha sido registrada."}
          </p>
          <p className="font-serif text-[#8B7355] mt-4 italic">
            Gracias, {invitation.guestName}
          </p>
        </div>
      </SectionWrapper>
    );
  }

  return (
    <SectionWrapper>
      <h2 className="text-3xl font-sans text-[#800020] mb-2">Confirma tu Asistencia</h2>
      <GoldDivider />
      <div className="rounded-md border border-[#C9A96E]/30 bg-white/70 dark:bg-black/30 p-8 space-y-6">
        <p className="font-serif text-lg text-[#5C4033]" data-testid="text-guest-name">
          Estimado/a <span className="font-bold">{invitation.guestName}</span>
        </p>
        <p className="font-serif text-[#8B7355]" data-testid="text-assigned-seats">
          Lugares asignados: <span className="font-bold">{invitation.seats}</span>
        </p>

        <div className="space-y-2">
          <label className="text-sm font-serif text-[#8B7355]">
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
            className="bg-[#800020] text-white border-[#800020]"
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

function QRCodeSection({ invitation }: { invitation: Invitation }) {
  if (!invitation.qrCode) return null;
  return (
    <SectionWrapper>
      <h2 className="text-2xl font-sans text-[#800020] mb-2">Código QR</h2>
      <GoldDivider />
      <div className="rounded-md border border-[#C9A96E]/30 bg-white/80 dark:bg-black/30 p-6 inline-block">
        <img
          src={invitation.qrCode}
          alt="QR Code de invitación"
          className="w-48 h-48 mx-auto"
          data-testid="img-qr-code"
        />
      </div>
      <p className="font-serif text-[#8B7355] mt-4 italic text-sm">
        Presenta este código QR en la entrada
      </p>
    </SectionWrapper>
  );
}

export default function InvitationPage() {
  const [curtainsOpen, setCurtainsOpen] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);
  const invitationId = getInvitationId();

  const { data: invitation, isLoading } = useQuery<Invitation>({
    queryKey: ["/api/invitations", invitationId],
    enabled: !!invitationId,
  });

  useEffect(() => {
    const timer1 = setTimeout(() => setCurtainsOpen(true), 2000);
    const timer2 = setTimeout(() => setContentVisible(true), 3200);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
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
      <div className="absolute inset-0 bg-[#FDF8F0]/90 dark:bg-[#1a1512]/90 pointer-events-none" />

      <div className="relative z-10">
        {/* Curtain Overlay */}
        <AnimatePresence>
          {!curtainsOpen && (
            <>
              <motion.div
                key="curtain-left"
                initial={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ duration: 1, ease: "easeInOut" }}
                className="fixed inset-y-0 left-0 w-1/2 z-50"
                style={{
                  background: "linear-gradient(135deg, #800020 0%, #5C0015 50%, #800020 100%)",
                  backgroundImage:
                    "linear-gradient(135deg, #800020 0%, #5C0015 50%, #800020 100%), repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.02) 10px, rgba(255,255,255,0.02) 20px)",
                }}
              >
                <div className="absolute inset-0 flex items-center justify-end pr-4">
                  <div className="w-8 h-full bg-gradient-to-r from-transparent to-[#600018] opacity-50" />
                </div>
                <div
                  className="absolute right-0 top-0 bottom-0 w-6"
                  style={{
                    background:
                      "repeating-linear-gradient(180deg, #C9A96E 0px, #C9A96E 2px, transparent 2px, transparent 20px)",
                    opacity: 0.3,
                  }}
                />
              </motion.div>
              <motion.div
                key="curtain-right"
                initial={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ duration: 1, ease: "easeInOut" }}
                className="fixed inset-y-0 right-0 w-1/2 z-50"
                style={{
                  background: "linear-gradient(225deg, #800020 0%, #5C0015 50%, #800020 100%)",
                  backgroundImage:
                    "linear-gradient(225deg, #800020 0%, #5C0015 50%, #800020 100%), repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(255,255,255,0.02) 10px, rgba(255,255,255,0.02) 20px)",
                }}
              >
                <div className="absolute inset-0 flex items-center justify-start pl-4">
                  <div className="w-8 h-full bg-gradient-to-l from-transparent to-[#600018] opacity-50" />
                </div>
                <div
                  className="absolute left-0 top-0 bottom-0 w-6"
                  style={{
                    background:
                      "repeating-linear-gradient(180deg, #C9A96E 0px, #C9A96E 2px, transparent 2px, transparent 20px)",
                    opacity: 0.3,
                  }}
                />
              </motion.div>
              <motion.div
                key="curtain-center-text"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
              >
                <div className="text-center">
                  <p className="text-[#C9A96E] font-sans text-lg tracking-[0.3em] uppercase">
                    Estás Invitado
                  </p>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Hero / Couple Photo Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: contentVisible ? 1 : 0 }}
          transition={{ duration: 1.2 }}
          className="flex flex-col items-center pt-12 pb-6 px-4"
        >
          <div className="relative w-72 h-72 sm:w-80 sm:h-80 mx-auto mb-8">
            <img
              src="/images/couple.png"
              alt="Ana Maria y Carlos Eduardo"
              className="absolute inset-[12%] w-[76%] h-[76%] object-cover rounded-full"
              data-testid="img-couple"
            />
            <img
              src="/images/floral-frame.png"
              alt="Marco floral"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none"
            />
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: contentVisible ? 1 : 0, y: contentVisible ? 0 : 20 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-4xl sm:text-5xl font-sans text-[#800020] text-center leading-tight"
            data-testid="text-couple-names"
          >
            Ana Maria
            <span className="block text-2xl text-[#C9A96E] my-1">&</span>
            Carlos Eduardo
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: contentVisible ? 1 : 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="font-serif text-lg text-[#8B7355] mt-4 tracking-widest uppercase"
            data-testid="text-wedding-date"
          >
            15 de Marzo, 2026
          </motion.p>

          <GoldDivider />

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: contentVisible ? 1 : 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="font-serif text-[#8B7355] text-center max-w-md italic"
          >
            Con la bendición de Dios y de nuestros padres, tenemos el honor de
            invitarte a celebrar nuestra unión en matrimonio.
          </motion.p>
        </motion.div>

        {/* Ceremonia Religiosa */}
        <SectionWrapper>
          <div className="flex items-center justify-center gap-2 mb-4">
            <Church className="w-6 h-6 text-[#C9A96E]" />
            <h2 className="text-3xl font-sans text-[#800020]">Ceremonia Religiosa</h2>
          </div>
          <GoldDivider />
          <div className="rounded-md border border-[#C9A96E]/20 overflow-visible bg-white/50 dark:bg-black/20">
            <img
              src="/images/church.png"
              alt="Parroquia San José"
              className="w-full h-48 object-cover"
              data-testid="img-church"
            />
            <div className="p-6">
              <h3 className="text-xl font-sans text-[#5C4033] mb-1">Parroquia San José</h3>
              <p className="font-serif text-[#8B7355] mb-1">
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
            <PartyPopper className="w-6 h-6 text-[#C9A96E]" />
            <h2 className="text-3xl font-sans text-[#800020]">Recepción</h2>
          </div>
          <GoldDivider />
          <div className="rounded-md border border-[#C9A96E]/20 overflow-visible bg-white/50 dark:bg-black/20">
            <img
              src="/images/venue.png"
              alt="Salón Imperial"
              className="w-full h-48 object-cover"
              data-testid="img-venue"
            />
            <div className="p-6">
              <h3 className="text-xl font-sans text-[#5C4033] mb-1">Salón Imperial</h3>
              <p className="font-serif text-[#8B7355] mb-1">
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
            <Shirt className="w-6 h-6 text-[#C9A96E]" />
            <h2 className="text-3xl font-sans text-[#800020]">Código de Vestimenta</h2>
          </div>
          <GoldDivider />
          <div className="rounded-md border border-[#C9A96E]/20 bg-white/50 dark:bg-black/20 p-8">
            <p className="text-2xl font-sans text-[#5C4033] mb-4">Formal / Etiqueta</p>
            <p className="font-serif text-[#8B7355]">
              Caballeros: Traje oscuro
            </p>
            <p className="font-serif text-[#8B7355] mt-1">
              Damas: Vestido largo
            </p>
          </div>
        </SectionWrapper>

        {/* Colores Permitidos */}
        <SectionWrapper>
          <div className="flex items-center justify-center gap-2 mb-4">
            <Palette className="w-6 h-6 text-[#C9A96E]" />
            <h2 className="text-3xl font-sans text-[#800020]">Paleta de Colores</h2>
          </div>
          <GoldDivider />
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
                  className="w-14 h-14 rounded-full border-2 border-[#C9A96E]/40"
                  style={{ backgroundColor: c.color }}
                />
                <span className="text-xs font-serif text-[#8B7355]">{c.name}</span>
              </div>
            ))}
          </div>
          <p className="font-serif text-[#800020] italic text-sm">
            Por favor evitar el color blanco
          </p>
        </SectionWrapper>

        {/* Mesa de Regalos */}
        <SectionWrapper>
          <div className="flex items-center justify-center gap-2 mb-4">
            <Gift className="w-6 h-6 text-[#C9A96E]" />
            <h2 className="text-3xl font-sans text-[#800020]">Mesa de Regalos</h2>
          </div>
          <GoldDivider />
          <div className="space-y-4">
            <div className="rounded-md border border-[#C9A96E]/20 bg-white/50 dark:bg-black/20 p-6">
              <h3 className="font-sans text-lg text-[#5C4033] mb-1">Liverpool</h3>
              <p className="font-serif text-[#8B7355] text-sm mb-3">Lista de regalos #12345</p>
              <Button
                variant="outline"
                data-testid="button-liverpool"
                onClick={() => window.open("https://www.liverpool.com.mx", "_blank")}
              >
                <Gift className="w-4 h-4 mr-2" />
                Ver Lista
              </Button>
            </div>
            <div className="rounded-md border border-[#C9A96E]/20 bg-white/50 dark:bg-black/20 p-6">
              <h3 className="font-sans text-lg text-[#5C4033] mb-1">Amazon</h3>
              <p className="font-serif text-[#8B7355] text-sm mb-3">Lista de regalos</p>
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
            <Banknote className="w-6 h-6 text-[#C9A96E]" />
            <h2 className="text-3xl font-sans text-[#800020]">Lluvia de Sobres</h2>
          </div>
          <GoldDivider />
          <div className="rounded-md border border-[#C9A96E]/20 bg-white/50 dark:bg-black/20 p-8">
            <p className="font-serif text-[#8B7355] mb-6 italic">
              Si deseas obsequiarnos un detalle monetario, puedes hacerlo a
              través de la siguiente cuenta bancaria:
            </p>
            <div className="bg-[#FDF8F0] dark:bg-black/30 rounded-md p-4 mb-4">
              <p className="font-serif text-xs text-[#8B7355] uppercase tracking-wider mb-1">
                CLABE Interbancaria
              </p>
              <div className="flex items-center justify-center gap-2">
                <p
                  className="font-mono text-lg text-[#5C4033] tracking-wider"
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
            <p className="font-serif text-[#C9A96E] italic text-sm">
              Tu presencia es nuestro mejor regalo
            </p>
          </div>
        </SectionWrapper>

        {/* Countdown */}
        <SectionWrapper>
          <div className="flex items-center justify-center gap-2 mb-4">
            <Clock className="w-6 h-6 text-[#C9A96E]" />
            <h2 className="text-3xl font-sans text-[#800020]">Cuenta Regresiva</h2>
          </div>
          <GoldDivider />
          <CountdownTimer />
        </SectionWrapper>

        {/* RSVP Section */}
        {invitationId && !isLoading && invitation && (
          <>
            <RSVPSection invitation={invitation} invitationId={invitationId} />
            <QRCodeSection invitation={invitation} />
          </>
        )}

        {invitationId && isLoading && (
          <SectionWrapper>
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-[#C9A96E]/20 rounded-md w-3/4 mx-auto" />
              <div className="h-4 bg-[#C9A96E]/10 rounded-md w-1/2 mx-auto" />
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
          <GoldDivider />
          <p className="font-sans text-2xl text-[#800020]">
            Ana Maria & Carlos Eduardo
          </p>
          <p className="font-serif text-[#8B7355] mt-2 text-sm tracking-widest uppercase">
            15 de Marzo, 2026
          </p>
          <p className="font-serif text-[#C9A96E] mt-4 italic text-sm">
            Con amor, los esperamos
          </p>
        </motion.footer>
      </div>
    </div>
  );
}
