// lib/types.ts

// SectionId can be extended for more sections in the future
export type SectionId = "public-section" | "admin-section" // Or string for flexibility
export type StatusFilterState = 'active' | 'completed' | null;

// Core Task type for all task-related data
export interface Task {
  id: string
  title: string
  notes: string
  completed: boolean
  labels: string[]
  subtasks: Task[]
}

// Data structure for a section of tasks
export interface TaskSectionData {
  title: string
  icon: string
  description: string
  tasks: Task[]
}

// Zustand store interface for global state management
export interface TaskStore {
  sections: Record<string, TaskSectionData> // SectionId as string for flexibility
  stats: {
    completed: number
    total: number
    percentage: number
  }
  areAllNotesCollapsed: boolean
  activeLabelFilters: string[]
  activeStatusFilter: StatusFilterState;

  // Label filter actions
  toggleLabelFilter: (label: string) => void
  toggleStatusFilter: (filter: 'active' | 'completed') => void;
  clearLabelFilters: () => void

  // UI state
  toggleAllNotes: () => void
  isSidebarOpen: boolean
  toggleSidebar: () => void

  maxVisibleDepth: number | null
  setMaxVisibleDepth: (depth: number | null) => void

  // Task/section actions
  updateTask: (sectionId: string, taskId: string, fieldsToUpdate: Partial<Task>, parentId?: string) => void
  addTaskToSection: (sectionId: string, task: Task) => void
  addSection: (sectionId: string, section: TaskSectionData) => void
  addSubtask: (sectionId: string, parentTaskId: string, subtask: Task) => void
  deleteTask: (sectionId: string, taskId: string, parentId?: string) => void
  addLabelToTask: (sectionId: string, taskId: string, label: string, parentId?: string) => void
  loadInitialData: () => void
  saveToLocalStorage: () => void
}

// RawTaskData is used for initial data loading and import/export
export type RawTaskData = {
  title: string
  notes?: string
  completed?: boolean
  labels?: string[]
  subtasks?: RawTaskData[]
  id?: string
}
