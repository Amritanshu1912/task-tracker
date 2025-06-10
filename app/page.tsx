// app/page.tsx
"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { taskMatchesFilters } from "../lib/filters";
import { TaskItem } from "@/components/task-item";
import { useTaskStore } from "@/lib/store";
import { AppHeader } from "@/components/app-header";
import { ProgressBar } from "@/components/progress-bar";
import { AppSidebar } from "@/components/app-sidebar";
import { EmptyStateCard } from "@/components/empty-state-card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { TaskStore as TaskStoreType } from "@/lib/types";

/**
 * Renders a loading fallback UI.
 */
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

/**
 * Renders a call to action for users with no projects.
 */
const NoProjectsState = () => {
  const addProject = useTaskStore((state: TaskStoreType) => state.addProject);
  const setEditingProjectId = useTaskStore(
    (state: TaskStoreType) => state.setEditingProjectId
  );
  const toggleSidebar = useTaskStore(
    (state: TaskStoreType) => state.toggleSidebar
  );
  const isSidebarOpen = useTaskStore(
    (state: TaskStoreType) => state.isSidebarOpen
  );

  const handleCreateFirstProject = () => {
    const newProjectId = addProject();
    setEditingProjectId(newProjectId);
    if (!isSidebarOpen) {
      toggleSidebar();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center text-center py-16 md:py-24">
      <div className="p-6 bg-primary/10 rounded-full mb-6">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-folder-plus text-primary"
        >
          <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"></path>
          <path d="M12 10v6"></path>
          <path d="M9 13h6"></path>
        </svg>
      </div>
      <h2 className="text-2xl font-semibold mb-3">
        Welcome to Your Workspace!
      </h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        It looks like you don't have any projects yet. <br />
        Create your first project to start organizing your tasks.
      </p>
      <Button size="lg" onClick={handleCreateFirstProject}>
        <Plus className="mr-2 h-5 w-5" />
        Create Your First Project
      </Button>
      <p className="text-xs text-muted-foreground mt-4">
        (Your new project will appear in the sidebar, ready for you to name it.)
      </p>
    </div>
  );
};

export default function TaskTrackerPage() {
  // Select necessary state slices from the store individually for optimized re-renders.
  const projects = useTaskStore((state: TaskStoreType) => state.projects);
  const activeProjectId = useTaskStore(
    (state: TaskStoreType) => state.activeProjectId
  );
  const activeLabelFilters = useTaskStore(
    (state: TaskStoreType) => state.activeLabelFilters
  );
  const activeStatusFilter = useTaskStore(
    (state: TaskStoreType) => state.activeStatusFilter
  );
  const loadInitialData = useTaskStore(
    (state: TaskStoreType) => state.loadInitialData
  );
  const isSidebarOpen = useTaskStore(
    (state: TaskStoreType) => state.isSidebarOpen
  );

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load initial data only once when the component mounts.
    if (!isLoaded) {
      loadInitialData();
      setIsLoaded(true);
    }
  }, [loadInitialData, isLoaded]);

  // Memoize the active project to prevent unnecessary re-calculations.
  const activeProject = useMemo(
    () => projects.find((p) => p.id === activeProjectId),
    [projects, activeProjectId]
  );

  // Memoize the filtered tasks to optimize performance when filters or tasks change.
  const tasksToDisplay = useMemo(() => {
    if (!activeProject) return [];
    return activeProject.tasks.filter((task) =>
      taskMatchesFilters(task, activeLabelFilters, activeStatusFilter)
    );
  }, [activeProject, activeLabelFilters, activeStatusFilter]);

  // Show a loading spinner until initial data is loaded.
  if (!isLoaded) {
    return <LoadingFallback />;
  }

  // Determine which UI state to display based on loaded data and filters.
  const showNoProjectsState = projects.length === 0;
  const showActiveProjectEmptyState =
    projects.length > 0 && activeProject && activeProject.tasks.length === 0;
  const showTasksList = activeProject && tasksToDisplay.length > 0;
  const showNoMatchFilterState =
    activeProject &&
    activeProject.tasks.length > 0 &&
    tasksToDisplay.length === 0 &&
    (activeLabelFilters.length > 0 || activeStatusFilter !== null);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <AppHeader />
      <div className="flex flex-1 pt-16">
        <AppSidebar />
        <div
          className="flex-1 flex flex-col transition-all duration-300 ease-in-out"
          style={{ marginLeft: isSidebarOpen ? "18rem" : "4rem" }}
        >
          {/* Progress bar positioned at the top of the main content area. */}
          <div
            className="fixed top-16 left-0 right-0 z-20"
            style={{ marginLeft: isSidebarOpen ? "18rem" : "4rem" }}
          >
            <ProgressBar />
          </div>

          <main
            className="flex-1 overflow-y-auto"
            style={{ paddingTop: "2.75rem" }}
          >
            <div className="container mx-auto py-8 px-4 max-w-6xl">
              {showNoProjectsState ? (
                <NoProjectsState />
              ) : showActiveProjectEmptyState && !showNoMatchFilterState ? (
                <EmptyStateCard />
              ) : showTasksList ? (
                <div className="space-y-8">
                  {/* Suspense boundary for potential future async TaskItem loading. */}
                  <Suspense fallback={<LoadingFallback />}>
                    {tasksToDisplay.map((task, index) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        taskNumber={(index + 1).toString()}
                        level={0}
                      />
                    ))}
                  </Suspense>
                </div>
              ) : showNoMatchFilterState ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-2xl">🚫</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    No Tasks Match Filters
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your label or status filters for project "
                    {activeProject?.name}".
                  </p>
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-inbox text-muted-foreground"
                    >
                      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline>
                      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path>
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    Select a Project
                  </h3>
                  <p className="text-muted-foreground">
                    Please select a project from the sidebar to view tasks.
                  </p>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
