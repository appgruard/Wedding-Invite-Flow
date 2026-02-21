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

  const { data: invitation, isLoading, error } = useQuery<Invitation>({
    queryKey: ["/api/invitations", invitationId],
    enabled: !!invitationId,
  });

  if (!invitationId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDF8F0] dark:bg-[#1a1512] p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-sans text-[#800020] mb-2">Codigo QR Invalido</h1>
          <p className="font-serif text-[#8B7355]">Este codigo QR no contiene una invitacion valida.</p>
        </motion.div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDF8F0] dark:bg-[#1a1512]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-12 h-12 border-4 border-[#C9A96E] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-serif text-[#8B7355]">Verificando invitacion...</p>
        </motion.div>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDF8F0] dark:bg-[#1a1512] p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-sans text-[#800020] mb-2">Invitacion No Encontrada</h1>
          <p className="font-serif text-[#8B7355]">No se encontro una invitacion valida con este codigo QR.</p>
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
      <div className="absolute inset-0 bg-[#FDF8F0]/92 dark:bg-[#1a1512]/92 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="rounded-md border border-[#C9A96E]/40 bg-white/95 dark:bg-[#1e1a16]/95 shadow-lg">
          <div
            className={`p-6 rounded-t-md text-center ${
              isValid
                ? "bg-gradient-to-br from-[#9CAF88]/20 to-[#C9A96E]/20 border-b border-[#C9A96E]/20"
                : "bg-gradient-to-br from-red-100/40 to-red-50/40 dark:from-red-900/20 dark:to-red-800/10 border-b border-red-200/30"
            }`}
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
            <h1 className="text-2xl font-sans text-[#800020] mb-1" data-testid="text-validation-title">
              {isValid ? "Invitacion Valida" : "Invitacion Declinada"}
            </h1>
            <p className="text-sm font-serif text-[#8B7355]">
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
              <div className="w-10 h-10 rounded-full bg-[#C9A96E]/15 flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-[#C9A96E]" />
              </div>
              <div>
                <p className="text-xs font-serif text-[#8B7355] uppercase tracking-wider">Invitado</p>
                <p className="text-lg font-sans text-[#5C4033] dark:text-[#D4C4B0]" data-testid="text-guest-name">
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
              <div className="w-10 h-10 rounded-full bg-[#C9A96E]/15 flex items-center justify-center flex-shrink-0">
                <Armchair className="w-5 h-5 text-[#C9A96E]" />
              </div>
              <div>
                <p className="text-xs font-serif text-[#8B7355] uppercase tracking-wider">Lugares Asignados</p>
                <p className="text-lg font-sans text-[#5C4033] dark:text-[#D4C4B0]" data-testid="text-seats">
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
              <div className="w-10 h-10 rounded-full bg-[#C9A96E]/15 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-5 h-5 text-[#C9A96E]" />
              </div>
              <div>
                <p className="text-xs font-serif text-[#8B7355] uppercase tracking-wider">Estado</p>
                <StatusDisplay status={invitation.status} confirmedSeats={invitation.confirmedSeats} />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-full bg-[#C9A96E]/15 flex items-center justify-center flex-shrink-0">
                <CalendarDays className="w-5 h-5 text-[#C9A96E]" />
              </div>
              <div>
                <p className="text-xs font-serif text-[#8B7355] uppercase tracking-wider">Fecha</p>
                <p className="text-lg font-sans text-[#5C4033] dark:text-[#D4C4B0]">
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
              <div className="w-10 h-10 rounded-full bg-[#C9A96E]/15 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-[#C9A96E]" />
              </div>
              <div>
                <p className="text-xs font-serif text-[#8B7355] uppercase tracking-wider">Ceremonia</p>
                <p className="text-lg font-sans text-[#5C4033] dark:text-[#D4C4B0]">
                  Parroquia San Jose - 4:00 PM
                </p>
              </div>
            </motion.div>
          </div>

          <div className="p-4 bg-[#C9A96E]/5 border-t border-[#C9A96E]/20 rounded-b-md text-center">
            <p className="text-xs font-serif text-[#8B7355]">
              ID: {invitation.id}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
