// lib/store.ts
import { create } from "zustand"
import { subscribeWithSelector } from "zustand/middleware"
import type { Task, TaskStore, SectionId, TaskSectionData, RawTaskData, StatusFilterState } from "@/lib/types"
import { initialTasksData } from "@/lib/initial-data"

// --- Helper Functions ---
function convertRawToFullTask(rawData: RawTaskData): Task {
  return {
    id: rawData.id || crypto.randomUUID(),
    title: rawData.title,
    notes: rawData.notes || "",
    completed: typeof rawData.completed === "boolean" ? rawData.completed : false,
    labels: Array.isArray(rawData.labels) ? rawData.labels : [],
    subtasks: Array.isArray(rawData.subtasks) ? rawData.subtasks.map(convertRawToFullTask) : [],
  }
}

// Optimized recursive functions with memoization
const memoizedSetCompletionRecursive = (() => {
  const cache = new Map()
  return function setCompletionRecursive(task: Task, completed: boolean): Task {
    const cacheKey = `${task.id}-${completed}`
    if (cache.has(cacheKey)) return cache.get(cacheKey)

    const result = {
      ...task,
      completed,
      subtasks: (task.subtasks || []).map((subtask) => setCompletionRecursive(subtask, completed)),
    }

    // Limit cache size to prevent memory leaks
    if (cache.size > 1000) {
      const keys = Array.from(cache.keys())
      cache.delete(keys[0]) // Remove oldest entry
    }

    cache.set(cacheKey, result)
    return result
  }
})()

function areAllSubtasksCompleted(task: Task): boolean {
  if (!task.subtasks || task.subtasks.length === 0) return true
  return task.subtasks.every((subtask) => subtask.completed)
}

function updateStats(sections: Record<string, TaskSectionData>) {
  let completed = 0
  let total = 0

  // Optimized counting function that avoids excessive recursion
  const countTasksRecursive = (tasks: Task[]) => {
    const stack = [...tasks]
    while (stack.length > 0) {
      const task = stack.pop()
      if (!task) continue

      total++
      if (task.completed) completed++

      if (task.subtasks && task.subtasks.length > 0) {
        stack.push(...task.subtasks)
      }
    }
  }

  Object.values(sections).forEach((section) => {
    if (section && section.tasks) {
      countTasksRecursive(section.tasks)
    }
  })

  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0
  return { completed, total, percentage }
}

// --- Zustand Store with standard approach ---
export const useTaskStore = create<TaskStore>()(
  subscribeWithSelector((set, get) => ({
    sections: {
      "public-section": {
        title: "Public (Consumer) Endpoints & Frontend Features",
        icon: "🌐",
        description:
          "This section details the functionalities accessible to general users, covering product browsing, cart management, and order viewing.",
        tasks: [],
      },
      "admin-section": {
        title: "Admin Endpoints & Frontend Features",
        icon: "⚙️",
        description:
          "This section covers the functionalities for managing products, categories, and orders by administrators.",
        tasks: [],
      },
    },
    stats: { completed: 0, total: 0, percentage: 0 },
    activeLabelFilters: [],
    activeStatusFilter: null,
    areAllNotesCollapsed: false,
    isSidebarOpen: true,

    // --- UI Actions ---
    toggleSidebar: () =>
      set((state) => ({
        isSidebarOpen: !state.isSidebarOpen,
      })),
    toggleAllNotes: () =>
      set((state) => ({
        areAllNotesCollapsed: !state.areAllNotesCollapsed,
      })),

    // --- Label Filtering ---
    toggleLabelFilter: (label: string) =>
      set((state) => {
        const currentFilters = state.activeLabelFilters
        const newFilters = currentFilters.includes(label)
          ? currentFilters.filter((l) => l !== label)
          : [...currentFilters, label]

        return { activeLabelFilters: newFilters }
      }),
    clearLabelFilters: () => set(() => ({ activeLabelFilters: [] })),

    // ADD Status Filtering action
    toggleStatusFilter: (filter: 'active' | 'completed') =>
      set((state) => ({
        activeStatusFilter: state.activeStatusFilter === filter ? null : filter,
      })),

    maxVisibleDepth: null,
    visibilityActionTrigger: 0,

    setMaxVisibleDepth: (depth: number | null) =>
      set((state) => ({
        maxVisibleDepth: depth,
        visibilityActionTrigger: state.visibilityActionTrigger + 1, // Increment trigger
      })),
    // --- Task/Section Actions ---
    updateTask: (sectionId, taskId, fieldsToUpdate, parentId) => {
      set((state) => {
        if (!state.sections[sectionId]) {
          console.error(`Section ${sectionId} not found in updateTask`)
          return state
        }

        const newSections = { ...state.sections }
        let taskTreeModified = false

        // Optimized update function using a non-recursive approach
        const updateTaskInTree = (tasks: Task[], currentParentId?: string): Task[] => {
          return tasks.map((task) => {
            // Direct match for the task we want to update
            if (task.id === taskId && currentParentId === parentId) {
              taskTreeModified = true

              // Apply updates
              const updatedTask = { ...task, ...fieldsToUpdate }

              // Handle completion status propagation
              if (typeof fieldsToUpdate.completed === "boolean") {
                return memoizedSetCompletionRecursive(updatedTask, fieldsToUpdate.completed)
              }

              return updatedTask
            }

            // Check subtasks if they exist
            if (task.subtasks && task.subtasks.length > 0) {
              const updatedSubtasks = updateTaskInTree(task.subtasks, task.id)

              // Check if we need to update parent completion status
              const allSubsComplete = areAllSubtasksCompleted({ ...task, subtasks: updatedSubtasks })

              return {
                ...task,
                subtasks: updatedSubtasks,
                completed: task.completed !== allSubsComplete ? allSubsComplete : task.completed,
              }
            }

            return task
          })
        }

        newSections[sectionId] = {
          ...newSections[sectionId],
          tasks: updateTaskInTree(newSections[sectionId].tasks),
        }

        // Only update stats if the task tree was modified
        const newStats = taskTreeModified ? updateStats(newSections) : state.stats

        return {
          sections: newSections,
          stats: newStats,
        }
      })
    },

    addTaskToSection: (sectionId, task) => {
      set((state) => {
        if (!state.sections[sectionId]) {
          console.error(`Section ${sectionId} not found in addTaskToSection`)
          return state
        }

        const newSections = {
          ...state.sections,
          [sectionId]: {
            ...state.sections[sectionId],
            tasks: [...state.sections[sectionId].tasks, task],
          },
        }

        return {
          sections: newSections,
          stats: updateStats(newSections),
        }
      })
    },

    addSection: (sectionId, section) => {
      set((state) => {
        const newSections = {
          ...state.sections,
          [sectionId]: section,
        }

        return {
          sections: newSections,
          stats: updateStats(newSections),
        }
      })
    },

    addSubtask: (sectionId, parentTaskId, subtaskData) => {
      set((state) => {
        if (!state.sections[sectionId]) {
          console.error(`Section ${sectionId} not found in addSubtask.`)
          return state
        }

        const newSections = { ...state.sections }

        // Optimized non-recursive approach to find and add subtask
        const findAndAddSubtask = (tasks: Task[]): Task[] => {
          return tasks.map((task) => {
            if (task.id === parentTaskId) {
              return {
                ...task,
                subtasks: [...(task.subtasks || []), subtaskData],
              }
            }

            if (task.subtasks && task.subtasks.length > 0) {
              return {
                ...task,
                subtasks: findAndAddSubtask(task.subtasks),
              }
            }

            return task
          })
        }

        newSections[sectionId] = {
          ...newSections[sectionId],
          tasks: findAndAddSubtask(newSections[sectionId].tasks),
        }

        return {
          sections: newSections,
          stats: updateStats(newSections),
        }
      })
    },

    deleteTask: (sectionId, taskId, parentId) => {
      set((state) => {
        if (!state.sections[sectionId]) {
          console.error(`Section ${sectionId} not found in deleteTask.`)
          return state
        }

        const newSections = { ...state.sections }

        if (!parentId) {
          // Top-level task deletion
          newSections[sectionId] = {
            ...newSections[sectionId],
            tasks: newSections[sectionId].tasks.filter((task) => task.id !== taskId),
          }
        } else {
          // Nested task deletion using iterative approach
          const deleteNestedTask = (tasks: Task[]): Task[] => {
            return tasks.map((task) => {
              if (task.id === parentId) {
                return {
                  ...task,
                  subtasks: (task.subtasks || []).filter((st) => st.id !== taskId),
                }
              }

              if (task.subtasks && task.subtasks.length > 0) {
                return {
                  ...task,
                  subtasks: deleteNestedTask(task.subtasks),
                }
              }

              return task
            })
          }

          newSections[sectionId] = {
            ...newSections[sectionId],
            tasks: deleteNestedTask(newSections[sectionId].tasks),
          }
        }

        return {
          sections: newSections,
          stats: updateStats(newSections),
        }
      })
    },

    addLabelToTask: (sectionId, taskId, label, parentId) => {
      set((state) => {
        if (!state.sections[sectionId]) {
          console.error(`Section ${sectionId} not found in addLabelToTask.`)
          return state
        }

        const newSections = { ...state.sections }

        // Optimized approach to add label to task
        const addLabelToTaskInTree = (tasks: Task[]): Task[] => {
          return tasks.map((task) => {
            if (task.id === taskId && (!parentId || parentId === undefined)) {
              const newLabels = task.labels || []
              if (!newLabels.includes(label)) {
                return {
                  ...task,
                  labels: [...newLabels, label],
                }
              }
              return task
            }

            if (task.id === parentId) {
              return {
                ...task,
                subtasks: (task.subtasks || []).map((subtask) => {
                  if (subtask.id === taskId) {
                    const newLabels = subtask.labels || []
                    if (!newLabels.includes(label)) {
                      return {
                        ...subtask,
                        labels: [...newLabels, label],
                      }
                    }
                  }
                  return subtask
                }),
              }
            }

            if (task.subtasks && task.subtasks.length > 0) {
              return {
                ...task,
                subtasks: addLabelToTaskInTree(task.subtasks),
              }
            }

            return task
          })
        }

        newSections[sectionId] = {
          ...newSections[sectionId],
          tasks: addLabelToTaskInTree(newSections[sectionId].tasks),
        }

        return { sections: newSections }
      })
    },

    loadInitialData: () => {
      const savedData = localStorage.getItem("taskTrackerProgress_v3")
      let dataToLoadProcessed = false

      if (savedData) {
        try {
          const parsedJson = JSON.parse(savedData)
          if (
            parsedJson &&
            typeof parsedJson.sections === "object" &&
            parsedJson.sections !== null &&
            !Array.isArray(parsedJson.sections)
          ) {
            set((state) => {
              const newSections = { ...state.sections }
              const sectionIds = Object.keys(parsedJson.sections) as SectionId[]

              for (const sectionId of sectionIds) {
                const sectionFromStorage = parsedJson.sections[sectionId]

                if (newSections[sectionId] && sectionFromStorage && Array.isArray(sectionFromStorage.tasks)) {
                  newSections[sectionId] = {
                    ...newSections[sectionId],
                    title: sectionFromStorage.title || newSections[sectionId].title,
                    icon: sectionFromStorage.icon || newSections[sectionId].icon,
                    description: sectionFromStorage.description || newSections[sectionId].description,
                    tasks: sectionFromStorage.tasks.map(convertRawToFullTask),
                  }
                }
              }

              return {
                sections: newSections,
                stats: updateStats(newSections),
              }
            })

            dataToLoadProcessed = true
          }
        } catch (e) {
          console.error("Error parsing or processing data from localStorage:", e)
        }
      }

      if (!dataToLoadProcessed) {
        set((state) => {
          const newSections = { ...state.sections }
          const sectionKeys = Object.keys(initialTasksData) as SectionId[]

          for (const sectionKey of sectionKeys) {
            if (newSections[sectionKey]) {
              newSections[sectionKey] = {
                ...newSections[sectionKey],
                tasks: initialTasksData[sectionKey].map(convertRawToFullTask),
              }
            }
          }

          return {
            sections: newSections,
            stats: updateStats(newSections),
          }
        })
      }
    },

    saveToLocalStorage: () => {
      const state = get()
      const sectionsToSave: Record<SectionId, TaskSectionData> = {} as Record<SectionId, TaskSectionData>
        ; (Object.keys(state.sections) as SectionId[]).forEach((sectionId) => {
          sectionsToSave[sectionId] = {
            title: state.sections[sectionId].title,
            icon: state.sections[sectionId].icon,
            description: state.sections[sectionId].description,
            tasks: state.sections[sectionId].tasks,
          }
        })

      localStorage.setItem("taskTrackerProgress_v3", JSON.stringify({ sections: sectionsToSave }))
    },
  })),
)
