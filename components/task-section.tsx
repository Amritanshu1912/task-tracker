"use client"

import { useState, useMemo, useCallback } from "react"
import type { Task } from "@/lib/types"
import { TaskItem } from "@/components/task-item"
import { Button } from "@/components/ui/button"
import { Plus, ChevronDown, ChevronRight } from "lucide-react"
import { Card } from "@/components/ui/card"
import { useTaskStore } from "@/lib/store"
import React from "react"

interface TaskSectionProps {
  id: string
  title: string
  icon: string
  description: string
  tasks: Task[]
  maxVisibleDepth: number // Declare maxVisibleDepth in the interface
}

// Memoized filter function to avoid recalculating on every render
export const taskOrSubtaskMatchesFilters = (() => {
  const cache = new Map<string, boolean>()

  return function matchesFilters(task: Task, activeFilters: string[]): boolean {
    if (activeFilters.length === 0) return true

    // Create a cache key based on task ID and active filters
    const cacheKey = `${task.id}-${activeFilters.join(",")}`

    if (cache.has(cacheKey)) {
      return cache.get(cacheKey)!
    }

    // Check if task has any of the active filters
    if (task.labels.some((label) => activeFilters.includes(label))) {
      cache.set(cacheKey, true)
      return true
    }

    // Check subtasks recursively
    const result = task.subtasks?.some((subtask) => matchesFilters(subtask, activeFilters)) ?? false

    // Limit cache size to prevent memory leaks
    if (cache.size > 1000) {
      const keys = Array.from(cache.keys())
      cache.delete(keys[0]) // Remove oldest entry
    }

    cache.set(cacheKey, result)
    return result
  }
})()

/**
 * TaskSectionData - Renders a section of tasks with filtering, add, and collapse functionality.
 * Uses memoization and callbacks for performance. Modern, accessible UI.
 */
export const TaskSection = React.memo(function TaskSection({
  id,
  title,
  icon,
  description,
  tasks,
  maxVisibleDepth, // Use maxVisibleDepth from props
}: TaskSectionProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const addTaskToSection = useTaskStore((state) => state.addTaskToSection)
  const activeLabelFilters = useTaskStore((state) => state.activeLabelFilters)

  // Add new task handler - memoized to prevent recreating on every render
  const handleAddTask = useCallback(() => {
    addTaskToSection(id, {
      id: crypto.randomUUID(),
      title: "New Task",
      notes: "",
      completed: false,
      labels: [],
      subtasks: [],
    })
  }, [addTaskToSection, id])

  // Keyboard accessibility for collapse/expand
  const handleHeaderKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      setIsCollapsed((prev) => !prev)
    }
  }, [])

  // Toggle collapse state
  const toggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => !prev)
  }, [])

  // Memoize filtered tasks to avoid recalculating on every render
  const filteredTopLevelTasks = useMemo(() => {
    if (activeLabelFilters.length === 0) return tasks
    return tasks.filter((task) => taskOrSubtaskMatchesFilters(task, activeLabelFilters))
  }, [tasks, activeLabelFilters])

  return (
    <Card className="overflow-hidden border border-border/40 shadow-sm">
      <div
        className="flex items-center justify-between p-4 cursor-pointer bg-card hover:bg-secondary/60 transition-colors"
        onClick={toggleCollapse}
        onKeyDown={handleHeaderKeyDown}
        tabIndex={0}
        role="button"
        aria-expanded={!isCollapsed}
        aria-controls={`section-tasks-${id}`}
      >
        <div className="flex items-center gap-3">
          <span className="text-xl" aria-hidden>
            {icon}
          </span>
          <h2 className="text-sm font-semibold">{title}</h2>
        </div>
        <div>
          {isCollapsed ? (
            <ChevronRight className="text-muted-foreground" />
          ) : (
            <ChevronDown className="text-muted-foreground" />
          )}
        </div>
      </div>
      {!isCollapsed && (
        <div className="p-4 bg-background" id={`section-tasks-${id}`}>
          <p className="text-sm text-muted-foreground mb-4 italic">{description}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              handleAddTask()
            }}
            className="mb-4"
            aria-label="Add Task"
          >
            <Plus size={16} className="mr-2" /> Add Task
          </Button>
          {/* Render the list of filtered top-level tasks */}
          {filteredTopLevelTasks.length > 0 ? (
            <div className="space-y-3">
              {filteredTopLevelTasks.map((task, index) => (
                <TaskItem
                  key={task.id} // Crucial for React's reconciliation
                  task={task}
                  sectionId={id}
                  taskNumber={`${id === "public-section" ? "1" : "2"}.${index + 1}`}
                  level={0} // Top-level tasks are at level 0
                  activeLabelFilters={activeLabelFilters}
                  maxVisibleDepth={maxVisibleDepth} // Use maxVisibleDepth from props
                />
              ))}
            </div>
          ) : (
            // Message shown if no tasks are available or match filters
            <p className="text-sm text-muted-foreground mt-4">
              {activeLabelFilters.length > 0
                ? "No tasks match the current filters in this section."
                : "No tasks in this section. Click 'Add Task' to create one!"}
            </p>
          )}
        </div>
      )}
    </Card>
  )
})
