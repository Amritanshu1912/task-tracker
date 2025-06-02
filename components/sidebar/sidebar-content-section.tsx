// components/sidebar/sidebar-content-section.tsx

"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Layers } from "lucide-react";
import { useTaskStore } from "@/lib/store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SidebarSection } from "./sidebar-components";
import { SidebarButton } from "./sidebar-components";

interface SidebarContentSectionProps {
  isSidebarOpen: boolean;
}

export function SidebarContentSection({
  isSidebarOpen,
}: SidebarContentSectionProps) {
  const addSection = useTaskStore((state) => state.addSection);

  const [newSectionName, setNewSectionName] = useState("");
  const [newSectionIcon, setNewSectionIcon] = useState("📋");
  const [isAddSectionDialogOpen, setIsAddSectionDialogOpen] = useState(false);

  // Handles adding a new task section.
  const handleAddSection = useCallback(() => {
    if (newSectionName.trim()) {
      const sectionId =
        newSectionName.toLowerCase().replace(/\s+/g, "-") ||
        `section-${crypto.randomUUID().slice(0, 8)}`;
      addSection(sectionId, {
        title: newSectionName,
        icon: newSectionIcon || "📋",
        description: `Tasks for ${newSectionName}`,
        tasks: [],
      });
      setNewSectionName("");
      setNewSectionIcon("📋");
      setIsAddSectionDialogOpen(false);
    }
  }, [newSectionName, newSectionIcon, addSection]);

  return (
    <SidebarSection title="Content" icon={Layers} isSidebarOpen={isSidebarOpen}>
      <Dialog
        open={isAddSectionDialogOpen}
        onOpenChange={setIsAddSectionDialogOpen}
      >
        <DialogTrigger asChild>
          <SidebarButton
            icon={Plus}
            label="Add Section"
            tooltip="Add New Section"
            isSidebarOpen={isSidebarOpen}
          />
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
            <Button
              variant="outline"
              onClick={() => setIsAddSectionDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAddSection}>Create</Button>
          </div>
        </DialogContent>
      </Dialog>
    </SidebarSection>
  );
}
