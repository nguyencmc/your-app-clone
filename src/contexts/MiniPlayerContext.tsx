import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";

interface MiniPlayerPodcast {
  id: string;
  title: string;
  slug: string;
  thumbnail_url: string | null;
  audio_url: string | null;
  host_name: string | null;
}

interface MiniPlayerContextType {
  currentPodcast: MiniPlayerPodcast | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playbackRate: number;
  audioRef: React.RefObject<HTMLAudioElement>;
  setCurrentPodcast: (podcast: MiniPlayerPodcast | null) => void;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  seek: (time: number) => void;
  setVolume: (vol: number) => void;
  setPlaybackRate: (rate: number) => void;
  closeMiniPlayer: () => void;
}

const MiniPlayerContext = createContext<MiniPlayerContextType | null>(null);

export const useMiniPlayer = () => {
  const context = useContext(MiniPlayerContext);
  if (!context) {
    throw new Error("useMiniPlayer must be used within MiniPlayerProvider");
  }
  return context;
};

export const MiniPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPodcast, setCurrentPodcastState] = useState<MiniPlayerPodcast | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.7);
  const [playbackRate, setPlaybackRateState] = useState(1);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
    };
  }, [currentPodcast]);

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Update playback rate
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  const setCurrentPodcast = useCallback((podcast: MiniPlayerPodcast | null) => {
    setCurrentPodcastState(podcast);
    if (podcast && audioRef.current) {
      audioRef.current.src = podcast.audio_url || "";
      audioRef.current.load();
    }
  }, []);

  const play = useCallback(() => {
    audioRef.current?.play();
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const setVolume = useCallback((vol: number) => {
    setVolumeState(vol);
  }, []);

  const setPlaybackRate = useCallback((rate: number) => {
    setPlaybackRateState(rate);
  }, []);

  const closeMiniPlayer = useCallback(() => {
    pause();
    setCurrentPodcastState(null);
    setCurrentTime(0);
    setDuration(0);
  }, [pause]);

  return (
    <MiniPlayerContext.Provider
      value={{
        currentPodcast,
        isPlaying,
        currentTime,
        duration,
        volume,
        playbackRate,
        audioRef,
        setCurrentPodcast,
        play,
        pause,
        togglePlay,
        seek,
        setVolume,
        setPlaybackRate,
        closeMiniPlayer,
      }}
    >
      {children}
      {/* Global audio element */}
      <audio ref={audioRef} preload="metadata" />
    </MiniPlayerContext.Provider>
  );
};
