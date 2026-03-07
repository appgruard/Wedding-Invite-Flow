import { useState, useEffect, useRef, useCallback } from "react";
import { Volume2, VolumeX } from "lucide-react";

interface MusicPlayerProps {
  musicUrl: string | null | undefined;
  musicType: string;
  started: boolean;
}

function YouTubeMusicPlayer({
  videoId,
  started,
  muted,
}: {
  videoId: string;
  started: boolean;
  muted: boolean;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const src = started
    ? `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=${muted ? 1 : 0}&loop=1&playlist=${videoId}&controls=0&disablekb=1&modestbranding=1&rel=0`
    : "";

  return (
    <iframe
      ref={iframeRef}
      src={src}
      allow="autoplay"
      style={{ position: "absolute", width: 1, height: 1, opacity: 0, pointerEvents: "none" }}
      title="background-music"
    />
  );
}

export function MusicPlayer({ musicUrl, musicType, started }: MusicPlayerProps) {
  const [muted, setMuted] = useState(true);
  const [ytVideoId, setYtVideoId] = useState<string | null>(null);
  const [ytKey, setYtKey] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (musicType === "youtube" && musicUrl) {
      const id = musicUrl.includes("youtu.be/")
        ? musicUrl.split("youtu.be/")[1]?.split("?")[0]
        : musicUrl.split("v=")[1]?.split("&")[0];
      setYtVideoId(id || null);
    }
  }, [musicUrl, musicType]);

  useEffect(() => {
    if (musicType !== "mp3" || !musicUrl || !started) return;
    const audio = new Audio(musicUrl);
    audio.loop = true;
    audio.muted = muted;
    audio.volume = 0.7;
    audioRef.current = audio;
    audio.play().catch(() => {});
    return () => { audio.pause(); audio.src = ""; };
  }, [musicUrl, musicType, started]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = muted;
    }
  }, [muted]);

  const toggleMute = useCallback(() => {
    if (musicType === "youtube") {
      setMuted((m) => !m);
      setYtKey((k) => k + 1);
    } else {
      setMuted((m) => !m);
    }
  }, [musicType]);

  if (!musicUrl || musicType === "none") return null;

  return (
    <>
      {musicType === "youtube" && ytVideoId && (
        <YouTubeMusicPlayer key={ytKey} videoId={ytVideoId} started={started} muted={muted} />
      )}
      <button
        onClick={toggleMute}
        aria-label={muted ? "Activar música" : "Silenciar música"}
        data-testid="button-music-toggle"
        style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          zIndex: 9999,
          width: 44,
          height: 44,
          borderRadius: "50%",
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(255,255,255,0.25)",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          transition: "background 0.2s",
          boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
        }}
      >
        {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </button>
    </>
  );
}
