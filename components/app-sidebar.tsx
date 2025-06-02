// components/app-sidebar.tsx

"use client";

import { useTaskStore } from "@/lib/store";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { SidebarHeader } from "./sidebar/sidebar-header";
import { SidebarStats } from "./sidebar/sidebar-stats";
import { SidebarFilters } from "./sidebar/sidebar-filters";
import { SidebarViewControls } from "./sidebar/sidebar-view-controls";
import { SidebarContentSection } from "./sidebar/sidebar-content-section";

// AppSidebar component provides navigation, filters, and settings for the task tracker.
export function AppSidebar() {
  const isSidebarOpen = useTaskStore((state) => state.isSidebarOpen);
  const toggleSidebar = useTaskStore((state) => state.toggleSidebar);

  return (
    <aside
      className={cn(
        "fixed top-16 left-0 z-30",
        "flex flex-col print:hidden",
        "h-[calc(100vh-4rem)]",
        "bg-card border-r border-border/50",
        "transition-all duration-300 ease-in-out",
        isSidebarOpen ? "w-72" : "w-16"
      )}
      aria-label="Control Panel Sidebar"
    >
      {/* Sidebar header with title and toggle button. */}
      <SidebarHeader
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
      />

      {/* Stats section */}
      <SidebarStats isSidebarOpen={isSidebarOpen} />

      {/* Scrollable content area for sidebar sections. */}
      <div
        className={cn(
          "flex-1 overflow-y-auto overflow-x-hidden",
          "transition-all duration-200 ease-in-out",
          isSidebarOpen ? "p-4 space-y-6" : "p-2 space-y-4"
        )}
        aria-hidden={!isSidebarOpen}
      >
        <SidebarFilters isSidebarOpen={isSidebarOpen} />

        {isSidebarOpen && <Separator className="my-2" />}

        <SidebarViewControls isSidebarOpen={isSidebarOpen} />

        {<Separator className="my-2" />}

        <SidebarContentSection isSidebarOpen={isSidebarOpen} />
      </div>
    </aside>
  );
}
