// components/progress-bar.tsx

"use client";

import { useEffect, useState, useRef, memo } from "react";
import { useTaskStore } from "@/lib/store";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  className?: string;
}

// Displays overall task progress with a dynamic bar.
// Adjusts visibility and size based on scroll position.
export const ProgressBar = memo(function ProgressBar({
  className,
}: ProgressBarProps) {
  const stats = useTaskStore((state) => state.stats);
  const [isVisible, setIsVisible] = useState(true);
  const [isCompact, setIsCompact] = useState(false);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  // Manages scroll-based visibility and compact mode.
  useEffect(() => {
    const handleScroll = () => {
      if (!ticking.current) {
        requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const scrollingDown = currentScrollY > lastScrollY.current;
          const scrollThreshold = 100;

          // Hides when scrolling down past threshold, shows when scrolling up.
          if (currentScrollY > scrollThreshold && scrollingDown) {
            setIsVisible(false);
          } else if (!scrollingDown || currentScrollY <= scrollThreshold) {
            setIsVisible(true);
          }

          // Activates compact mode when scrolled down.
          setIsCompact(currentScrollY > 50);

          lastScrollY.current = currentScrollY;
          ticking.current = false;
        });
        ticking.current = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={cn(
        "sticky top-[0px] z-30 transition-all duration-300 ease-out print:hidden",
        "glass-morphism border-b border-border/50",
        isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0",
        isCompact ? "py-2" : "py-4",
        className
      )}
    >
      <div className="container mx-auto px-4">
        <div
          className={cn(
            "flex items-center gap-4 transition-all duration-300",
            isCompact ? "flex-row" : "flex-col sm:flex-row"
          )}
        >
          {/* Main progress bar element */}
          <div className="flex-1 min-w-0">
            <div className="relative flex">
              <Progress
                value={stats.percentage}
                className={cn(
                  "w-full transition-all duration-300",
                  isCompact ? "h-2" : "h-3"
                )}
              />
              {/* Visual glow effect for the progress fill */}
              <div
                className="absolute inset-0 rounded-full opacity-30 blur-sm progress-bar-fill"
                style={{ width: `${stats.percentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
