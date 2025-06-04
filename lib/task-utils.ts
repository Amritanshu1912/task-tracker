// lib/task-utils.ts
import type { Task, RawTaskData, TaskStore } from "@/lib/types"; // Assuming TaskStore['stats'] is the return type for updateStats

// --- Helper Functions for Task Data Structure ---
export function convertRawToFullTask(rawData: RawTaskData): Task {
    return {
        id: rawData.id || crypto.randomUUID(),
        title: rawData.title,
        notes: rawData.notes || "",
        completed:
            typeof rawData.completed === "boolean" ? rawData.completed : false,
        labels: Array.isArray(rawData.labels) ? rawData.labels : [],
        subtasks: Array.isArray(rawData.subtasks)
            ? rawData.subtasks.map(convertRawToFullTask)
            : [],
    };
}

const memoizedSetCompletionRecursive = (() => {
    const cache = new Map<string, Task>(); // Typed cache
    return function setCompletionRecursive(task: Task, completed: boolean): Task {
        const cacheKey = `${task.id}-${completed}`;
        if (cache.has(cacheKey)) return cache.get(cacheKey)!;
        const result = {
            ...task,
            completed,
            subtasks: (task.subtasks || []).map((subtask) =>
                setCompletionRecursive(subtask, completed)
            ),
        };
        if (cache.size > 1000) {
            const keys = Array.from(cache.keys());
            cache.delete(keys[0]);
        }
        cache.set(cacheKey, result);
        return result;
    };
})();

export function areAllSubtasksCompleted(task: Task): boolean {
    if (!task.subtasks || task.subtasks.length === 0) return true;
    return task.subtasks.every(
        (subtask) => subtask.completed && areAllSubtasksCompleted(subtask)
    );
}

// --- Recursive Task Tree Manipulators ---
export function updateTaskInTree(
    tasks: Task[],
    taskId: string,
    fieldsToUpdate: Partial<Task>
): { updatedTasks: Task[]; taskModified: boolean } {
    let taskModified = false;
    const updatedTasks = tasks.map((task) => {
        if (task.id === taskId) {
            taskModified = true;
            let updatedTask = { ...task, ...fieldsToUpdate };
            if (typeof fieldsToUpdate.completed === "boolean") {
                updatedTask = memoizedSetCompletionRecursive(
                    updatedTask,
                    fieldsToUpdate.completed
                );
            }
            return updatedTask;
        }
        if (task.subtasks && task.subtasks.length > 0) {
            const subResult = updateTaskInTree(task.subtasks, taskId, fieldsToUpdate);
            if (subResult.taskModified) {
                taskModified = true;
                let newParentTask = { ...task, subtasks: subResult.updatedTasks };
                // Only update parent's completion if a subtask's completion status might have changed it
                if (fieldsToUpdate.completed !== undefined || subResult.taskModified) { // Broader check
                    const allSubsComplete = areAllSubtasksCompleted(newParentTask);
                    if (newParentTask.completed !== allSubsComplete && !fieldsToUpdate.completed) { // Only auto-complete parent if not explicitly setting parent
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

export function addSubtaskToParentTree( // Renamed for clarity
    tasks: Task[],
    parentTaskId: string,
    subtask: Task
): { updatedTasks: Task[]; subtaskAdded: boolean } {
    let subtaskAdded = false;
    const updatedTasks = tasks.map((task) => {
        if (task.id === parentTaskId) {
            subtaskAdded = true;
            return {
                ...task,
                subtasks: [...(task.subtasks || []), subtask],
                completed: false, // Adding a subtask makes parent active
            };
        }
        if (task.subtasks && task.subtasks.length > 0) {
            const subResult = addSubtaskToParentTree( // Use renamed function
                task.subtasks,
                parentTaskId,
                subtask
            );
            if (subResult.subtaskAdded) {
                subtaskAdded = true;
                // Ensure parent is marked active if a subtask is added
                return { ...task, subtasks: subResult.updatedTasks, completed: false };
            }
        }
        return task;
    });
    return { updatedTasks, subtaskAdded };
}

export function deleteTaskFromTree(
    tasks: Task[],
    taskId: string
): { updatedTasks: Task[]; taskDeleted: boolean } {
    let taskDeleted = false;
    const remainingTasks = tasks
        .filter((task) => {
            if (task.id === taskId) {
                taskDeleted = true;
                return false;
            }
            return true;
        })
        .map((task) => {
            if (task.subtasks && task.subtasks.length > 0) {
                const subResult = deleteTaskFromTree(task.subtasks, taskId);
                if (subResult.taskDeleted) {
                    taskDeleted = true;
                    let newParentTask = { ...task, subtasks: subResult.updatedTasks };
                    // Re-evaluate parent's completed status if a child affecting it was deleted
                    if (newParentTask.subtasks.length > 0) {
                        newParentTask.completed = areAllSubtasksCompleted(newParentTask);
                    } else {
                        // If no subtasks left, parent's completion is its own explicit status
                        // (it might have been completed because all children were, and now there are no children)
                        // This might need a re-think: if all children are deleted, should parent become active or retain its status?
                        // For now, let's assume if all children making it complete are gone, it might revert based on its own previous state or become active.
                        // A simpler approach: just check areAllSubtasksCompleted. If it has no subtasks, it returns true.
                        // If it was previously false, it should remain false unless explicitly changed.
                        // Let's keep it simple: update based on remaining children.
                        newParentTask.completed = newParentTask.subtasks.length === 0 ? task.completed : areAllSubtasksCompleted(newParentTask);
                    }
                    return newParentTask;
                }
            }
            return task;
        });
    return { updatedTasks: remainingTasks, taskDeleted };
}

export function addLabelToTaskInTree(
    tasks: Task[],
    taskId: string,
    label: string
): { updatedTasks: Task[]; labelAdded: boolean } {
    let labelAdded = false;
    const updatedTasks = tasks.map((task) => {
        if (task.id === taskId) {
            if (!task.labels.includes(label)) {
                labelAdded = true;
                return { ...task, labels: [...task.labels, label] };
            }
            return task;
        }
        if (task.subtasks && task.subtasks.length > 0) {
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

// --- Stats Calculation ---
export function calculateStats(rootTasks: Task[]): TaskStore['stats'] { // Renamed for clarity
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