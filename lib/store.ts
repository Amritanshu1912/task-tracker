// lib/store.ts
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import type { TaskStore, Project, Task, RawTaskData, LabelObject } from "@/lib/types";
import { throttle } from "lodash-es";
import { toast } from "sonner";

import {
  convertRawToFullTask,
  updateTaskInTree,
  addSubtaskToParentTree,
  deleteTaskFromTree,
  addLabelToTaskInTree,
  calculateStats,
} from "./task-utils";

export const LOCAL_STORAGE_KEY = "taskTrackerProjects_v2"; // Updated key for new structure
let autoSavePaused = false;

const getNextDefaultProjectName = (existingProjects: Project[]): string => {
  const baseName = "Untitled Project";
  let counter = 1;
  let nextName = `${baseName} ${counter}`;
  // eslint-disable-next-line no-loop-func
  while (existingProjects.some(p => p.name === nextName)) {
    counter++;
    nextName = `${baseName} ${counter}`;
  }
  return nextName;
};

// Helper function to recursively remove a label from a task and its subtasks
const removeLabelFromTasksRecursive = (tasks: Task[], labelNameToRemove: string): Task[] => {
  return tasks.map(task => {
    // Filter by label NAME since tasks currently store label names
    const newLabels = task.labels.filter(labelName => labelName !== labelNameToRemove);
    return {
      ...task,
      labels: newLabels,
      subtasks: task.subtasks ? removeLabelFromTasksRecursive(task.subtasks, labelNameToRemove) : [],
    };
  });
};

export const useTaskStore = create<TaskStore>()(
  subscribeWithSelector((set, get) => ({
    projects: [],
    activeProjectId: null,
    editingProjectId: null,
    customLabels: [],
    isManageLabelsDialogOpen: false,
    stats: { completed: 0, total: 0, percentage: 0 },
    activeLabelFilters: [],
    activeStatusFilter: null,
    areAllNotesCollapsed: false,
    isSidebarOpen: true,
    _isInitializing_internal: false,
    maxVisibleDepth: null,
    visibilityActionTrigger: 0,
    // --- ADD THIS LINE ---
    isAddTaskDialogOpen: false,


    // --- Project Actions ---
    addProject: (defaultName?: string) => {
      const newProject: Project = {
        id: crypto.randomUUID(),
        name: defaultName || getNextDefaultProjectName(get().projects),
        createdAt: new Date().toISOString(),
        tasks: [],
      };
      set((state) => ({
        projects: [...state.projects, newProject],
        activeProjectId: newProject.id,
        editingProjectId: newProject.id,
        stats: calculateStats([]),
      }));
      return newProject.id;
    },
    setActiveProject: (projectId: string | null) => {
      const currentProjects = get().projects;
      const targetProject = currentProjects.find(p => p.id === projectId);
      set({
        activeProjectId: projectId,
        stats: targetProject ? calculateStats(targetProject.tasks) : { completed: 0, total: 0, percentage: 0 },
        editingProjectId: null,
      });
    },
    updateProjectName: (projectId: string, newName: string) => {
      set((state) => ({
        projects: state.projects.map((p) =>
          p.id === projectId ? { ...p, name: newName.trim() || "Untitled Project" } : p
        ),
        editingProjectId: state.editingProjectId === projectId ? null : state.editingProjectId,
      }));
    },
    deleteProject: (projectId: string) => {
      set((state) => {
        const remainingProjects = state.projects.filter((p) => p.id !== projectId);
        let newActiveProjectId: string | null = null;
        if (state.activeProjectId === projectId) {
          newActiveProjectId = remainingProjects.length > 0 ? remainingProjects[0].id : null;
        } else {
          newActiveProjectId = state.activeProjectId;
        }
        const newActiveProject = remainingProjects.find(p => p.id === newActiveProjectId);
        return {
          projects: remainingProjects,
          activeProjectId: newActiveProjectId,
          stats: newActiveProject ? calculateStats(newActiveProject.tasks) : { completed: 0, total: 0, percentage: 0 },
          editingProjectId: state.editingProjectId === projectId ? null : state.editingProjectId,
        };
      });
    },
    setEditingProjectId: (projectId: string | null) => {
      set({ editingProjectId: projectId });
    },

    // --- Task Actions (scoped to activeProject) ---
    addTask: (newTaskData, parentId) => {
      const activeId = get().activeProjectId;
      if (!activeId) {
        toast.error("No active project", { description: "Cannot add task." });
        return;
      }
      set((state) => {
        const projectIndex = state.projects.findIndex(p => p.id === activeId);
        if (projectIndex === -1) return {};

        const activeProject = state.projects[projectIndex];
        let updatedTasks;

        if (!parentId) {
          updatedTasks = [...activeProject.tasks, newTaskData];
        } else {
          const result = addSubtaskToParentTree(activeProject.tasks, parentId, newTaskData);
          updatedTasks = result.subtaskAdded ? result.updatedTasks : activeProject.tasks;
        }

        const updatedProject = { ...activeProject, tasks: updatedTasks };
        const newProjects = [...state.projects];
        newProjects[projectIndex] = updatedProject;

        return {
          projects: newProjects,
          stats: calculateStats(updatedProject.tasks),
        };
      });
    },
    updateTask: (taskId, fieldsToUpdate) => {
      const activeId = get().activeProjectId;
      if (!activeId) return;

      set((state) => {
        const projectIndex = state.projects.findIndex(p => p.id === activeId);
        if (projectIndex === -1) return {};

        const activeProject = state.projects[projectIndex];
        const result = updateTaskInTree(activeProject.tasks, taskId, fieldsToUpdate);

        if (result.taskModified) {
          const updatedProject = { ...activeProject, tasks: result.updatedTasks };
          const newProjects = [...state.projects];
          newProjects[projectIndex] = updatedProject;
          return {
            projects: newProjects,
            stats: calculateStats(updatedProject.tasks),
          };
        }
        return {};
      });
    },
    deleteTask: (taskId) => {
      const activeId = get().activeProjectId;
      if (!activeId) return;

      set((state) => {
        const projectIndex = state.projects.findIndex(p => p.id === activeId);
        if (projectIndex === -1) return {};

        const activeProject = state.projects[projectIndex];
        const result = deleteTaskFromTree(activeProject.tasks, taskId);

        if (result.taskDeleted) {
          const updatedProject = { ...activeProject, tasks: result.updatedTasks };
          const newProjects = [...state.projects];
          newProjects[projectIndex] = updatedProject;
          return {
            projects: newProjects,
            stats: calculateStats(updatedProject.tasks),
          };
        }
        return {};
      });
    },
    addLabelToTask: (taskId, label) => {
      const activeId = get().activeProjectId;
      if (!activeId) return;

      set((state) => {
        const projectIndex = state.projects.findIndex(p => p.id === activeId);
        if (projectIndex === -1) return {};

        const activeProject = state.projects[projectIndex];
        const result = addLabelToTaskInTree(activeProject.tasks, taskId, label);

        if (result.labelAdded) {
          const updatedProject = { ...activeProject, tasks: result.updatedTasks };
          const newProjects = [...state.projects];
          newProjects[projectIndex] = updatedProject;
          return { projects: newProjects };
        }
        return {};
      });
    },

    // Actions for "Add Task to Project" Dialog
    openAddTaskDialog: () => {
      if (!get().activeProjectId) {
        toast.error("No active project", { description: "Select or create a project first to add tasks." });
        return;
      }
      set({ isAddTaskDialogOpen: true });
    },
    closeAddTaskDialog: () => set({ isAddTaskDialogOpen: false }),

    // --- ADD Label Management Actions ---
    openManageLabelsDialog: () => set({ isManageLabelsDialogOpen: true }),
    closeManageLabelsDialog: () => set({ isManageLabelsDialogOpen: false }),
    addCustomLabel: (labelData) => {
      const { name } = labelData;
      if (get().customLabels.some(label => label.name.toLowerCase() === name.toLowerCase())) {
        toast.error("Label already exists", { description: `A label named "${name}" already exists (case-insensitive).` });
        return;
      }
      const newLabel: LabelObject = {
        id: crypto.randomUUID(),
        ...labelData,
      };
      set((state) => ({
        customLabels: [...state.customLabels, newLabel],
      }));
      toast.success("Label added", { description: `Label "${newLabel.name}" created.` });
    },
    updateCustomLabel: (labelId, updates) => {
      // Check for name uniqueness if name is being updated
      if (updates.name) {
        const existingLabelWithNewName = get().customLabels.find(
          label => label.id !== labelId && label.name.toLowerCase() === updates.name!.toLowerCase()
        );
        if (existingLabelWithNewName) {
          toast.error("Label name exists", { description: `Another label named "${updates.name}" already exists.` });
          return;
        }
      }
      set((state) => ({
        customLabels: state.customLabels.map((label) =>
          label.id === labelId ? { ...label, ...updates } : label
        ),
      }));
      // Note: If label *name* changes, and tasks store names, you'd need to update tasks too.
      // For now, assuming tasks store label IDs or names that are consistent.
      // If tasks store LabelObject.id, then tasks don't need updating here for name/color/emoji change.
    },
    deleteCustomLabel: (labelIdToDelete) => {
      const labelToRemove = get().customLabels.find(l => l.id === labelIdToDelete);
      if (!labelToRemove) return;

      const labelNameToRemoveOnTasks = labelToRemove.name;

      set((state) => ({
        customLabels: state.customLabels.filter((label) => label.id !== labelIdToDelete),
        // Remove this label from all tasks in all projects
        projects: state.projects.map(project => ({
          ...project,
          tasks: removeLabelFromTasksRecursive(project.tasks, labelNameToRemoveOnTasks), // Or labelToRemove.name if tasks store names
        })),
        // Also update activeLabelFilters if it contained the deleted label
        activeLabelFilters: state.activeLabelFilters.filter(activeFilter => activeFilter !== labelNameToRemoveOnTasks), // Or labelToRemove.name
      }));
      toast.info("Label deleted", { description: `Label "${labelNameToRemoveOnTasks}" and its associations removed.` });
    },

    // --- UI Actions ---
    toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
    toggleAllNotes: () => set((state) => ({ areAllNotesCollapsed: !state.areAllNotesCollapsed })),
    setMaxVisibleDepth: (depth: number | null) =>
      set((state) => ({
        maxVisibleDepth: depth,
        visibilityActionTrigger: state.visibilityActionTrigger + 1,
      })),

    // --- Filter Actions ---
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
          if (savedData && Array.isArray(savedData.projects)) {
            const loadedProjects: Project[] = savedData.projects.map((proj: any) => ({
              id: proj.id || crypto.randomUUID(),
              name: proj.name || "Untitled Project",
              createdAt: proj.createdAt || new Date().toISOString(),
              tasks: Array.isArray(proj.tasks) ? proj.tasks.map(convertRawToFullTask) : [],
            }));

            let activeProjId = savedData.activeProjectId || null;
            if (activeProjId && !loadedProjects.some(p => p.id === activeProjId)) {
              activeProjId = loadedProjects.length > 0 ? loadedProjects[0].id : null;
            } else if (!activeProjId && loadedProjects.length > 0) {
              activeProjId = loadedProjects[0].id;
            }

            const activeProjectForStats = loadedProjects.find(p => p.id === activeProjId);

            set({
              projects: loadedProjects,
              activeProjectId: activeProjId,
              customLabels: Array.isArray(savedData.customLabels) ? savedData.customLabels : [],
              isManageLabelsDialogOpen: false, // Always start closed
              stats: activeProjectForStats ? calculateStats(activeProjectForStats.tasks) : { completed: 0, total: 0, percentage: 0 },
              activeLabelFilters: savedData.activeLabelFilters || [],
              activeStatusFilter: savedData.activeStatusFilter || null,
              isSidebarOpen: typeof savedData.isSidebarOpen === 'boolean' ? savedData.isSidebarOpen : true,
              maxVisibleDepth: savedData.maxVisibleDepth !== undefined ? savedData.maxVisibleDepth : null,
              areAllNotesCollapsed: typeof savedData.areAllNotesCollapsed === 'boolean' ? savedData.areAllNotesCollapsed : false,
              visibilityActionTrigger: typeof savedData.visibilityActionTrigger === 'number' ? savedData.visibilityActionTrigger : 0,
              editingProjectId: null,
              isAddTaskDialogOpen: false, // Initialize dialog state
            });
            loadedSuccessfully = true;
          } else {
            console.warn("localStorage data (v2) found but structure is invalid.");
          }
        } catch (e) {
          console.error(`Error parsing localStorage data (key: ${LOCAL_STORAGE_KEY}):`, e);
          localStorage.removeItem(LOCAL_STORAGE_KEY);
        }
      }

      if (!loadedSuccessfully) {
        set({
          projects: [],
          activeProjectId: null,
          customLabels: [],
          isManageLabelsDialogOpen: false,
          stats: { completed: 0, total: 0, percentage: 0 },
          activeLabelFilters: [],
          activeStatusFilter: null,
          isSidebarOpen: true,
          maxVisibleDepth: null,
          areAllNotesCollapsed: false,
          visibilityActionTrigger: 0,
          editingProjectId: null,
          isAddTaskDialogOpen: false, // Initialize dialog state
        });
      }
      set({ _isInitializing_internal: false });
    },
    saveToLocalStorage: () => {
      if (get()._isInitializing_internal || autoSavePaused) return;
      const state = get();
      const dataToSave = {
        projects: state.projects,
        activeProjectId: state.activeProjectId,
        customLabels: state.customLabels,
        activeLabelFilters: state.activeLabelFilters,
        activeStatusFilter: state.activeStatusFilter,
        isSidebarOpen: state.isSidebarOpen,
        maxVisibleDepth: state.maxVisibleDepth,
        areAllNotesCollapsed: state.areAllNotesCollapsed,
        visibilityActionTrigger: state.visibilityActionTrigger,
      };
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave));
      } catch (e) {
        console.error("Failed to save to localStorage:", e);
      }
    },
    dangerouslyOverwriteState: (importedData: { projectName?: string; tasks: RawTaskData[] }) => {
      if (importedData && Array.isArray(importedData.tasks)) {
        set({ _isInitializing_internal: true });
        const newProjectName = importedData.projectName || getNextDefaultProjectName(get().projects);
        const newProject: Project = {
          id: crypto.randomUUID(),
          name: newProjectName,
          createdAt: new Date().toISOString(),
          tasks: importedData.tasks.map(convertRawToFullTask),
        };

        set((state) => ({
          projects: [...state.projects, newProject],
          _isInitializing_internal: false,
        }));
        toast.success("Project Imported", { description: `Project "${newProject.name}" has been added.` });
      } else {
        console.error("dangerouslyOverwriteState (import project): Invalid data provided.", importedData);
        toast.error("Import Error", { description: "Cannot import project due to invalid data structure." });
      }
    },
  }))
);

// Auto-save and visibility change logic remains the same
const AUTO_SAVE_THROTTLE_INTERVAL_MS = 3000;
const performThrottledSave = throttle(() => {
  if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
    useTaskStore.getState().saveToLocalStorage();
  }
}, AUTO_SAVE_THROTTLE_INTERVAL_MS, { leading: false, trailing: true });

useTaskStore.subscribe(
  (state, prevState) => {
    if (!state._isInitializing_internal && !autoSavePaused) {
      if (
        state.projects !== prevState.projects ||
        state.activeProjectId !== prevState.activeProjectId ||
        state.activeLabelFilters !== prevState.activeLabelFilters ||
        state.activeStatusFilter !== prevState.activeStatusFilter ||
        state.isSidebarOpen !== prevState.isSidebarOpen ||
        state.maxVisibleDepth !== prevState.maxVisibleDepth ||
        state.areAllNotesCollapsed !== prevState.areAllNotesCollapsed
      ) {
        performThrottledSave();
      }
    }
  }
);

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    const storeState = useTaskStore.getState();
    if (storeState._isInitializing_internal || autoSavePaused) return;
    if (document.visibilityState === 'hidden') {
      performThrottledSave.cancel();
      storeState.saveToLocalStorage();
    }
  });
}