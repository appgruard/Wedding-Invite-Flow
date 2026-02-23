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

  const params = new URLSearchParams(window.location.search);
  const invitationId = params.get("id");

  const { data, isLoading } = useQuery<InvitationWithWedding>({
    queryKey: ["/api/invitations", invitationId],
    enabled: !!invitationId,
  });

  const wedding = data?.wedding;
  const invitation = data;

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
    // Assuming a format or default date if parsing fails. The schema says weddingDate is text.
    // For Win95 progress bar, we'll just mock it or use a real date if possible.
    return { days: 12, hours: 5, mins: 42, secs: 10, progress: 65 };
  }, [wedding]);

  if (isLoading || !data) {
    return <div className="min-h-screen bg-[#008080] flex items-center justify-center text-white font-mono">Loading Wedding.exe...</div>;
  }

  return (
    <div className="min-h-screen bg-[#008080] overflow-x-hidden font-sans text-black relative">
      <style>{`
        @keyframes flyToaster {
          0% { transform: translate(20vw, -20vh); }
          100% { transform: translate(-120vw, 120vh); }
        }
        @keyframes flapWings {
          0%, 100% { transform: rotate(-25deg); }
          50% { transform: rotate(25deg); }
        }
        .toaster {
          position: absolute;
          width: 60px;
          height: 45px;
          background: #C0C0C0;
          border: 2px solid #000;
          border-radius: 4px;
          animation: flyToaster linear infinite;
          z-index: 50;
        }
        .toaster-slot {
          position: absolute;
          top: 5px;
          left: 10%;
          width: 80%;
          height: 4px;
          background: #404040;
        }
        .wing {
          position: absolute;
          width: 0;
          height: 0;
          border-left: 20px solid transparent;
          border-right: 20px solid transparent;
          border-bottom: 30px solid #E0E0E0;
          top: -15px;
          animation: flapWings 0.2s ease-in-out infinite;
        }
        .wing-left { left: -10px; transform-origin: right bottom; }
        .wing-right { right: -10px; transform-origin: left bottom; }
        .toast-piece {
          position: absolute;
          width: 25px;
          height: 25px;
          background: #DAA520;
          border: 1px solid #8B4513;
          border-radius: 2px;
          animation: flyToaster linear infinite;
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
          font-size: 14px;
        }
        .win-title-buttons {
          display: flex;
          gap: 2px;
        }
        .win-btn-small {
          width: 16px;
          height: 14px;
          background: #C0C0C0;
          border-top: 1px solid #FFF;
          border-left: 1px solid #FFF;
          border-right: 1px solid #808080;
          border-bottom: 1px solid #808080;
          color: black;
          font-size: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
        .win-content {
          padding: 10px;
        }
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
          padding: 4px 12px;
          cursor: pointer;
          font-size: 14px;
          outline: none;
        }
        .win-button:active {
          border-top: 2px solid #808080;
          border-left: 2px solid #808080;
          border-right: 2px solid #FFF;
          border-bottom: 2px solid #FFF;
          box-shadow: none;
          transform: translate(1px, 1px);
        }
        .win-progress-bg {
          height: 20px;
          background: #C0C0C0;
          border-top: 1px solid #808080;
          border-left: 1px solid #808080;
          border-right: 1px solid #FFF;
          border-bottom: 1px solid #FFF;
          position: relative;
        }
        .win-progress-fill {
          height: 100%;
          background: #000080;
          display: flex;
        }
        .win-progress-block {
          width: 8px;
          margin-right: 2px;
          background: #000080;
        }
        .start-bar {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: 30px;
          background: #C0C0C0;
          border-top: 2px solid #FFF;
          display: flex;
          align-items: center;
          padding: 0 4px;
          z-index: 100;
        }
        .start-button {
          font-weight: bold;
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 2px 6px;
        }
        .task-item {
          border-top: 1px solid #FFF;
          border-left: 1px solid #FFF;
          border-right: 1px solid #808080;
          border-bottom: 1px solid #808080;
          padding: 2px 8px;
          font-size: 12px;
          margin-left: 4px;
          background: #D0D0D0;
        }
      `}</style>

      <AnimatePresence>
        {showIntro && (
          <motion.div
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="fixed inset-0 bg-black z-[1000] overflow-hidden"
          >
            {wedding?.videoType === "youtube" && wedding.videoUrl ? (
              <iframe
                className="w-full h-full border-none"
                src={`https://www.youtube.com/embed/${wedding.videoUrl.split("v=")[1] || wedding.videoUrl.split("/").pop()}?autoplay=1&mute=1&controls=0&showinfo=0&rel=0`}
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            ) : wedding?.videoType === "mp4" && wedding.videoUrl ? (
              <video className="w-full h-full object-cover" autoPlay muted playsInline>
                <source src={wedding.videoUrl} type="video/mp4" />
              </video>
            ) : (
              <div className="relative w-full h-full">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={`toaster-${i}`}
                    className="toaster"
                    style={{
                      top: `${Math.random() * 100}%`,
                      right: `${-10 - Math.random() * 50}%`,
                      animationDuration: `${3 + Math.random() * 3}s`,
                      animationDelay: `${Math.random() * 2}s`
                    }}
                  >
                    <div className="toaster-slot" />
                    <div className="wing wing-left" />
                    <div className="wing wing-right" />
                  </div>
                ))}
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={`toast-${i}`}
                    className="toast-piece"
                    style={{
                      top: `${Math.random() * 100}%`,
                      right: `${-10 - Math.random() * 50}%`,
                      animationDuration: `${3 + Math.random() * 3}s`,
                      animationDelay: `${Math.random() * 2}s`
                    }}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-3xl mx-auto pt-10 pb-20 px-4">
        {/* Main Window */}
        <div className="win-window" data-testid="window-main">
          <div className="win-title-bar">
            <span>Wedding.exe - Notepad</span>
            <div className="win-title-buttons">
              <div className="win-btn-small">_</div>
              <div className="win-btn-small">□</div>
              <div className="win-btn-small">X</div>
            </div>
          </div>
          <div className="win-content">
            <div className="win-inset text-center space-y-4">
              <h1 className="text-3xl font-bold uppercase tracking-widest" data-testid="text-couple-names">
                {wedding?.coupleName}
              </h1>
              <p className="text-xl" data-testid="text-wedding-date">{wedding?.weddingDate}</p>
              <div className="border-t border-black my-4 opacity-20" />
              <p className="italic">"{wedding?.message || "Join us for our special day!"}"</p>
              {wedding?.couplePhotoUrl && (
                <div className="win-window inline-block p-1">
                  <img
                    src={wedding.couplePhotoUrl}
                    alt="Couple"
                    className="max-w-[200px] border border-black"
                    data-testid="img-couple"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Details Dialogs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="win-window" data-testid="window-church">
            <div className="win-title-bar">
              <span>Church_Details.cfg</span>
              <div className="win-title-buttons">
                <div className="win-btn-small">X</div>
              </div>
            </div>
            <div className="win-content space-y-2">
              <p><strong>Name:</strong> {wedding?.churchName}</p>
              <p><strong>Address:</strong> {wedding?.churchAddress}</p>
              <p><strong>Time:</strong> {wedding?.churchTime}</p>
              <button
                className="win-button w-full mt-2"
                onClick={() => window.open(`https://maps.google.com/?q=${wedding?.churchAddress}`, "_blank")}
                data-testid="button-map-church"
              >
                Open Map
              </button>
            </div>
          </div>

          <div className="win-window" data-testid="window-venue">
            <div className="win-title-bar">
              <span>Venue_Details.cfg</span>
              <div className="win-title-buttons">
                <div className="win-btn-small">X</div>
              </div>
            </div>
            <div className="win-content space-y-2">
              <p><strong>Name:</strong> {wedding?.venueName}</p>
              <p><strong>Address:</strong> {wedding?.venueAddress}</p>
              <p><strong>Time:</strong> {wedding?.venueTime}</p>
              <button
                className="win-button w-full mt-2"
                onClick={() => window.open(`https://maps.google.com/?q=${wedding?.venueAddress}`, "_blank")}
                data-testid="button-map-venue"
              >
                Open Map
              </button>
            </div>
          </div>
        </div>

        {/* Progress Countdown */}
        <div className="win-window" data-testid="window-countdown">
          <div className="win-title-bar">
            <span>Wedding_Install_Progress</span>
          </div>
          <div className="win-content space-y-4">
            <p className="text-sm">Calculating time until big day...</p>
            <div className="win-progress-bg">
              <div className="win-progress-fill" style={{ width: `${countdown.progress}%` }}>
                {Array.from({ length: Math.floor(countdown.progress / 3) }).map((_, i) => (
                  <div key={i} className="win-progress-block" />
                ))}
              </div>
            </div>
            <div className="flex justify-between text-xs font-mono">
              <span>{countdown.days} Days</span>
              <span>{countdown.hours} Hours</span>
              <span>{countdown.mins} Mins</span>
              <span>{countdown.secs} Secs</span>
            </div>
          </div>
        </div>

        {/* RSVP Dialog */}
        <div className="win-window max-w-md mx-auto" data-testid="window-rsvp">
          <div className="win-title-bar">
            <span>Confirm Attendance</span>
            <div className="win-title-buttons">
              <div className="win-btn-small">X</div>
            </div>
          </div>
          <div className="win-content text-center space-y-4">
            <p><strong>Guest:</strong> <span data-testid="text-guest-name">{invitation?.guestName}</span></p>
            <p>You have <span data-testid="text-assigned-seats">{invitation?.seats}</span> seats reserved.</p>

            {responded || (invitation?.status !== "pending") ? (
              <div className="win-inset bg-gray-100">
                <p className="font-bold text-blue-800" data-testid="text-rsvp-status">
                  {invitation?.status === "accepted" ? "See you there!" : "We will miss you!"}
                </p>
                <p className="text-sm mt-2">Response recorded successfully.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-center gap-2">
                  <label className="text-sm">Seats:</label>
                  <select
                    className="win-inset py-1 px-2 text-sm outline-none"
                    value={confirmedSeats}
                    onChange={(e) => setConfirmedSeats(parseInt(e.target.value))}
                    data-testid="select-seats"
                  >
                    {Array.from({ length: invitation?.seats || 1 }).map((_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1}</option>
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
                    Yes
                  </button>
                  <button
                    className="win-button"
                    onClick={() => respondMutation.mutate({ status: "declined", confirmedSeats: 0 })}
                    disabled={respondMutation.isPending}
                    data-testid="button-decline"
                  >
                    No
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Gifts Explorer */}
        <div className="win-window" data-testid="window-gifts">
          <div className="win-title-bar">
            <span>C:\\Windows\\Registry\\Gifts</span>
            <div className="win-title-buttons">
              <div className="win-btn-small">X</div>
            </div>
          </div>
          <div className="win-content">
            <div className="win-inset bg-white p-0">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-gray-200 border-b border-gray-400">
                  <tr>
                    <th className="px-2 py-1">Name</th>
                    <th className="px-2 py-1">Type</th>
                    <th className="px-2 py-1">Link</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: wedding?.giftLabel1, url: wedding?.giftUrl1 },
                    { label: wedding?.giftLabel2, url: wedding?.giftUrl2 }
                  ].filter(g => g.label && g.url).map((gift, idx) => (
                    <tr key={idx} className="hover:bg-blue-800 hover:text-white cursor-pointer group">
                      <td className="px-2 py-1 flex items-center gap-1">
                        <span className="text-xl">📁</span> {gift.label}
                      </td>
                      <td className="px-2 py-1">Gift Registry</td>
                      <td className="px-2 py-1">
                        <button
                          className="text-blue-600 group-hover:text-white underline"
                          onClick={() => {
                            if (gift.url) window.open(gift.url, "_blank");
                          }}
                          data-testid={`button-gift-${idx}`}
                        >
                          Visit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* QR Code Window */}
        {invitation?.qrCode && (
          <div className="win-window max-w-[250px] mx-auto" data-testid="window-qr">
            <div className="win-title-bar">
              <span>Security.exe</span>
            </div>
            <div className="win-content text-center">
              <div className="win-inset inline-block">
                <img src={invitation.qrCode} alt="QR" className="w-40 h-40" data-testid="img-qr-code" />
              </div>
              <p className="text-[10px] mt-2 text-gray-600 uppercase">Valid Wedding Entry Token</p>
            </div>
          </div>
        )}
      </div>

      {/* Start Bar */}
      <div className="start-bar">
        <button className="win-button start-button" data-testid="button-start">
          <span className="text-lg">💾</span> Start
        </button>
        <div className="task-item">Wedding.exe</div>
        <div className="task-item">Notepad - Invitation</div>
        <div className="flex-1" />
        <div className="win-inset py-0 px-2 flex items-center gap-2 text-xs">
          <span>🔊</span>
          <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>
    </div>
  );
}
