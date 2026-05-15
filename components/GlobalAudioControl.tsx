"use client";

import { useAudio } from "@/context/AudioContext";
import { Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { usePathname } from "next/navigation";

export default function GlobalAudioControl() {
  const { isPlaying, togglePlay, playNext, playBack, isAudioUnlocked } =
    useAudio();
  const pathname = usePathname();

  // On home page, we always want the audio control to be visible 
  // so users can start the experience manually if they skipped intro
  const isHome = pathname === "/";
  
  if (!isAudioUnlocked && !isHome) return null;
  if (pathname === "/intro") return null;

  return (
    <div className="fixed right-5 bottom-5 z-50 flex items-center gap-2">
      <button
        type="button"
        onClick={playBack}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/30 text-white backdrop-blur-md transition hover:bg-black/50 shadow-lg"
        aria-label="Previous track"
      >
        <SkipBack className="h-4 w-4" />
      </button>

      <button
        type="button"
        onClick={togglePlay}
        className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-black/45 text-white backdrop-blur-md transition hover:bg-black/60 shadow-xl"
        aria-label={isPlaying ? "Pause music" : "Play music"}
      >
        {isPlaying ? (
          <Pause className="h-6 w-6" />
        ) : (
          <Play className="h-6 w-6" />
        )}
      </button>

      <button
        type="button"
        onClick={playNext}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/30 text-white backdrop-blur-md transition hover:bg-black/50 shadow-lg"
        aria-label="Next track"
      >
        <SkipForward className="h-4 w-4" />
      </button>
    </div>
  );
}
