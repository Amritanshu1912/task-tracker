// app/page.tsx
"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { TaskSection } from "@/components/task-section";
import { useTaskStore } from "@/lib/store";
import { AppHeader } from "@/components/app-header";
import { ProgressBar } from "@/components/progress-bar";
import { AppSidebar } from "@/components/app-sidebar";
import { cn } from "@/lib/utils";

// Fallback UI displayed during initial data loading.
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="flex flex-col items-center gap-4">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-muted-foreground animate-pulse">
        Loading your workspace...
      </p>
    </div>
  </div>
);

// Main application layout component for the task tracker.
// Manages initial data loading and top-level UI orchestration.
export default function TaskTracker() {
  const sectionsFromStore = useTaskStore((state) => state.sections);
  const loadInitialData = useTaskStore((state) => state.loadInitialData);
  const isSidebarOpen = useTaskStore((state) => state.isSidebarOpen);

  const [isLoaded, setIsLoaded] = useState(false);

  // Loads initial data from storage on component mount.
  useEffect(() => {
    loadInitialData();
    setIsLoaded(true);
  }, [loadInitialData]);

  // Transforms sections object into an array for rendering.
  const sectionsToRender = useMemo(() => {
    return Object.entries(sectionsFromStore).map(
      ([sectionId, sectionData], sectionIndex) => ({
        ...sectionData,
        id: sectionId,
        sectionOrder: sectionIndex + 1,
      })
    );
  }, [sectionsFromStore]);

  if (!isLoaded) {
    return <LoadingFallback />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <AppHeader />

      <div className="flex flex-1 pt-4">
        <AppSidebar />
        <div
          className={cn(
            "flex-1 flex flex-col overflow-y-auto transition-all duration-300 ease-in-out"
          )}
          style={{
            // Adjusts main content margin based on sidebar visibility.
            marginLeft: isSidebarOpen ? "18rem" : "4rem",
          }}
        >
          <ProgressBar />

          <main className="container mx-auto py-8 px-4 max-w-6xl">
            <div className="space-y-8">
              {/* Suspense boundary for potential async components. */}
              <Suspense fallback={<LoadingFallback />}>
                {sectionsToRender.map((section) => (
                  <TaskSection
                    key={section.id}
                    id={section.id}
                    title={section.title}
                    icon={section.icon}
                    description={section.description}
                    tasks={section.tasks}
                  />
                ))}
              </Suspense>
            </div>

            {/* Displays a message if no tasks are present across all sections. */}
            {sectionsToRender.every((section) => section.tasks.length === 0) &&
              Object.keys(sectionsFromStore).length > 0 && (
                <div className="text-center py-16">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-2xl">📋</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No tasks yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Get started by adding your first task to a section
                  </p>
                </div>
              )}
          </main>
        </div>
      </div>
    </div>
  );
}
