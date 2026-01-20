import { useState, useEffect, useCallback, useRef } from "react";

export interface AntiCheatViolation {
  type: "tab_switch" | "fullscreen_exit" | "copy_paste" | "right_click";
  timestamp: Date;
}

export interface UseAntiCheatOptions {
  enabled: boolean;
  maxWarnings?: number;
  onMaxWarningsReached?: () => void;
  onViolation?: (violation: AntiCheatViolation) => void;
}

export interface UseAntiCheatReturn {
  isFullscreen: boolean;
  warningCount: number;
  violations: AntiCheatViolation[];
  enterFullscreen: () => Promise<void>;
  exitFullscreen: () => Promise<void>;
  showFullscreenPrompt: boolean;
  dismissFullscreenPrompt: () => void;
  isTabVisible: boolean;
}

export function useAntiCheat({
  enabled,
  maxWarnings = 3,
  onMaxWarningsReached,
  onViolation,
}: UseAntiCheatOptions): UseAntiCheatReturn {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [warningCount, setWarningCount] = useState(0);
  const [violations, setViolations] = useState<AntiCheatViolation[]>([]);
  const [showFullscreenPrompt, setShowFullscreenPrompt] = useState(false);
  const [isTabVisible, setIsTabVisible] = useState(true);
  const hasEnteredFullscreen = useRef(false);

  const addViolation = useCallback(
    (type: AntiCheatViolation["type"]) => {
      if (!enabled) return;

      const violation: AntiCheatViolation = {
        type,
        timestamp: new Date(),
      };

      setViolations((prev) => [...prev, violation]);
      setWarningCount((prev) => {
        const newCount = prev + 1;
        if (newCount >= maxWarnings && onMaxWarningsReached) {
          onMaxWarningsReached();
        }
        return newCount;
      });

      if (onViolation) {
        onViolation(violation);
      }
    },
    [enabled, maxWarnings, onMaxWarningsReached, onViolation]
  );

  // Handle fullscreen changes
  useEffect(() => {
    if (!enabled) return;

    const handleFullscreenChange = () => {
      const isNowFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isNowFullscreen);

      // Only count as violation if user was in fullscreen and exited
      if (!isNowFullscreen && hasEnteredFullscreen.current) {
        addViolation("fullscreen_exit");
        setShowFullscreenPrompt(true);
      }

      if (isNowFullscreen) {
        hasEnteredFullscreen.current = true;
        setShowFullscreenPrompt(false);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [enabled, addViolation]);

  // Handle tab visibility changes
  useEffect(() => {
    if (!enabled) return;

    const handleVisibilityChange = () => {
      const isVisible = document.visibilityState === "visible";
      setIsTabVisible(isVisible);

      if (!isVisible) {
        addViolation("tab_switch");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [enabled, addViolation]);

  // Handle window blur (switching to another window)
  useEffect(() => {
    if (!enabled) return;

    const handleBlur = () => {
      // Only trigger if document is still visible (window switching, not tab switching)
      if (document.visibilityState === "visible") {
        addViolation("tab_switch");
      }
    };

    window.addEventListener("blur", handleBlur);
    return () => {
      window.removeEventListener("blur", handleBlur);
    };
  }, [enabled, addViolation]);

  // Prevent copy/paste
  useEffect(() => {
    if (!enabled) return;

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      addViolation("copy_paste");
    };

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      addViolation("copy_paste");
    };

    document.addEventListener("copy", handleCopy);
    document.addEventListener("paste", handlePaste);

    return () => {
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("paste", handlePaste);
    };
  }, [enabled, addViolation]);

  // Prevent right-click context menu
  useEffect(() => {
    if (!enabled) return;

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      addViolation("right_click");
    };

    document.addEventListener("contextmenu", handleContextMenu);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [enabled, addViolation]);

  // Show fullscreen prompt on mount if enabled
  useEffect(() => {
    if (enabled && !isFullscreen) {
      setShowFullscreenPrompt(true);
    }
  }, [enabled]);

  const enterFullscreen = useCallback(async () => {
    try {
      await document.documentElement.requestFullscreen();
    } catch (error) {
      console.error("Failed to enter fullscreen:", error);
    }
  }, []);

  const exitFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error("Failed to exit fullscreen:", error);
    }
  }, []);

  const dismissFullscreenPrompt = useCallback(() => {
    setShowFullscreenPrompt(false);
  }, []);

  return {
    isFullscreen,
    warningCount,
    violations,
    enterFullscreen,
    exitFullscreen,
    showFullscreenPrompt,
    dismissFullscreenPrompt,
    isTabVisible,
  };
}
