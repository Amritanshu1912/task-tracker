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
import { Edit2, Trash2, Download } from "lucide-react";
import { toast } from "sonner";
import { exportToJson, cn } from "@/lib/utils";
import type { Project, TaskStore as TaskStoreType } from "@/lib/types";
import { Button } from "../ui/button";

interface SidebarProjectListProps {
  isSidebarOpen: boolean;
}

export function SidebarProjectList({ isSidebarOpen }: SidebarProjectListProps) {
  const projects = useTaskStore((state) => state.projects);

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
  // Zustand Store Selectors
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

  // Derived State
  const isActive = project.id === activeProjectId;
  const isEditing = project.id === editingProjectId;

  // Local Component State
  const [currentName, setCurrentName] = useState(project.name);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const contextMenuOpenRef = useRef(false);

  // Callbacks and Effects
  const focusInput = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  // Effect to reset currentName when editing stops or another project is edited
  useEffect(() => {
    if (project.id !== editingProjectId) {
      setCurrentName(project.name);
    }
  }, [project.name, project.id, editingProjectId]);

  // Effect to focus input when editing starts
  useEffect(() => {
    if (isEditing) {
      const timer = setTimeout(focusInput, 10);
      return () => clearTimeout(timer);
    }
  }, [isEditing, focusInput]);

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

  const handleInputBlur = useCallback(() => {
    if (isEditing) commitName();
  }, [commitName, isEditing]);

  const startRename = useCallback(() => {
    if (isEditing) return; // Defensive guard
    setEditingProjectId(project.id);
  }, [project.id, setEditingProjectId]);

  const handleContextMenuOpenChange = useCallback((open: boolean) => {
    contextMenuOpenRef.current = open;
  }, []);

  const handleItemKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "F2" && !isEditing) {
        e.preventDefault();
        startRename();
      }
    },
    [isEditing, startRename]
  );

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
      deleteProject(projectToDelete.id);
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
        <ContextMenuTrigger
          disabled={isEditing}
          asChild
          onFocus={(e) => isEditing && e.stopPropagation()}
        >
          {/* --- MODIFIED: Added `group` for hover effects --- */}
          <div
            className={cn(
              "flex items-center w-full h-9 px-3 gap-3 rounded-sm cursor-pointer group relative",
              "transition-colors duration-150 ease-in-out",
              isActive &&
                !isEditing &&
                "bg-accent text-accent-foreground font-medium",
              !isActive &&
                !isEditing &&
                "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              isEditing && "bg-muted ring-1 ring-primary/50"
            )}
            onClick={handleItemClick}
            onKeyDown={handleItemKeyDown}
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
                onBlur={(e) => {
                  if (!contextMenuOpenRef.current) {
                    handleInputBlur();
                  }
                }}
                onClick={(e) => e.stopPropagation()}
                className={cn(
                  "flex-1 bg-transparent outline-none p-0 m-0 text-sm font-medium w-full",
                  "border-none ring-0 focus:ring-0 focus:outline-none",
                  "text-foreground placeholder:text-muted-foreground"
                )}
                autoFocus
              />
            ) : (
              <>
                <span
                  className={cn(
                    "flex-1 truncate text-sm min-w-0",
                    isActive
                      ? "font-medium text-accent-foreground"
                      : "font-normal"
                  )}
                >
                  {project.name}
                </span>
                {/* --- NEW: Hover-to-show action icons --- */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-100">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground/50 hover:text-muted-foreground"
                    onClick={(e) => {
                      e.stopPropagation();
                      startRename();
                    }}
                    title="Rename project"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive/50 hover:text-destructive/80"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteInitiate(project);
                    }}
                    title="Delete project"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </>
            )}
            {!isEditing && isActive && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-1 bg-primary rounded-r-full"></div>
            )}
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent
          className="w-52"
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <ContextMenuItem onSelect={startRename} disabled={isEditing}>
            <Edit2 className="mr-2 h-4 w-4" />
            Rename Project
            <span className="ml-auto text-xs text-muted-foreground">F2</span>
          </ContextMenuItem>
          <ContextMenuItem onSelect={handleExport} disabled={isEditing}>
            <Download className="mr-2 h-4 w-4" />
            Export Project
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem
            onSelect={() => handleDeleteInitiate(project)}
            disabled={isEditing}
            className="text-destructive focus:text-destructive focus:bg-destructive/10"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Project
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      {projectToDelete && (
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
