import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  SkipBack,
  SkipForward,
  Gauge,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface VideoPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string | null;
  thumbnailUrl: string | null;
  courseTitle: string;
}

export const VideoPreviewModal = ({
  isOpen,
  onClose,
  videoUrl,
  thumbnailUrl,
  courseTitle,
}: VideoPreviewModalProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const playbackSpeeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();
  const hasRestoredPosition = useRef(false);

  // Generate storage key from video URL
  const getStorageKey = (url: string) => {
    return `video_position_${btoa(url).slice(0, 50)}`;
  };

  // Save playback position to localStorage
  const savePlaybackPosition = () => {
    if (videoRef.current && videoUrl && currentTime > 0) {
      const key = getStorageKey(videoUrl);
      const data = {
        position: videoRef.current.currentTime,
        duration: duration,
        timestamp: Date.now(),
      };
      localStorage.setItem(key, JSON.stringify(data));
    }
  };

  // Load saved playback position
  const loadPlaybackPosition = (): number | null => {
    if (!videoUrl) return null;
    try {
      const key = getStorageKey(videoUrl);
      const saved = localStorage.getItem(key);
      if (saved) {
        const data = JSON.parse(saved);
        // Only restore if saved within last 7 days
        const sevenDays = 7 * 24 * 60 * 60 * 1000;
        if (Date.now() - data.timestamp < sevenDays) {
          return data.position;
        }
      }
    } catch (e) {
      console.error("Error loading playback position:", e);
    }
    return null;
  };

  // Auto-save position periodically
  useEffect(() => {
    if (!isOpen || !isPlaying) return;
    
    const saveInterval = setInterval(() => {
      savePlaybackPosition();
    }, 5000); // Save every 5 seconds

    return () => clearInterval(saveInterval);
  }, [isOpen, isPlaying, currentTime, videoUrl]);

  // Save position when modal closes
  useEffect(() => {
    if (!isOpen && videoUrl && currentTime > 0) {
      savePlaybackPosition();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && videoRef.current && !hasRestoredPosition.current) {
      const savedPosition = loadPlaybackPosition();
      if (savedPosition && savedPosition > 0) {
        videoRef.current.currentTime = savedPosition;
        setCurrentTime(savedPosition);
      }
      hasRestoredPosition.current = true;
      videoRef.current.play();
      setIsPlaying(true);
    }
  }, [isOpen, videoUrl]);

  useEffect(() => {
    if (!isOpen) {
      setIsPlaying(false);
      hasRestoredPosition.current = false;
    }
  }, [isOpen]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (value: number[]) => {
    const newTime = value[0];
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const skip = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(
        Math.max(videoRef.current.currentTime + seconds, 0),
        duration
      );
    }
  };

  const changePlaybackSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const toggleFullscreen = async () => {
    const container = document.getElementById("video-preview-container");
    if (!container) return;

    if (!isFullscreen) {
      if (container.requestFullscreen) {
        await container.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl w-[95vw] p-0 overflow-hidden bg-black">
        <DialogHeader className="absolute top-0 left-0 right-0 z-20 p-4 bg-gradient-to-b from-black/80 to-transparent">
          <DialogTitle className="text-white pr-8">
            Xem trước: {courseTitle}
          </DialogTitle>
        </DialogHeader>

        <div
          id="video-preview-container"
          className="relative aspect-video bg-black group"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => isPlaying && setShowControls(false)}
        >
          {videoUrl ? (
            <>
              <video
                ref={videoRef}
                src={videoUrl}
                className="w-full h-full object-contain cursor-pointer"
                poster={thumbnailUrl || undefined}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleVideoEnded}
                onClick={togglePlay}
              />

              {/* Play/Pause Overlay Button */}
              {!isPlaying && (
                <button
                  onClick={togglePlay}
                  className="absolute inset-0 flex items-center justify-center bg-black/30"
                >
                  <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform">
                    <Play className="w-8 h-8 text-black ml-1" />
                  </div>
                </button>
              )}

              {/* Video Controls */}
              <div
                className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent transition-opacity duration-300 ${
                  showControls ? "opacity-100" : "opacity-0"
                }`}
              >
                {/* Progress Bar */}
                <div className="mb-3">
                  <Slider
                    value={[currentTime]}
                    max={duration || 100}
                    step={0.1}
                    onValueChange={handleSeek}
                    className="cursor-pointer [&>span:first-child]:h-1 [&>span:first-child]:bg-white/30 [&_[role=slider]]:h-3 [&_[role=slider]]:w-3 [&_[role=slider]]:bg-white [&>span:first-child_>span]:bg-primary"
                  />
                </div>

                <div className="flex items-center justify-between text-white">
                  {/* Left Controls */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white hover:bg-white/20 h-8 w-8"
                      onClick={togglePlay}
                    >
                      {isPlaying ? (
                        <Pause className="h-5 w-5" />
                      ) : (
                        <Play className="h-5 w-5" />
                      )}
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white hover:bg-white/20 h-8 w-8"
                      onClick={() => skip(-10)}
                    >
                      <SkipBack className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white hover:bg-white/20 h-8 w-8"
                      onClick={() => skip(10)}
                    >
                      <SkipForward className="h-4 w-4" />
                    </Button>

                    {/* Volume */}
                    <div className="flex items-center gap-2 group/volume">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/20 h-8 w-8"
                        onClick={toggleMute}
                      >
                        {isMuted || volume === 0 ? (
                          <VolumeX className="h-5 w-5" />
                        ) : (
                          <Volume2 className="h-5 w-5" />
                        )}
                      </Button>
                      <div className="w-0 overflow-hidden group-hover/volume:w-20 transition-all duration-200">
                        <Slider
                          value={[isMuted ? 0 : volume]}
                          max={1}
                          step={0.1}
                          onValueChange={handleVolumeChange}
                          className="cursor-pointer [&>span:first-child]:h-1 [&>span:first-child]:bg-white/30 [&_[role=slider]]:h-3 [&_[role=slider]]:w-3 [&_[role=slider]]:bg-white [&>span:first-child_>span]:bg-white"
                        />
                      </div>
                    </div>

                    <span className="text-sm ml-2">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>

                  {/* Right Controls */}
                  <div className="flex items-center gap-2">
                    {/* Playback Speed Control */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="text-white hover:bg-white/20 h-8 px-2 text-sm font-medium"
                        >
                          <Gauge className="h-4 w-4 mr-1" />
                          {playbackSpeed}x
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="min-w-[80px]">
                        {playbackSpeeds.map((speed) => (
                          <DropdownMenuItem
                            key={speed}
                            onClick={() => changePlaybackSpeed(speed)}
                            className={playbackSpeed === speed ? "bg-accent" : ""}
                          >
                            {speed}x
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white hover:bg-white/20 h-8 w-8"
                      onClick={toggleFullscreen}
                    >
                      {isFullscreen ? (
                        <Minimize className="h-5 w-5" />
                      ) : (
                        <Maximize className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* No Video Available */
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
              {thumbnailUrl ? (
                <img
                  src={thumbnailUrl}
                  alt={courseTitle}
                  className="w-full h-full object-cover opacity-50"
                />
              ) : null}
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50">
                <Play className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-lg">Video xem trước chưa có sẵn</p>
                <p className="text-sm text-gray-400 mt-2">
                  Vui lòng đăng ký khóa học để xem nội dung
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
