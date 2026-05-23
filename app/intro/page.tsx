"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Pause, Play, SkipBack, SkipForward } from "lucide-react";
import Loader from "@/components/loader";
import { useAudio } from "@/context/AudioContext";
import { Caveat, Unbounded } from "next/font/google";


const caveat = Caveat({
  subsets: ['latin'],
  display: "swap"
});



const OVERLAY_DELAY_MS = 1000;
const REDIRECT_DELAY_MS = 3000;
const SPEED_STEP_INTERVAL_MS = 1000; // Slower interval
const SUBTLE_SPEED_INCREMENT = 0.05; // Subtle increment
const INITIAL_SPEED = 1.1; // Lower initial speed

export default function IntroPage() {
  const router = useRouter();
  const {
    isPlaying,
    togglePlay,
    playNext,
    playBack,
    isAudioUnlocked,
    setIsAudioUnlocked,
  } = useAudio();

  const redirectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const overlayTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const speedIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [showOverlay, setShowOverlay] = useState(false);
  const [hasStartedSequence, setHasStartedSequence] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);

  useEffect(() => {
    router.prefetch("/");

    overlayTimeoutRef.current = setTimeout(() => {
      setShowOverlay(true);
    }, OVERLAY_DELAY_MS);

    return () => {
      if (overlayTimeoutRef.current) {
        clearTimeout(overlayTimeoutRef.current);
      }
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
      if (speedIntervalRef.current) {
        clearInterval(speedIntervalRef.current);
      }
    };
  }, [router]);

  const handleStart = async () => {
    if (hasStartedSequence) return;

    setHasStartedSequence(true);
    setShowOverlay(false);
    setIsAudioUnlocked(true);
    setSpeedMultiplier(INITIAL_SPEED);

    // Start playing global audio
    if (!isPlaying) {
      await togglePlay();
    }

    speedIntervalRef.current = setInterval(() => {
      setSpeedMultiplier(
        (currentSpeed) => currentSpeed + SUBTLE_SPEED_INCREMENT,
      );
    }, SPEED_STEP_INTERVAL_MS);

    redirectTimeoutRef.current = setTimeout(() => {
      if (speedIntervalRef.current) {
        clearInterval(speedIntervalRef.current);
      }
      // Store intro status and timestamp (valid for 6 hours)
      localStorage.setItem("intro_shown", "true");
      localStorage.setItem("intro_timestamp", Date.now().toString());

      router.replace("/");
    }, REDIRECT_DELAY_MS);
  };

  return (
    <main className="relative h-screen overflow-hidden bg-black">
      <Loader speedMultiplier={speedMultiplier} />

      {showOverlay && (
        <div className="absolute inset-0 z-10 flex h-screen items-center justify-center bg-black/30 px-6 backdrop-blur-md">
          <div className="max-w-2xl text-center text-white">
            <p className="text-2xl md:text-3xl font-bold text-transparent [-webkit-text-stroke:2px_#3b82f6]">
              AUSA Experience
            </p>
            <h1
              className={`mt-5 text-4xl font-semibold sm:text-5xl ${caveat.className}`}
            >
              The stars are aligned. Step in when you&apos;re ready.
            </h1>
            <p className="mt-4 text-base text-white/80 sm:text-lg">
              Once you begin, there is no going <strong>BACK</strong>.
            </p>
            <button
              type="button"
              onClick={handleStart}
              className="mt-8 inline-flex rounded-full bg-orange-500 px-8 py-4 text-base font-semibold text-black transition hover:bg-orange-400"
            >
              Are You Ready?!
            </button>
          </div>
        </div>
      )}

      {isAudioUnlocked && (
        <div className="absolute right-5 bottom-5 z-20 flex items-center gap-2">
          <button
            type="button"
            onClick={playBack}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/30 text-white backdrop-blur-md transition hover:bg-black/50"
            aria-label="Previous track"
          >
            <SkipBack className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={togglePlay}
            className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-black/45 text-white backdrop-blur-md transition hover:bg-black/60"
            aria-label={isPlaying ? "Pause intro music" : "Play intro music"}
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
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/30 text-white backdrop-blur-md transition hover:bg-black/50"
            aria-label="Next track"
          >
            <SkipForward className="h-4 w-4" />
          </button>
        </div>
      )}
    </main>
  );
}
