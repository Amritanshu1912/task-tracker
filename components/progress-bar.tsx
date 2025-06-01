"use client"

import { useEffect, useState, useRef, memo } from "react"
import { useTaskStore } from "@/lib/store"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { CheckCircle, Circle, Target } from "lucide-react"

interface ProgressBarProps {
  className?: string
  showDetails?: boolean
}

export const ProgressBar = memo(function ProgressBar({ className, showDetails = true }: ProgressBarProps) {
  const stats = useTaskStore((state) => state.stats)
  const [isVisible, setIsVisible] = useState(true)
  const [isCompact, setIsCompact] = useState(false)
  const lastScrollY = useRef(0)
  const ticking = useRef(false)

  useEffect(() => {
    const handleScroll = () => {
      if (!ticking.current) {
        requestAnimationFrame(() => {
          const currentScrollY = window.scrollY
          const scrollingDown = currentScrollY > lastScrollY.current
          const scrollThreshold = 100

          // Hide when scrolling down past threshold, show when scrolling up
          if (currentScrollY > scrollThreshold && scrollingDown) {
            setIsVisible(false)
          } else if (!scrollingDown || currentScrollY <= scrollThreshold) {
            setIsVisible(true)
          }

          // Compact mode when scrolled
          setIsCompact(currentScrollY > 50)

          lastScrollY.current = currentScrollY
          ticking.current = false
        })
        ticking.current = true
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div
      className={cn(
        "sticky top-[72px] z-30 transition-all duration-300 ease-out print:hidden",
        "glass-morphism border-b border-border/50",
        isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0",
        isCompact ? "py-2" : "py-4",
        className,
      )}
    >
      <div className="container mx-auto px-4">
        <div
          className={cn(
            "flex items-center gap-4 transition-all duration-300",
            isCompact ? "flex-row" : "flex-col sm:flex-row",
          )}
        >
          {/* Progress Stats */}
          {showDetails && (
            <div className={cn("flex items-center gap-4 text-sm", isCompact ? "gap-3" : "gap-4")}>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" />
                <span className="font-medium text-success">{stats.completed}</span>
                <span className="text-muted-foreground">completed</span>
              </div>
              <div className="flex items-center gap-2">
                <Circle className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{stats.total}</span>
                <span className="text-muted-foreground">total</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                <span className="font-bold text-primary">{stats.percentage}%</span>
                <span className="text-muted-foreground">progress</span>
              </div>
            </div>
          )}

          {/* Progress Bar */}
          <div className="flex-1 min-w-0">
            <div className="relative">
              <Progress
                value={stats.percentage}
                className={cn("w-full transition-all duration-300", isCompact ? "h-2" : "h-3")}
              />
              {/* Animated glow effect */}
              <div
                className="absolute inset-0 rounded-full opacity-30 blur-sm progress-bar-fill"
                style={{ width: `${stats.percentage}%` }}
              />
            </div>
            {!isCompact && (
              <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
                <span>0%</span>
                <span className="font-medium">Overall Progress</span>
                <span>100%</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
})
