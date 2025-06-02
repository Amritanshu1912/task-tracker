// components/sidebar/sidebar-components.tsx

"use client";

import type React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Renders a section header with an icon and title.
export const SidebarSection = ({
  title,
  icon: Icon,
  children,
  className,
  isSidebarOpen,
}: {
  title: string;
  icon?: React.ElementType;
  children: React.ReactNode;
  className?: string;
  isSidebarOpen: boolean;
}) => (
  <div className={cn("space-y-3", className)}>
    {isSidebarOpen && (
      <div className="flex items-center gap-2 px-0">
        {Icon && <Icon className="w-4 h-4 text-primary" />}
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {title}
        </h3>
      </div>
    )}
    <div className="space-y-1">{children}</div>
  </div>
);

// Renders a stylized button for the sidebar.
export const SidebarButton = ({
  icon: Icon,
  label,
  onClick,
  variant = "ghost",
  className,
  badge,
  tooltip,
  isSidebarOpen,
  ...props
}: {
  icon?: React.ElementType;
  label: string;
  onClick?: () => void;
  variant?: "ghost" | "outline" | "default" | "secondary" | "destructive";
  className?: string;
  badge?: string | number;
  tooltip?: string;
  isSidebarOpen: boolean;
  [key: string]: any;
}) => {
  const button = (
    <Button
      variant={variant}
      size="sm"
      onClick={onClick}
      className={cn(
        isSidebarOpen
          ? "w-full justify-start gap-3 h-9 px-3 font-normal"
          : "w-10 h-10 p-0",
        "hover:bg-accent hover:text-accent-foreground",
        "transition-colors duration-200",
        className
      )}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4 shrink-0" />}
      {isSidebarOpen && <span className="truncate">{label}</span>}
      {isSidebarOpen && badge && (
        <Badge variant="secondary" className="ml-auto text-xs px-1.5 py-0">
          {badge}
        </Badge>
      )}
    </Button>
  );

  if (!isSidebarOpen && tooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent side="right">{tooltip}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return button;
};
