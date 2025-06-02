// components/sidebar/sidebar-stats.tsx

"use client";

import { Circle, Target, CircleCheck } from "lucide-react";
import { useTaskStore } from "@/lib/store";

interface SidebarStatsProps {
  isSidebarOpen: boolean;
}

export function SidebarStats({ isSidebarOpen }: SidebarStatsProps) {
  const stats = useTaskStore((state) => state.stats);

  if (!isSidebarOpen) return null;

  return (
    <div className="bg-muted/30 border-b border-border/30 flex-shrink-0 -mx-0 mb-3">
      <div className="grid grid-cols-3 gap-3 text-center py-3 px-4">
        <div className="flex flex-col gap-1">
          <div className="text-lg font-bold text-success flex items-center justify-center gap-2">
            <CircleCheck className="h-4 w-4" />
            {stats.completed}
          </div>
          <div className="text-xs text-muted-foreground">Completed</div>
        </div>
        <div className="flex flex-col gap-1">
          <div className="text-lg font-bold flex items-center justify-center gap-2">
            <Circle className="h-4 w-4" />
            {stats.total}
          </div>
          <div className="text-xs text-muted-foreground">Total Tasks</div>
        </div>
        <div className="flex flex-col gap-1">
          <div className="text-lg font-bold text-primary flex items-center justify-center gap-2">
            <Target className="h-4 w-4" />
            {stats.percentage}%
          </div>
          <div className="text-xs text-muted-foreground">Progress</div>
        </div>
      </div>
    </div>
  );
}
