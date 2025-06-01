"use client"

import { useTaskStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Menu, Zap } from "lucide-react"

export function AppHeader() {
  const toggleSidebar = useTaskStore((state) => state.toggleSidebar)

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl print:hidden">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Left: Logo and Navigation */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="hover:bg-accent">
            <Menu className="w-5 h-5" />
          </Button>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Task Tracker</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">E-commerce Platform - Phase 2</p>
            </div>
          </div>
        </div>

        {/* Right: Quick Stats */}
        <div className="flex items-center gap-4 text-sm">
          <div className="hidden md:flex items-center gap-4">
            <QuickStat label="Done" value={useTaskStore((state) => state.stats.completed)} variant="success" />
            <QuickStat label="Total" value={useTaskStore((state) => state.stats.total)} variant="default" />
            <QuickStat
              label="Progress"
              value={`${useTaskStore((state) => state.stats.percentage)}%`}
              variant="primary"
            />
          </div>
        </div>
      </div>
    </header>
  )
}

function QuickStat({
  label,
  value,
  variant = "default",
}: {
  label: string
  value: string | number
  variant?: "default" | "success" | "primary"
}) {
  const variantClasses = {
    default: "text-foreground",
    success: "text-success",
    primary: "text-primary",
  }

  return (
    <div className="text-center">
      <div className={`font-bold ${variantClasses[variant]}`}>{value}</div>
      <div className="text-xs text-muted-foreground uppercase tracking-wide">{label}</div>
    </div>
  )
}
