// lib/types.ts

export type StatusFilterState = 'active' | 'completed' | null;

// Core Task type for all task-related data
export interface Task {
  id: string;
  title: string;
  notes: string;
  completed: boolean;
  labels: string[];
  subtasks: Task[];
}

// Project type
export interface Project {
  id: string; // UUID
  name: string;
  createdAt: string; // ISO timestamp
  tasks: Task[]; // Root tasks belonging to this project
}

// Label object type for custom label management (Feature 1.0)
export interface LabelObject {
  id: string;
  name: string;
  emoji?: string;
  color?: string;
}

// Zustand store interface for global state management
export interface TaskStore {
  projects: Project[];
  activeProjectId: string | null;
  editingProjectId: string | null;

  customLabels: LabelObject[];
  isManageLabelsDialogOpen: boolean;

  stats: {
    completed: number;
    total: number;
    percentage: number;
  };
  areAllNotesCollapsed: boolean;
  activeLabelFilters: string[];
  activeStatusFilter: StatusFilterState;
  _isInitializing_internal?: boolean;

  // Project actions
  addProject: (defaultName?: string) => string; // Returns new project ID
  setActiveProject: (projectId: string | null) => void;
  updateProjectName: (projectId: string, newName: string) => void;
  deleteProject: (projectId: string) => void;
  setEditingProjectId: (projectId: string | null) => void;

  // Task actions (will operate on active project)
  addTask: (newTask: Task, parentId?: string | null) => void;
  updateTask: (taskId: string, fieldsToUpdate: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  addLabelToTask: (taskId: string, label: string) => void;

  // State for "Add Task to Project" dialog (triggered from AppHeader)
  isAddTaskDialogOpen: boolean;
  addTaskDialogPayload: { taskNumber?: string } | null; // ADD this line
  openAddTaskDialog: (payload?: { taskNumber?: string }) => void; // MODIFY this line
  closeAddTaskDialog: () => void;

  // --- ADD Label Management Actions ---
  openManageLabelsDialog: () => void;
  closeManageLabelsDialog: () => void;
  addCustomLabel: (labelData: Omit<LabelObject, 'id'>) => LabelObject | void;
  updateCustomLabel: (labelId: string, updates: Partial<Omit<LabelObject, 'id'>>) => void;
  deleteCustomLabel: (labelId: string) => void; // Will also remove from tasks

  // Label filter actions
  toggleLabelFilter: (label: string) => void;
  toggleStatusFilter: (filter: 'active' | 'completed') => void;
  clearLabelFilters: () => void;

  // UI state
  toggleAllNotes: () => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;

  pauseAutoSave: () => void;
  resumeAutoSave: (triggerImmediateSave?: boolean) => void;

  maxVisibleDepth: number | null;
  setMaxVisibleDepth: (depth: number | null) => void;
  visibilityActionTrigger: number;

  // Persistence and Data
  loadInitialData: () => void;
  saveToLocalStorage: () => void;
  dangerouslyOverwriteState: (importedData: { projectName?: string; tasks: RawTaskData[] }) => string | undefined;
}

// RawTaskData is used for initial data loading and import/export
export type RawTaskData = {
  id?: string;
  title: string;
  notes?: string;
  completed?: boolean;
  labels?: string[];
  subtasks?: RawTaskData[];
};