import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Armchair,
  CalendarDays,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import type { Invitation } from "@shared/schema";

type StyleDef = { id: string; name: string; description: string; preview: { bg: string; primary: string; accent: string; text: string } };
type Colors = { bg: string; primary: string; accent: string; text: string };

const FALLBACK_COLORS: Colors = { bg: "#FDF8F0", primary: "#800020", accent: "#C9A96E", text: "#5C4033" };

function getInvitationId(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

function StatusDisplay({ status, confirmedSeats }: { status: string; confirmedSeats: number | null }) {
  if (status === "accepted") {
    return (
      <div className="flex items-center gap-3 text-green-700 dark:text-green-400">
        <CheckCircle className="w-8 h-8" />
        <div>
          <p className="text-xl font-sans font-bold">Confirmada</p>
          <p className="text-sm font-serif opacity-80">{confirmedSeats} {(confirmedSeats || 0) > 1 ? "lugares confirmados" : "lugar confirmado"}</p>
        </div>
      </div>
    );
  }
  if (status === "declined") {
    return (
      <div className="flex items-center gap-3 text-red-700 dark:text-red-400">
        <XCircle className="w-8 h-8" />
        <div>
          <p className="text-xl font-sans font-bold">Declinada</p>
          <p className="text-sm font-serif opacity-80">El invitado no asistira</p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-3 text-amber-700 dark:text-amber-400">
      <Clock className="w-8 h-8" />
      <div>
        <p className="text-xl font-sans font-bold">Pendiente</p>
        <p className="text-sm font-serif opacity-80">Aun no ha respondido</p>
      </div>
    </div>
  );
}

export default function ConfirmPage() {
  const invitationId = getInvitationId();

  const { data: settingsData } = useQuery<{ id: string; activeStyle: string }>({ queryKey: ["/api/settings"] });
  const { data: styles } = useQuery<StyleDef[]>({ queryKey: ["/api/styles"] });
  const activeStyle = styles?.find(s => s.id === settingsData?.activeStyle) ?? null;
  const colors: Colors = activeStyle?.preview ?? FALLBACK_COLORS;
  const textMuted = colors.text + "BB";

  const { data: invitation, isLoading, error } = useQuery<Invitation>({
    queryKey: ["/api/invitations", invitationId],
    enabled: !!invitationId,
  });

  if (!invitationId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: colors.bg }}>
        <div className="absolute inset-0 dark:bg-[#1a1512]/92 pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md relative z-10"
        >
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-sans mb-2" style={{ color: colors.primary }}>Codigo QR Invalido</h1>
          <p className="font-serif" style={{ color: textMuted }}>Este codigo QR no contiene una invitacion valida.</p>
        </motion.div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.bg }}>
        <div className="absolute inset-0 dark:bg-[#1a1512]/92 pointer-events-none" />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center relative z-10"
        >
          <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: colors.accent + "40", borderTopColor: "transparent" }} />
          <p className="font-serif" style={{ color: textMuted }}>Verificando invitacion...</p>
        </motion.div>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: colors.bg }}>
        <div className="absolute inset-0 dark:bg-[#1a1512]/92 pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md relative z-10"
        >
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-sans mb-2" style={{ color: colors.primary }}>Invitacion No Encontrada</h1>
          <p className="font-serif" style={{ color: textMuted }}>No se encontro una invitacion valida con este codigo QR.</p>
        </motion.div>
      </div>
    );
  }

  const isValid = invitation.status === "accepted" || invitation.status === "pending";

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundImage: "url(/images/pattern-bg.png)",
        backgroundRepeat: "repeat",
        backgroundSize: "300px",
      }}
    >
      <div className="absolute inset-0 dark:bg-[#1a1512]/92 pointer-events-none" style={{ backgroundColor: colors.bg + "E6" }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="rounded-md bg-white/95 dark:bg-[#1e1a16]/95 shadow-lg" style={{ borderWidth: 1, borderStyle: "solid", borderColor: colors.accent + "66" }}>
          <div
            className={`p-6 rounded-t-md text-center ${
              isValid
                ? "bg-gradient-to-br border-b"
                : "bg-gradient-to-br from-red-100/40 to-red-50/40 dark:from-red-900/20 dark:to-red-800/10 border-b border-red-200/30"
            }`}
            style={isValid ? { background: `linear-gradient(to bottom right, ${colors.accent}20, ${colors.primary}20)`, borderColor: colors.accent + "33" } : {}}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            >
              {isValid ? (
                <ShieldCheck className="w-16 h-16 text-[#9CAF88] mx-auto mb-3" data-testid="icon-valid" />
              ) : (
                <XCircle className="w-16 h-16 text-red-500 mx-auto mb-3" data-testid="icon-invalid" />
              )}
            </motion.div>
            <h1 className="text-2xl font-sans mb-1" data-testid="text-validation-title" style={{ color: colors.primary }}>
              {isValid ? "Invitacion Valida" : "Invitacion Declinada"}
            </h1>
            <p className="text-sm font-serif" style={{ color: textMuted }}>
              Boda Ana Maria & Carlos Eduardo
            </p>
          </div>

          <div className="p-6 space-y-5">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: colors.accent + "26" }}>
                <Users className="w-5 h-5" style={{ color: colors.accent }} />
              </div>
              <div>
                <p className="text-xs font-serif uppercase tracking-wider" style={{ color: textMuted }}>Invitado</p>
                <p className="text-lg font-sans dark:text-[#D4C4B0]" data-testid="text-guest-name" style={{ color: colors.text }}>
                  {invitation.guestName}
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: colors.accent + "26" }}>
                <Armchair className="w-5 h-5" style={{ color: colors.accent }} />
              </div>
              <div>
                <p className="text-xs font-serif uppercase tracking-wider" style={{ color: textMuted }}>Lugares Asignados</p>
                <p className="text-lg font-sans dark:text-[#D4C4B0]" data-testid="text-seats" style={{ color: colors.text }}>
                  {invitation.seats}
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: colors.accent + "26" }}>
                <ShieldCheck className="w-5 h-5" style={{ color: colors.accent }} />
              </div>
              <div>
                <p className="text-xs font-serif uppercase tracking-wider" style={{ color: textMuted }}>Estado</p>
                <StatusDisplay status={invitation.status} confirmedSeats={invitation.confirmedSeats} />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: colors.accent + "26" }}>
                <CalendarDays className="w-5 h-5" style={{ color: colors.accent }} />
              </div>
              <div>
                <p className="text-xs font-serif uppercase tracking-wider" style={{ color: textMuted }}>Fecha</p>
                <p className="text-lg font-sans dark:text-[#D4C4B0]" style={{ color: colors.text }}>
                  15 de Marzo, 2026
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              className="flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: colors.accent + "26" }}>
                <MapPin className="w-5 h-5" style={{ color: colors.accent }} />
              </div>
              <div>
                <p className="text-xs font-serif uppercase tracking-wider" style={{ color: textMuted }}>Ceremonia</p>
                <p className="text-lg font-sans dark:text-[#D4C4B0]" style={{ color: colors.text }}>
                  Parroquia San Jose - 4:00 PM
                </p>
              </div>
            </motion.div>
          </div>

          <div className="p-4 rounded-b-md text-center" style={{ backgroundColor: colors.accent + "0D", borderTopWidth: 1, borderTopStyle: "solid", borderTopColor: colors.accent + "33" }}>
            <p className="text-xs font-serif" style={{ color: textMuted }}>
              ID: {invitation.id}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
