// app/page.tsx

"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { taskMatchesFilters } from "../lib/filters";
import { TaskItem } from "@/components/task-item";
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
  const rootTasksFromStore = useTaskStore((state) => state.tasks);
  const activeLabelFilters = useTaskStore((state) => state.activeLabelFilters);
  const activeStatusFilter = useTaskStore((state) => state.activeStatusFilter);
  const loadInitialData = useTaskStore((state) => state.loadInitialData);
  const isSidebarOpen = useTaskStore((state) => state.isSidebarOpen);

  const [isLoaded, setIsLoaded] = useState(false);

  // Loads initial data from storage on component mount.
  useEffect(() => {
    loadInitialData();
    setIsLoaded(true);
  }, [loadInitialData]);

  const filteredRootTasks = useMemo(() => {
    // Apply filters directly to the root tasks array
    return rootTasksFromStore.filter((task) =>
      taskMatchesFilters(task, activeLabelFilters, activeStatusFilter)
    );
  }, [rootTasksFromStore, activeLabelFilters, activeStatusFilter]);

  if (!isLoaded) {
    return <LoadingFallback />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <AppHeader />

      <div className="flex flex-1 pt-16">
        <AppSidebar />

        <div className="flex-1 flex flex-col transition-all duration-300 ease-in-out">
          {/* Fixed ProgressBar flush below header */}
          <div
            className="fixed top-16 left-0 right-0 z-20"
            style={{ marginLeft: isSidebarOpen ? "18rem" : "4rem" }}
          >
            <ProgressBar />
          </div>

          {/* Scrollable main content starts below progress bar */}
          <div
            className="flex-1 overflow-y-auto"
            style={{
              marginLeft: isSidebarOpen ? "18rem" : "4rem",
              // paddingTop: "2.75rem", // leave space for ProgressBar (approx. 44px)
            }}
          >
            <main className="container mx-auto py-8 px-4 max-w-6xl">
              <div className="space-y-8">
                {/* Suspense boundary for potential async components. */}
                <Suspense fallback={<LoadingFallback />}>
                  {filteredRootTasks.map((task, index) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      taskNumber={(index + 1).toString()}
                      level={0}
                    />
                  ))}
                </Suspense>
              </div>

              {/* Displays a message if no tasks are present across all sections. */}
              {(rootTasksFromStore.length === 0 ||
                (isLoaded &&
                  filteredRootTasks.length === 0 &&
                  (activeLabelFilters.length > 0 ||
                    activeStatusFilter !== null))) && (
                <div className="text-center py-16">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-2xl">📋</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    {rootTasksFromStore.length === 0
                      ? "No tasks yet"
                      : "No tasks match filters"}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {rootTasksFromStore.length === 0
                      ? "Get started by adding your first task!"
                      : "Try adjusting your filters or add new tasks."}
                  </p>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
