// lib/types.ts

// parentId can be extended for more sections in the future
// export type parentId = "public-section" | "admin-section" // Or string for flexibility
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



// Zustand store interface for global state management
export interface TaskStore {
  tasks: Task[];
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
  isAddRootTaskDialogOpen: boolean;
  openAddRootTaskDialog: () => void;
  closeAddRootTaskDialog: () => void;

  maxVisibleDepth: number | null
  setMaxVisibleDepth: (depth: number | null) => void
  visibilityActionTrigger: number

  // Task/section actions
  addTask: (newTask: Task, parentId?: string | null) => void;
  updateTask: (taskId: string, fieldsToUpdate: Partial<Task>, parentId?: string | null) => void;
  deleteTask: (taskId: string, parentId?: string | null) => void;
  addLabelToTask: (taskId: string, label: string, parentId?: string | null) => void;

  loadInitialData: () => void
  saveToLocalStorage: () => void
}

// RawTaskData is used for initial data loading and import/export
export type RawTaskData = {
  id?: string
  title: string
  notes?: string
  completed?: boolean
  labels?: string[]
  subtasks?: RawTaskData[]
}
