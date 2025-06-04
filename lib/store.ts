// lib/store.ts
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import type { TaskStore, RawTaskData } from "@/lib/types";
import { throttle } from "lodash-es";
import { toast } from "sonner";

// Import helpers from the new utils file
import {
  convertRawToFullTask,
  updateTaskInTree,
  addSubtaskToParentTree, // Use renamed function
  deleteTaskFromTree,
  addLabelToTaskInTree,
  calculateStats, // Use renamed function
} from "./task-utils"; // Assuming task-utils.ts is in the same directory

export const LOCAL_STORAGE_KEY = "taskProgressTracker_v1";
let autoSavePaused = false;

export const useTaskStore = create<TaskStore>()(
  subscribeWithSelector((set, get) => ({
    tasks: [],
    stats: { completed: 0, total: 0, percentage: 0 },
    activeLabelFilters: [],
    activeStatusFilter: null,
    areAllNotesCollapsed: false,
    isSidebarOpen: true,
    isAddRootTaskDialogOpen: false,
    _isInitializing_internal: false,
    maxVisibleDepth: null,
    visibilityActionTrigger: 0,

    // --- UI Actions ---
    toggleSidebar: () => set({ isSidebarOpen: !get().isSidebarOpen }),
    toggleAllNotes: () => set({ areAllNotesCollapsed: !get().areAllNotesCollapsed }),
    openAddRootTaskDialog: () => set({ isAddRootTaskDialogOpen: true }),
    closeAddRootTaskDialog: () => set({ isAddRootTaskDialogOpen: false }),
    toggleLabelFilter: (label: string) =>
      set((state) => ({
        activeLabelFilters: state.activeLabelFilters.includes(label)
          ? state.activeLabelFilters.filter((l) => l !== label)
          : [...state.activeLabelFilters, label],
      })),
    clearLabelFilters: () => set({ activeLabelFilters: [] }),
    toggleStatusFilter: (filter: "active" | "completed") =>
      set((state) => ({
        activeStatusFilter: state.activeStatusFilter === filter ? null : filter,
      })),
    setMaxVisibleDepth: (depth: number | null) =>
      set((state) => ({
        maxVisibleDepth: depth,
        visibilityActionTrigger: state.visibilityActionTrigger + 1,
      })),

    // --- Task Actions (using imported utils) ---
    addTask: (newTask, parentId) => {
      set((state) => {
        let newTasksTree;
        if (!parentId) {
          newTasksTree = [...state.tasks, newTask];
        } else {
          const result = addSubtaskToParentTree(state.tasks, parentId, newTask);
          newTasksTree = result.subtaskAdded ? result.updatedTasks : state.tasks;
        }
        return { tasks: newTasksTree, stats: calculateStats(newTasksTree) };
      });
    },
    updateTask: (taskId, fieldsToUpdate) => {
      set((state) => {
        const result = updateTaskInTree(state.tasks, taskId, fieldsToUpdate);
        return result.taskModified
          ? { tasks: result.updatedTasks, stats: calculateStats(result.updatedTasks) }
          : {};
      });
    },
    deleteTask: (taskId) => {
      set((state) => {
        const result = deleteTaskFromTree(state.tasks, taskId);
        return result.taskDeleted
          ? { tasks: result.updatedTasks, stats: calculateStats(result.updatedTasks) }
          : {};
      });
    },
    addLabelToTask: (taskId, label) => {
      set((state) => {
        const result = addLabelToTaskInTree(state.tasks, taskId, label);
        return result.labelAdded ? { tasks: result.updatedTasks } : {};
      });
    },

    // --- Persistence and Auto-Save Control ---
    pauseAutoSave: () => { autoSavePaused = true; },
    resumeAutoSave: (triggerImmediateSave = false) => {
      autoSavePaused = false;
      if (triggerImmediateSave) get().saveToLocalStorage();
    },
    loadInitialData: () => {
      set({ _isInitializing_internal: true });
      const savedDataString = localStorage.getItem(LOCAL_STORAGE_KEY);
      let loadedSuccessfully = false;
      if (savedDataString) {
        try {
          const savedData = JSON.parse(savedDataString);
          if (savedData && Array.isArray(savedData.tasks)) {
            const loadedTasks = savedData.tasks.map(convertRawToFullTask);
            set({
              tasks: loadedTasks,
              stats: calculateStats(loadedTasks),
              activeLabelFilters: savedData.activeLabelFilters || [],
              activeStatusFilter: savedData.activeStatusFilter || null,
              isSidebarOpen: typeof savedData.isSidebarOpen === 'boolean' ? savedData.isSidebarOpen : true,
              maxVisibleDepth: savedData.maxVisibleDepth !== undefined ? savedData.maxVisibleDepth : null,
              areAllNotesCollapsed: typeof savedData.areAllNotesCollapsed === 'boolean' ? savedData.areAllNotesCollapsed : false,
              visibilityActionTrigger: typeof savedData.visibilityActionTrigger === 'number' ? savedData.visibilityActionTrigger : 0,
              isAddRootTaskDialogOpen: false,
            });
            loadedSuccessfully = true;
          } else {
            console.warn("localStorage data found but structure is invalid.");
          }
        } catch (e) {
          console.error(`Error parsing localStorage data (key: ${LOCAL_STORAGE_KEY}):`, e);
          localStorage.removeItem(LOCAL_STORAGE_KEY);
        }
      }
      if (!loadedSuccessfully) {
        set({
          tasks: [], // Default to an empty array for tasks
          stats: calculateStats([]), // Calculate stats for empty tasks (will be 0s)
          activeLabelFilters: [],
          activeStatusFilter: null,
          isSidebarOpen: true, // Sensible default for sidebar
          maxVisibleDepth: null,
          areAllNotesCollapsed: false,
          visibilityActionTrigger: 0,
          isAddRootTaskDialogOpen: false,
        });
      }
      set({ _isInitializing_internal: false });
    },
    saveToLocalStorage: () => {
      if (get()._isInitializing_internal || autoSavePaused) return;
      const state = get();
      const dataToSave = {
        tasks: state.tasks,
        activeLabelFilters: state.activeLabelFilters,
        activeStatusFilter: state.activeStatusFilter,
        isSidebarOpen: state.isSidebarOpen,
        maxVisibleDepth: state.maxVisibleDepth,
        areAllNotesCollapsed: state.areAllNotesCollapsed,
        visibilityActionTrigger: state.visibilityActionTrigger,
      };
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave));
        // console.log("State saved to localStorage at", new Date().toLocaleTimeString());
      } catch (e) {
        console.error("Failed to save to localStorage:", e);
        // toast.error("Save Error", { description: "Could not save changes to local storage." });
      }
    },
    dangerouslyOverwriteState: (importedData: any) => {
      if (importedData && Array.isArray(importedData.tasks)) {
        set({ _isInitializing_internal: true });
        const loadedTasks = importedData.tasks.map(convertRawToFullTask);
        set({
          tasks: loadedTasks,
          stats: calculateStats(loadedTasks),
          activeLabelFilters: importedData.activeLabelFilters || [],
          activeStatusFilter: importedData.activeStatusFilter || null,
          isSidebarOpen: typeof importedData.isSidebarOpen === 'boolean' ? importedData.isSidebarOpen : true,
          maxVisibleDepth: importedData.maxVisibleDepth !== undefined ? importedData.maxVisibleDepth : null,
          areAllNotesCollapsed: typeof importedData.areAllNotesCollapsed === 'boolean' ? importedData.areAllNotesCollapsed : false,
          visibilityActionTrigger: typeof importedData.visibilityActionTrigger === 'number' ? importedData.visibilityActionTrigger : 0,
          isAddRootTaskDialogOpen: false,
          _isInitializing_internal: false,
        });
        get().saveToLocalStorage();
      } else {
        console.error("dangerouslyOverwriteState: Invalid data provided.", importedData);
        toast.error("Import Error", { description: "Cannot apply imported data due to invalid structure." });
      }
    },
  }))
);

// --- Auto-save Subscription Logic ---
const AUTO_SAVE_THROTTLE_INTERVAL_MS = 3000;
const performThrottledSave = throttle(() => {
  if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
    useTaskStore.getState().saveToLocalStorage();
  }
}, AUTO_SAVE_THROTTLE_INTERVAL_MS, { leading: false, trailing: true });

useTaskStore.subscribe(
  (state) => {
    if (!state._isInitializing_internal && !autoSavePaused) {
      performThrottledSave();
    }
  }
);

// --- Visibility Change Save Logic ---
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    const storeState = useTaskStore.getState();
    if (storeState._isInitializing_internal || autoSavePaused) return;
    if (document.visibilityState === 'hidden') {
      storeState.saveToLocalStorage();
    }
  });
}