// components/sidebar/sidebar-stats.tsx
"use client";

import { CircleCheck, Circle, Target } from "lucide-react";
import type { TaskStore } from "@/lib/types";

interface SidebarStatsProps {
  stats: TaskStore["stats"];
  isSidebarOpen: boolean;
}

export function SidebarStats({ stats, isSidebarOpen }: SidebarStatsProps) {
  if (!isSidebarOpen) {
    return null;
  }

  return (
    <div className="bg-muted/30 border-b border-border/30 flex-shrink-0 px-4 py-3">
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="flex flex-col gap-1">
          <div className="text-lg font-bold text-green-500 flex items-center justify-center gap-1.5">
            <CircleCheck className="h-4 w-4" />
            {stats.completed}
          </div>
          <div className="text-xs text-muted-foreground">Completed</div>
        </div>
        <div className="flex flex-col gap-1">
          <div className="text-lg font-bold flex items-center justify-center gap-1.5">
            <Circle className="h-4 w-4" />
            {stats.total}
          </div>
          <div className="text-xs text-muted-foreground">Total Tasks</div>
        </div>
        <div className="flex flex-col gap-1">
          <div className="text-lg font-bold text-primary flex items-center justify-center gap-1.5">
            <Target className="h-4 w-4" />
            {stats.percentage}%
          </div>
          <div className="text-xs text-muted-foreground">Progress</div>
        </div>
      </div>
    </div>
  );
}
// --- END OF FILE components/sidebar/sidebar-stats.tsx ---
