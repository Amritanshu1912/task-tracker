"use client"

import { useState, useEffect, useMemo, Suspense } from "react"
import { TaskSection, taskOrSubtaskMatchesFilters } from "@/components/task-section"
import { useTaskStore } from "@/lib/store"
import { AppHeader } from "@/components/app-header"
import { ProgressBar } from "@/components/progress-bar"
import { AppSidebar } from "@/components/app-sidebar"

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="flex flex-col items-center gap-4">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-muted-foreground animate-pulse">Loading your workspace...</p>
    </div>
  </div>
)

export default function TaskTracker() {
  // Get sections and initial data loader from Zustand store
  const sectionsFromStore = useTaskStore((state) => state.sections)
  const activeLabelFilters = useTaskStore((state) => state.activeLabelFilters)
  const loadInitialData = useTaskStore((state) => state.loadInitialData)
  const isSidebarOpen = useTaskStore((state) => state.isSidebarOpen)

  const [isLoaded, setIsLoaded] = useState(false)

  // Load initial data only once
  useEffect(() => {
    loadInitialData()
    setIsLoaded(true)
  }, [loadInitialData])

  // Memoize sections to avoid re-filtering on every render unless dependencies change
  const sectionsToRender = useMemo(() => {
    return Object.entries(sectionsFromStore).map(([sectionId, sectionData], sectionIndex) => {
      const filteredTasks =
        activeLabelFilters.length > 0
          ? sectionData.tasks.filter((task) => taskOrSubtaskMatchesFilters(task, activeLabelFilters))
          : sectionData.tasks

      return {
        ...sectionData,
        id: sectionId,
        tasks: filteredTasks,
        sectionOrder: sectionIndex + 1,
      }
    })
  }, [sectionsFromStore, activeLabelFilters])

  // Show loading indicator until data is loaded
  if (!isLoaded) {
    return <LoadingFallback />
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <AppSidebar />

      {/* Progress Bar - Now more prominent and well-positioned */}
      <ProgressBar />

      {/* Main Content */}
      <main
        className={`container mx-auto py-8 px-4 max-w-6xl transition-all duration-300 ${isSidebarOpen ? "ml-80" : ""}`}
      >
        <div className="space-y-8">
          <Suspense fallback={<LoadingFallback />}>
            {sectionsToRender.map((section) => (
              <TaskSection
                key={section.id}
                id={section.id}
                title={section.title}
                icon={section.icon}
                description={section.description}
                tasks={section.tasks}
                maxVisibleDepth={null}
              />
            ))}
          </Suspense>
        </div>

        {/* Empty state */}
        {sectionsToRender.every((section) => section.tasks.length === 0) && (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <span className="text-2xl">📋</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">No tasks yet</h3>
            <p className="text-muted-foreground mb-4">Get started by adding your first task to a section</p>
          </div>
        )}
      </main>
    </div>
  )
}
