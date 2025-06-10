// components/sidebar/sidebar-project-list.tsx

"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useTaskStore } from "@/lib/store";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Edit3, Trash2, Download } from "lucide-react";
import { toast } from "sonner";
import { exportToJson, cn } from "@/lib/utils";
import type { Project, TaskStore as TaskStoreType } from "@/lib/types";

interface SidebarProjectListProps {
  isSidebarOpen: boolean;
}

export function SidebarProjectList({ isSidebarOpen }: SidebarProjectListProps) {
  const projects = useTaskStore((state) => state.projects);

  // When sidebar is collapsed, list is hidden
  if (!isSidebarOpen) return null;

  if (projects.length === 0) {
    return (
      <p className="px-3 py-2 text-xs text-muted-foreground italic">
        No projects yet. Click '+' to add one.
      </p>
    );
  }

  return (
    <ScrollArea
      className={cn("flex-1", isSidebarOpen && "h-[calc(100%-2.5rem)]")}
    >
      <div className="space-y-1 py-1 px-1">
        {projects.map((project) => (
          <SidebarProjectItem key={project.id} project={project} />
        ))}
      </div>
    </ScrollArea>
  );
}

interface SidebarProjectItemProps {
  project: Project;
}

function SidebarProjectItem({ project }: SidebarProjectItemProps) {
  const activeProjectId = useTaskStore(
    (state: TaskStoreType) => state.activeProjectId
  );
  const editingProjectId = useTaskStore(
    (state: TaskStoreType) => state.editingProjectId
  );
  const setActiveProject = useTaskStore(
    (state: TaskStoreType) => state.setActiveProject
  );
  const updateProjectName = useTaskStore(
    (state: TaskStoreType) => state.updateProjectName
  );
  const deleteProject = useTaskStore(
    (state: TaskStoreType) => state.deleteProject
  );
  const setEditingProjectId = useTaskStore(
    (state: TaskStoreType) => state.setEditingProjectId
  );

  const isActive = project.id === activeProjectId;
  const isEditing = project.id === editingProjectId;

  const [currentName, setCurrentName] = useState(project.name);
  const inputRef = useRef<HTMLInputElement>(null);
  // triggerRef is not used in the provided snippet, can be removed if not needed elsewhere
  // const triggerRef = useRef<HTMLDivElement>(null);
  const isEditingFromContextMenuRef = useRef(false);
  const contextMenuOpenRef = useRef(false);

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  useEffect(() => {
    if (!isEditing || project.id !== editingProjectId) {
      setCurrentName(project.name);
      isEditingFromContextMenuRef.current = false;
    }
  }, [project.name, isEditing, editingProjectId, project.id]);

  useEffect(() => {
    if (isEditing && project.id === editingProjectId) {
      setCurrentName(project.name);

      const focusInput = () => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      };

      if (isEditingFromContextMenuRef.current) {
        const timeouts: NodeJS.Timeout[] = [];
        [10, 50, 100, 200].forEach((delay) => {
          // Keep your multi-attempt focus
          timeouts.push(setTimeout(focusInput, delay));
        });
        const rafId = requestAnimationFrame(() => {
          setTimeout(focusInput, 0);
        });
        return () => {
          timeouts.forEach(clearTimeout);
          cancelAnimationFrame(rafId);
        };
      } else {
        const timer = setTimeout(focusInput, 0);
        return () => clearTimeout(timer);
      }
    }
  }, [isEditing, editingProjectId, project.id, project.name]);

  const commitName = useCallback(() => {
    if (!isEditing) return;
    const trimmedName = currentName.trim();
    if (trimmedName === "") {
      toast.error("Project name cannot be empty.");
      setCurrentName(project.name);
    } else if (trimmedName !== project.name) {
      updateProjectName(project.id, trimmedName);
    }
    setEditingProjectId(null);
    isEditingFromContextMenuRef.current = false;
  }, [
    currentName,
    project.name,
    project.id,
    updateProjectName,
    setEditingProjectId,
    isEditing,
  ]);

  const cancelEdit = useCallback(() => {
    setCurrentName(project.name);
    setEditingProjectId(null);
    isEditingFromContextMenuRef.current = false;
  }, [project.name, setEditingProjectId]);

  const handleInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        commitName();
      } else if (e.key === "Escape") {
        e.preventDefault();
        cancelEdit();
      }
    },
    [commitName, cancelEdit]
  );

  const handleInputBlur = useCallback(
    // (e: React.FocusEvent<HTMLInputElement>) => { // e is not used
    () => {
      // Removed unused 'e' parameter
      if (contextMenuOpenRef.current) {
        return;
      }
      if (isEditingFromContextMenuRef.current) {
        setTimeout(() => {
          if (useTaskStore.getState().editingProjectId === project.id) {
            if (document.activeElement !== inputRef.current) {
              commitName();
            }
          }
        }, 100);
      } else {
        if (useTaskStore.getState().editingProjectId === project.id) {
          commitName();
        }
      }
    },
    [commitName, project.id] // Removed e from dependencies
  );

  const startRename = useCallback(
    (fromContextMenu: boolean = true) => {
      // Added optional flag
      isEditingFromContextMenuRef.current = fromContextMenu;
      setEditingProjectId(project.id);
    },
    [project.id, setEditingProjectId]
  );

  const handleContextMenuOpenChange = useCallback(
    (open: boolean) => {
      contextMenuOpenRef.current = open;
      if (!open && isEditingFromContextMenuRef.current && isEditing) {
        // Check isEditing also
        setTimeout(() => {
          if (
            inputRef.current &&
            useTaskStore.getState().editingProjectId === project.id
          ) {
            // Double check editing state
            inputRef.current.focus();
            inputRef.current.select();
          }
        }, 50);
      }
    },
    [isEditing, project.id] // Added project.id to dependencies
  );

  const handleItemKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "F2" && !isEditing) {
        e.preventDefault();
        startRename(false); // Indicate F2 trigger
      }
    },
    [isEditing, startRename] // Use startRename from useCallback
  );

  const handleItemDoubleClick = useCallback(() => {
    if (!isEditing) {
      startRename(false); // Indicate double-click trigger
    }
  }, [isEditing, startRename]); // Use startRename from useCallback

  const handleItemClick = useCallback(() => {
    if (!isEditing) {
      setActiveProject(project.id);
    }
  }, [isEditing, project.id, setActiveProject]);

  const handleDeleteInitiate = useCallback((project: Project) => {
    setProjectToDelete(project);
    setIsDeleteConfirmOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (projectToDelete) {
      deleteProject(projectToDelete.id); // Zustand store action
      toast.success(`Deleted project "${projectToDelete.name}"`);
      setProjectToDelete(null);
    }
  }, [projectToDelete, deleteProject]);

  const handleExport = useCallback(() => {
    const projectToExport = useTaskStore
      .getState()
      .projects.find((p) => p.id === project.id);
    if (projectToExport) {
      exportToJson({
        projectName: projectToExport.name,
        tasks: projectToExport.tasks,
      });
      toast.info(`Exporting "${projectToExport.name}"...`);
    }
  }, [project.id]);

  return (
    <>
      <ContextMenu onOpenChange={handleContextMenuOpenChange}>
        <ContextMenuTrigger disabled={isEditing} asChild>
          <div
            className={cn(
              "flex items-center w-full h-9 px-3 gap-3 rounded-sm cursor-pointer group relative", // Standard item height & padding
              "transition-colors duration-150 ease-in-out",
              isActive &&
                !isEditing &&
                "bg-accent text-accent-foreground font-medium", // Active state style
              !isActive &&
                !isEditing &&
                "text-muted-foreground hover:bg-accent hover:text-accent-foreground", // Default & hover
              isEditing && "bg-muted ring-1 ring-primary/50" // Visual cue for editing the whole item
            )}
            onClick={handleItemClick}
            onKeyDown={handleItemKeyDown}
            onDoubleClick={handleItemDoubleClick}
            tabIndex={0} // Always tabbable if not editing (input will be tabbable when editing)
            aria-current={isActive ? "page" : undefined}
            title={
              project.name +
              (isEditing ? " (Editing)" : isActive ? " (Active)" : "")
            }
          >
            {isEditing ? (
              <input
                ref={inputRef}
                type="text"
                value={currentName}
                onChange={(e) => setCurrentName(e.target.value)}
                onKeyDown={handleInputKeyDown}
                onBlur={handleInputBlur}
                onClick={(e) => e.stopPropagation()}
                // --- STYLES MODIFIED BELOW for the input ---
                className={cn(
                  "flex-1 bg-transparent outline-none p-0 m-0 text-sm font-medium w-full", // Ensure it takes full width within flex
                  "border-none ring-0 focus:ring-0", // Remove default input borders/rings
                  "text-foreground placeholder:text-muted-foreground" // Match text color
                )}
                // autoFocus // autoFocus can sometimes interfere with programmatic focus, rely on useEffect
              />
            ) : (
              // --- STYLES MODIFIED BELOW for the span ---
              <span
                className={cn(
                  "flex-1 truncate text-sm min-w-0", // min-w-0 for proper truncation in flex
                  isActive
                    ? "font-medium text-accent-foreground"
                    : "font-normal"
                )}
              >
                {project.name}
              </span>
            )}
            {/* Active project indicator - vertical bar on the left */}
            {!isEditing && isActive && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-1 bg-primary rounded-r-full"></div>
            )}
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent
          className="w-52"
          onClick={(e) => e.stopPropagation()}
        >
          <ContextMenuItem
            onSelect={() => startRename(true)}
            disabled={isEditing}
          >
            {/* Pass true for context menu trigger */}
            <Edit3 className="mr-2 h-4 w-4" />
            Rename Project
            <span className="ml-auto text-xs text-muted-foreground">F2</span>
          </ContextMenuItem>
          {/* --- ADDED onSelect for export and delete --- */}
          <ContextMenuItem onSelect={handleExport} disabled={isEditing}>
            <Download className="mr-2 h-4 w-4" />
            Export Project
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem
            onSelect={() => handleDeleteInitiate(project)} // Pass the current project
            disabled={isEditing}
            className="text-destructive focus:text-destructive focus:bg-destructive/10"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Project
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      {projectToDelete && ( // Conditionally render dialog
        <ConfirmationDialog
          isOpen={isDeleteConfirmOpen}
          onOpenChange={setIsDeleteConfirmOpen}
          title={`Delete Project: "${projectToDelete?.name}"?`}
          description="This will permanently delete the project and all its associated tasks. This action cannot be undone."
          onConfirm={handleConfirmDelete}
          confirmText="Delete Project"
        />
      )}
    </>
  );
}
