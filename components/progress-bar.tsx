// components/progress-bar.tsx

"use client";

import { useEffect, useState, useRef, memo } from "react";
import { useTaskStore } from "@/lib/store";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  className?: string;
}

// Displays a progress bar that adapts to scroll position and task completion.
export const ProgressBar = memo(function ProgressBar({
  className,
}: ProgressBarProps) {
  // Access task statistics from Zustand store
  const stats = useTaskStore((state) => state.stats);

  // Tracks visibility and compact mode state
  const [isVisible, setIsVisible] = useState(true);
  const [isCompact, setIsCompact] = useState(false);

  // Tracks last scroll position
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  // Controls glow effect visibility on progress change
  const [glowVisible, setGlowVisible] = useState(false);
  const prevPercentageRef = useRef(stats.percentage);

  // Show glow when progress percentage changes
  useEffect(() => {
    if (stats.percentage !== prevPercentageRef.current) {
      setGlowVisible(true);
      prevPercentageRef.current = stats.percentage;
      const timer = setTimeout(() => {
        setGlowVisible(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [stats.percentage]);

  // Handle scroll events to adjust visibility and compact mode
  useEffect(() => {
    const handleScroll = () => {
      if (!ticking.current) {
        requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const scrollingDown = currentScrollY > lastScrollY.current;

          const scrollThresholdCompact = 50;
          const scrollThresholdHide = 100;

          if (currentScrollY > scrollThresholdHide && scrollingDown) {
            setIsVisible(false);
          } else if (!scrollingDown || currentScrollY <= scrollThresholdHide) {
            setIsVisible(true);
          }

          setIsCompact(currentScrollY > scrollThresholdCompact);

          lastScrollY.current = currentScrollY;
          ticking.current = false;
        });
        ticking.current = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Determine dynamic styles
  let transformStyle = "translate-y-0";
  let opacityStyle = "opacity-100";
  let paddingStyle: string;
  let barHeightClass: string;

  if (!isVisible) {
    transformStyle = "translate-y-[-0.25rem]";
    opacityStyle = "opacity-0";
    paddingStyle = "pt-0 pb-1";
    barHeightClass = "h-2";
  } else if (isCompact) {
    transformStyle = "translate-y-[-0.25rem]";
    paddingStyle = "pt-0 pb-1";
    barHeightClass = "h-2";
  } else {
    transformStyle = "translate-y-0";
    paddingStyle = "py-3";
    barHeightClass = "h-3";
  }

  return (
    <div
      className={cn(
        "w-full transition-all duration-300 ease-out print:hidden",
        "mx-auto max-w-6xl",
        paddingStyle,
        opacityStyle,
        className
      )}
      style={{ transform: transformStyle }}
    >
      <div className={cn("flex items-center gap-4")}>
        <div className="flex-1 min-w-0">
          <div className="relative flex">
            <Progress
              value={stats.percentage}
              className={cn(
                "h-2 w-full overflow-hidden rounded-full relative",
                "bg-[hsl(220_9%_25%)]",
                "[&>[data-state=fill]]:transition-all",
                "[&>[data-state=fill]]:shadow-[0_0_20px_hsl(217_91%_60%_/_0.4)]"
              )}
            />
            <div
              className={cn(
                "absolute inset-0 rounded-full blur-sm",
                "transition-opacity duration-500 ease-out",
                glowVisible ? "opacity-30" : "opacity-0"
              )}
              style={{
                width: `${stats.percentage}%`,
                background:
                  "linear-gradient(90deg, hsl(217 91% 60%), hsl(264 80% 70%))",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
});
