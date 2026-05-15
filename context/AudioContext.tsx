"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

// List of music tracks. Add more paths here as needed.
const MUSIC_TRACKS = [
  "/Forgiveness.mp4",
  "/Genesis.mp4",
  "/intro-music.mp3",
  "/track2.mp4",
  "/Ego.mp4",
];

interface AudioContextType {
  isPlaying: boolean;
  togglePlay: () => Promise<void>;
  playNext: () => Promise<void>;
  playBack: () => Promise<void>;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  isAudioUnlocked: boolean;
  setIsAudioUnlocked: (value: boolean) => void;
  currentTrackIndex: number;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

const STORAGE_KEY = "ausa_audio_state";
const EXPIRATION_MS = 60 * 60 * 1000; // 1 hour

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioUnlocked, setIsAudioUnlocked] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

  // Initialize audio and restore state from localStorage
  useEffect(() => {
    // We don't initialize with a specific src here yet, we'll do it in the first effect
    const audio = new Audio();
    audio.loop = false; // Disable loop so we can handle 'ended' for random playback
    audioRef.current = audio;

    const savedState = localStorage.getItem(STORAGE_KEY);
    const introShown = localStorage.getItem("intro_shown") === "true";
    
    // If intro was already shown, we can consider audio "unlocked" for controls visibility
    if (introShown) {
      setIsAudioUnlocked(true);
    }

    let initialIndex = 0;
    let initialTime = 0;
    let shouldBePlaying = false;

    if (savedState) {
      try {
        const {
          isPlaying: savedIsPlaying,
          currentTime,
          timestamp,
          trackIndex,
        } = JSON.parse(savedState);
        const now = Date.now();

        if (now - timestamp < EXPIRATION_MS) {
          initialIndex = typeof trackIndex === 'number' ? trackIndex : 0;
          initialTime = currentTime || 0;
          shouldBePlaying = savedIsPlaying;
          
          if (shouldBePlaying) {
            setIsAudioUnlocked(true);
          }
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch (e) {
        console.error("Failed to parse audio state", e);
      }
    }

    // Set initial track and time
    setCurrentTrackIndex(initialIndex);
    audio.src = MUSIC_TRACKS[initialIndex] || MUSIC_TRACKS[0];
    audio.currentTime = initialTime;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    
    // When track ends, play a random one
    const handleEnded = () => {
      if (MUSIC_TRACKS.length <= 1) {
        // If only one track, just replay it
        audio.currentTime = 0;
        audio.play().catch(() => {});
      } else {
        // Play a random track that is NOT the current one
        let nextIndex;
        do {
          nextIndex = Math.floor(Math.random() * MUSIC_TRACKS.length);
        } while (nextIndex === currentTrackIndex);
        
        playTrack(nextIndex);
      }
    };

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);

    // Try to resume on first interaction if it was playing
    const handleFirstInteraction = () => {
      if (audioRef.current && !audioRef.current.paused) return;

      const savedState = localStorage.getItem(STORAGE_KEY);
      if (savedState) {
        const { isPlaying: savedIsPlaying } = JSON.parse(savedState);
        if (savedIsPlaying && audioRef.current) {
          audioRef.current.play().catch(() => {});
        }
      }
      window.removeEventListener("click", handleFirstInteraction);
    };
    window.addEventListener("click", handleFirstInteraction);

    const interval = setInterval(() => {
      if (audioRef.current) {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            isPlaying: !audioRef.current.paused,
            currentTime: audioRef.current.currentTime,
            timestamp: Date.now(),
            trackIndex: initialIndex // This needs to be the updated state value
          }),
        );
      }
    }, 2000);

    return () => {
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
      window.removeEventListener("click", handleFirstInteraction);
      clearInterval(interval);
      audio.pause();
    };
  }, []);

  // Update localStorage interval to use latest currentTrackIndex
  useEffect(() => {
    const interval = setInterval(() => {
      if (audioRef.current) {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            isPlaying: !audioRef.current.paused,
            currentTime: audioRef.current.currentTime,
            timestamp: Date.now(),
            trackIndex: currentTrackIndex
          }),
        );
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [currentTrackIndex]);

  const playTrack = async (index: number) => {
    if (!audioRef.current) return;
    const track = MUSIC_TRACKS[index];
    if (!track) return;

    audioRef.current.src = track;
    setCurrentTrackIndex(index);
    try {
      await audioRef.current.play();
      setIsPlaying(true);
      setIsAudioUnlocked(true);
    } catch (err) {
      console.error("Playback failed", err);
    }
  };

  const togglePlay = async () => {
    if (!audioRef.current) return;

    if (audioRef.current.paused) {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
        setIsAudioUnlocked(true);
      } catch (err) {
        console.error("Playback failed", err);
      }
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const playNext = async () => {
    const nextIndex = (currentTrackIndex + 1) % MUSIC_TRACKS.length;
    await playTrack(nextIndex);
  };

  const playBack = async () => {
    const prevIndex = (currentTrackIndex - 1 + MUSIC_TRACKS.length) % MUSIC_TRACKS.length;
    await playTrack(prevIndex);
  };

  return (
    <AudioContext.Provider
      value={{
        isPlaying,
        togglePlay,
        playNext,
        playBack,
        audioRef,
        isAudioUnlocked,
        setIsAudioUnlocked,
        currentTrackIndex,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
}
