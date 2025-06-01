"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import {
  Save,
  FileUp,
  FileDown,
  Plus,
  Eye,
  EyeOff,
  DoorClosedIcon as CloseIcon,
  FilterIcon,
  ChevronsDownUp,
  ChevronsUpDown,
  Settings,
  Layers,
  Database,
} from "lucide-react"
import { useTaskStore } from "@/lib/store"
import { exportToJson, importFromJson } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { AVAILABLE_LABELS, LABEL_EMOJIS } from "@/lib/labels"
import { cn } from "@/lib/utils"

export function AppSidebar() {
  // Zustand store hooks
  const isSidebarOpen = useTaskStore((state) => state.isSidebarOpen)
  const toggleSidebar = useTaskStore((state) => state.toggleSidebar)
  const saveToLocalStorage = useTaskStore((state) => state.saveToLocalStorage)
  const addSection = useTaskStore((state) => state.addSection)
  const toggleAllNotes = useTaskStore((state) => state.toggleAllNotes)
  const areAllNotesCollapsed = useTaskStore((state) => state.areAllNotesCollapsed)
  const activeLabelFilters = useTaskStore((state) => state.activeLabelFilters)
  const toggleLabelFilter = useTaskStore((state) => state.toggleLabelFilter)
  const clearLabelFilters = useTaskStore((state) => state.clearLabelFilters)
  const setMaxVisibleDepth = useTaskStore((state) => state.setMaxVisibleDepth)
  const stats = useTaskStore((state) => state.stats)

  // Local state
  const [newSectionName, setNewSectionName] = useState("")
  const [newSectionIcon, setNewSectionIcon] = useState("📋")
  const [isAddSectionDialogOpen, setIsAddSectionDialogOpen] = useState(false)

  // Handlers
  const handleSave = useCallback(() => {
    saveToLocalStorage()
    // You could replace this with a toast notification
    alert("Progress saved successfully!")
  }, [saveToLocalStorage])

  const handleExport = useCallback(() => {
    exportToJson(useTaskStore.getState().sections)
  }, [])

  const handleImport = useCallback(() => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".json"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        importFromJson(file)
      }
    }
    input.click()
  }, [])

  const handleAddSection = useCallback(() => {
    if (newSectionName.trim()) {
      const sectionId =
        newSectionName.toLowerCase().replace(/\s+/g, "-") || `section-${crypto.randomUUID().slice(0, 8)}`
      addSection(sectionId, {
        title: newSectionName,
        icon: newSectionIcon || "📋",
        description: `Tasks for ${newSectionName}`,
        tasks: [],
      })
      setNewSectionName("")
      setNewSectionIcon("📋")
      setIsAddSectionDialogOpen(false)
    }
  }, [newSectionName, newSectionIcon, addSection])

  // Sidebar section component
  const SidebarSection = ({
    title,
    icon: Icon,
    children,
    className,
  }: {
    title: string
    icon?: React.ElementType
    children: React.ReactNode
    className?: string
  }) => (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2 px-3">
        {Icon && <Icon className="w-4 h-4 text-primary" />}
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</h3>
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  )

  // Sidebar button component
  const SidebarButton = ({
    icon: Icon,
    label,
    onClick,
    variant = "ghost",
    className,
    badge,
    ...props
  }: {
    icon?: React.ElementType
    label: string
    onClick?: () => void
    variant?: "ghost" | "outline" | "default" | "secondary" | "destructive"
    className?: string
    badge?: string | number
    [key: string]: any
  }) => (
    <Button
      variant={variant}
      size="sm"
      onClick={onClick}
      className={cn(
        "w-full justify-start gap-3 h-9 px-3 font-normal",
        "hover:bg-accent hover:text-accent-foreground",
        "transition-colors duration-200",
        className,
      )}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4 shrink-0" />}
      <span className="truncate">{label}</span>
      {badge && (
        <Badge variant="secondary" className="ml-auto text-xs px-1.5 py-0">
          {badge}
        </Badge>
      )}
    </Button>
  )

  if (!isSidebarOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 sidebar-backdrop print:hidden" onClick={toggleSidebar} aria-hidden="true" />

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-screen w-80 flex flex-col print:hidden",
          "bg-card/95 backdrop-blur-xl border-r border-border/50",
          "shadow-2xl animate-slide-in-left",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/50 bg-card/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Settings className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-sm">Control Panel</h2>
              <p className="text-xs text-muted-foreground">Manage your workspace</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="h-8 w-8">
            <CloseIcon className="w-4 h-4" />
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="p-4 bg-muted/30 border-b border-border/30">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-lg font-bold text-success">{stats.completed}</div>
              <div className="text-xs text-muted-foreground">Done</div>
            </div>
            <div>
              <div className="text-lg font-bold">{stats.total}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
            <div>
              <div className="text-lg font-bold text-primary">{stats.percentage}%</div>
              <div className="text-xs text-muted-foreground">Progress</div>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* View Controls */}
          <SidebarSection title="View Controls" icon={Eye}>
            <SidebarButton
              icon={areAllNotesCollapsed ? Eye : EyeOff}
              label={areAllNotesCollapsed ? "Show Notes" : "Hide Notes"}
              onClick={toggleAllNotes}
            />
            <Separator className="my-2" />
            <SidebarButton icon={ChevronsDownUp} label="Expand All" onClick={() => setMaxVisibleDepth(null)} />
            <SidebarButton icon={ChevronsUpDown} label="Collapse Level 1+" onClick={() => setMaxVisibleDepth(0)} />
            <SidebarButton icon={ChevronsUpDown} label="Collapse Level 2+" onClick={() => setMaxVisibleDepth(1)} />
            <SidebarButton icon={ChevronsUpDown} label="Collapse Level 3+" onClick={() => setMaxVisibleDepth(2)} />
          </SidebarSection>

          {/* Content Management */}
          <SidebarSection title="Content" icon={Layers}>
            <Dialog open={isAddSectionDialogOpen} onOpenChange={setIsAddSectionDialogOpen}>
              <DialogTrigger asChild>
                <SidebarButton icon={Plus} label="Add Section" />
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create New Section</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="section-icon" className="text-right">
                      Icon
                    </Label>
                    <Input
                      id="section-icon"
                      value={newSectionIcon}
                      onChange={(e) => setNewSectionIcon(e.target.value)}
                      placeholder="📋"
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="section-name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="section-name"
                      value={newSectionName}
                      onChange={(e) => setNewSectionName(e.target.value)}
                      placeholder="Section name"
                      className="col-span-3"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddSectionDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddSection}>Create</Button>
                </div>
              </DialogContent>
            </Dialog>
          </SidebarSection>

          {/* Filters */}
          <SidebarSection title="Filters" icon={FilterIcon}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Labels ({activeLabelFilters.length} active)</span>
              {activeLabelFilters.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearLabelFilters}
                  className="h-6 px-2 text-xs text-destructive hover:text-destructive"
                >
                  Clear
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {AVAILABLE_LABELS.map((label) => {
                const isSelected = activeLabelFilters.includes(label)
                return (
                  <Badge
                    key={label}
                    variant={isSelected ? "default" : "outline"}
                    onClick={() => toggleLabelFilter(label)}
                    className={cn(
                      "cursor-pointer text-xs transition-all duration-200",
                      "hover:scale-105 active:scale-95",
                      isSelected
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "hover:bg-accent hover:text-accent-foreground",
                    )}
                  >
                    {LABEL_EMOJIS[label]} {label}
                  </Badge>
                )
              })}
            </div>
          </SidebarSection>

          {/* Data Management */}
          <SidebarSection title="Data" icon={Database}>
            <SidebarButton icon={Save} label="Save Progress" onClick={handleSave} />
            <SidebarButton icon={FileDown} label="Export JSON" onClick={handleExport} />
            <SidebarButton icon={FileUp} label="Import JSON" onClick={handleImport} />
          </SidebarSection>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border/50 bg-card/50">
          <SidebarButton
            icon={CloseIcon}
            label="Close Panel"
            onClick={toggleSidebar}
            variant="outline"
            className="text-muted-foreground hover:text-destructive"
          />
        </div>
      </aside>
    </>
  )
}
