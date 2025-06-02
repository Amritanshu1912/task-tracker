// lib/store.ts
import { create } from "zustand"
import { subscribeWithSelector } from "zustand/middleware"
import type { Task, TaskStore, RawTaskData, StatusFilterState } from "@/lib/types"
import { initialTasksData } from "@/lib/initial-data"

// --- Helper Functions ---
// convertRawToFullTask remains the same, it works with recursive RawTaskData
function convertRawToFullTask(rawData: RawTaskData): Task {
  return {
    id: rawData.id || crypto.randomUUID(),
    title: rawData.title,
    notes: rawData.notes || "",
    completed: typeof rawData.completed === "boolean" ? rawData.completed : false,
    labels: Array.isArray(rawData.labels) ? rawData.labels : [],
    subtasks: Array.isArray(rawData.subtasks) ? rawData.subtasks.map(convertRawToFullTask) : [],
  };
}

// memoizedSetCompletionRecursive remains useful for cascading completion
const memoizedSetCompletionRecursive = (() => {
  const cache = new Map();
  return function setCompletionRecursive(task: Task, completed: boolean): Task {
    const cacheKey = `${task.id}-${completed}`;
    if (cache.has(cacheKey)) return cache.get(cacheKey);
    const result = {
      ...task,
      completed,
      subtasks: (task.subtasks || []).map((subtask) => setCompletionRecursive(subtask, completed)),
    };
    if (cache.size > 1000) { const keys = Array.from(cache.keys()); cache.delete(keys[0]); }
    cache.set(cacheKey, result);
    return result;
  };
})();

// areAllSubtasksCompleted remains useful for parent completion updates
function areAllSubtasksCompleted(task: Task): boolean {
  if (!task.subtasks || task.subtasks.length === 0) return true; // No subtasks means "all" are complete for this check
  return task.subtasks.every((subtask) => subtask.completed && areAllSubtasksCompleted(subtask)); // Recursive check
}

// updateStats now works on a single array of root tasks
function updateStats(rootTasks: Task[]) {
  let completed = 0;
  let total = 0;
  const countTasksRecursive = (tasks: Task[]) => {
    for (const task of tasks) {
      total++;
      if (task.completed) completed++;
      if (task.subtasks && task.subtasks.length > 0) {
        countTasksRecursive(task.subtasks);
      }
    }
  };
  countTasksRecursive(rootTasks);
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  return { completed, total, percentage };
}

// --- Recursive Task Manipulation Helpers ---
// These helpers will operate on a task tree (array of tasks)
function findTaskRecursive(tasks: Task[], taskId: string): Task | null {
  for (const task of tasks) {
    if (task.id === taskId) return task;
    if (task.subtasks && task.subtasks.length > 0) {
      const found = findTaskRecursive(task.subtasks, taskId);
      if (found) return found;
    }
  }
  return null;
}

// Helper to update a task anywhere in the tree
function updateTaskInTree(tasks: Task[], taskId: string, fieldsToUpdate: Partial<Task>): { updatedTasks: Task[], taskModified: boolean } {
  let taskModified = false;
  const updatedTasks = tasks.map(task => {
    if (task.id === taskId) {
      taskModified = true;
      let updatedTask = { ...task, ...fieldsToUpdate };
      if (typeof fieldsToUpdate.completed === 'boolean') {
        updatedTask = memoizedSetCompletionRecursive(updatedTask, fieldsToUpdate.completed);
      }
      return updatedTask;
    }
    if (task.subtasks && task.subtasks.length > 0) {
      // Pass taskId and fieldsToUpdate, no specific parentId needed for finding child to update
      const subResult = updateTaskInTree(task.subtasks, taskId, fieldsToUpdate);
      if (subResult.taskModified) {
        taskModified = true;
        let newParentTask = { ...task, subtasks: subResult.updatedTasks };
        if (fieldsToUpdate.completed !== undefined) {
          const allSubsComplete = areAllSubtasksCompleted(newParentTask);
          if (newParentTask.completed !== allSubsComplete) {
            newParentTask.completed = allSubsComplete;
          }
        }
        return newParentTask;
      }
    }
    return task;
  });
  return { updatedTasks, taskModified };
}


// Helper to add a subtask to a specific parent in the tree
function addSubtaskToParent(tasks: Task[], parentTaskId: string, subtask: Task): { updatedTasks: Task[], subtaskAdded: boolean } {
  let subtaskAdded = false;
  const updatedTasks = tasks.map(task => {
    if (task.id === parentTaskId) {
      subtaskAdded = true;
      return { ...task, subtasks: [...(task.subtasks || []), subtask], completed: false }; // Adding a subtask makes parent active
    }
    if (task.subtasks && task.subtasks.length > 0) {
      const subResult = addSubtaskToParent(task.subtasks, parentTaskId, subtask);
      if (subResult.subtaskAdded) {
        subtaskAdded = true;
        return { ...task, subtasks: subResult.updatedTasks, completed: false }; // Also mark this ancestor active
      }
    }
    return task;
  });
  return { updatedTasks, subtaskAdded };
}

// Helper to delete a task from the tree
function deleteTaskFromTree(tasks: Task[], taskId: string): { updatedTasks: Task[], taskDeleted: boolean } {
  let taskDeleted = false;
  const remainingTasks = tasks.filter(task => {
    if (task.id === taskId) {
      taskDeleted = true;
      return false;
    }
    return true;
  }).map(task => {
    if (task.subtasks && task.subtasks.length > 0) {
      // Pass taskId, no specific parentId needed for finding child to delete
      const subResult = deleteTaskFromTree(task.subtasks, taskId);
      if (subResult.taskDeleted) {
        taskDeleted = true;
        let newParentTask = { ...task, subtasks: subResult.updatedTasks };
        newParentTask.completed = areAllSubtasksCompleted(newParentTask);
        return newParentTask;
      }
    }
    return task;
  });
  return { updatedTasks: remainingTasks, taskDeleted };
}


// Helper to add a label to a task
function addLabelToTaskInTree(tasks: Task[], taskId: string, label: string): { updatedTasks: Task[], labelAdded: boolean } {
  let labelAdded = false;
  const updatedTasks = tasks.map(task => {
    if (task.id === taskId) {
      if (!task.labels.includes(label)) {
        labelAdded = true;
        return { ...task, labels: [...task.labels, label] };
      }
      return task;
    }
    if (task.subtasks && task.subtasks.length > 0) {
      // Pass taskId, no specific parentId needed for finding child to label
      const subResult = addLabelToTaskInTree(task.subtasks, taskId, label);
      if (subResult.labelAdded) {
        labelAdded = true;
        return { ...task, subtasks: subResult.updatedTasks };
      }
    }
    return task;
  });
  return { updatedTasks, labelAdded };
}


// --- Zustand Store with standard approach ---
export const useTaskStore = create<TaskStore>()(
  subscribeWithSelector((set, get) => ({
    tasks: [], // Initialize with an empty array of tasks
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
    setMaxVisibleDepth: (depth: number | null) =>
      set((state) => ({
        maxVisibleDepth: depth,
        visibilityActionTrigger: state.visibilityActionTrigger + 1, // Increment trigger
      })),
    visibilityActionTrigger: 0,

    // --- Task/Section Actions ---
    addTask: (newTask, parentId) => {
      set((state) => {
        let newTasksTree;
        if (!parentId) { // Add as a root task
          newTasksTree = [...state.tasks, newTask];
        } else { // Add as a subtask
          const result = addSubtaskToParent(state.tasks, parentId, newTask);
          newTasksTree = result.subtaskAdded ? result.updatedTasks : state.tasks; // Only update if added
        }
        return {
          tasks: newTasksTree,
          stats: updateStats(newTasksTree),
        };
      });
    },

    updateTask: (taskId, fieldsToUpdate) => {
      set((state) => {
        const result = updateTaskInTree(state.tasks, taskId, fieldsToUpdate);
        if (result.taskModified) {
          return {
            tasks: result.updatedTasks,
            stats: updateStats(result.updatedTasks),
          };
        }
        return state;
      });
    },

    deleteTask: (taskId) => { // parentId is for context
      set((state) => {
        const result = deleteTaskFromTree(state.tasks, taskId);
        if (result.taskDeleted) {
          return {
            tasks: result.updatedTasks,
            stats: updateStats(result.updatedTasks),
          };
        }
        return state;
      });
    },

    addLabelToTask: (taskId, label) => { // parentId for context
      set((state) => {
        const result = addLabelToTaskInTree(state.tasks, taskId, label);
        if (result.labelAdded) {
          return { tasks: result.updatedTasks }; // Stats don't change for adding a label
        }
        return state;
      });
    },

    loadInitialData: () => {
      const savedDataString = localStorage.getItem("taskTrackerProgress_v3");
      if (savedDataString) {
        try {
          const savedData = JSON.parse(savedDataString);
          // Expecting savedData to have a 'tasks' array and potentially UI preferences
          if (savedData && Array.isArray(savedData.tasks)) {
            const loadedTasks = savedData.tasks.map(convertRawToFullTask);
            set({
              tasks: loadedTasks,
              stats: updateStats(loadedTasks),
              activeLabelFilters: Array.isArray(savedData.activeLabelFilters) ? savedData.activeLabelFilters : [],
              activeStatusFilter: ['active', 'completed', null].includes(savedData.activeStatusFilter) ? savedData.activeStatusFilter : null,
              isSidebarOpen: typeof savedData.isSidebarOpen === 'boolean' ? savedData.isSidebarOpen : true,
              maxVisibleDepth: typeof savedData.maxVisibleDepth === 'number' || savedData.maxVisibleDepth === null ? savedData.maxVisibleDepth : null,
              areAllNotesCollapsed: typeof savedData.areAllNotesCollapsed === 'boolean' ? savedData.areAllNotesCollapsed : false,
            });
            return; // Loaded from localStorage
          }
        } catch (e) {
          console.error("Error parsing data from localStorage:", e);
          localStorage.removeItem("taskTrackerProgress_v3"); // Clear corrupted data
        }
      }
      // Fallback to initialTasksData if no valid localStorage data
      const tasksFromInitial = initialTasksData.map(convertRawToFullTask);
      set({
        tasks: tasksFromInitial,
        stats: updateStats(tasksFromInitial),
        // Set default UI preferences as well
        activeLabelFilters: [],
        activeStatusFilter: null,
        isSidebarOpen: true,
        maxVisibleDepth: null,
        areAllNotesCollapsed: false,
      });
    },

    saveToLocalStorage: () => {
      const state = get();
      const dataToSave = {
        tasks: state.tasks, // Save the full task objects
        activeLabelFilters: state.activeLabelFilters,
        activeStatusFilter: state.activeStatusFilter,
        isSidebarOpen: state.isSidebarOpen,
        maxVisibleDepth: state.maxVisibleDepth,
        areAllNotesCollapsed: state.areAllNotesCollapsed,
      };
      localStorage.setItem("taskTrackerProgress_v3", JSON.stringify(dataToSave));
    },
  })),
)
