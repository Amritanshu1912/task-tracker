"use client";

import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { AVAILABLE_LABELS, LABEL_EMOJIS } from "@/lib/labels";

interface LabelPickerProps {
  onSelect: (label: string) => void;
  onCancel: () => void;
}

/**
 * LabelPicker - A modal for selecting a label from a predefined set.
 * Uses React.memo for performance. Accessible and visually modern.
 */
export const LabelPicker = memo(function LabelPicker({
  onSelect,
  onCancel,
}: LabelPickerProps) {
  return (
    <div
      className="bg-muted p-4 rounded-lg shadow-lg min-w-[260px] max-w-xs"
      role="dialog"
      aria-modal="true"
      aria-label="Select a label"
    >
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-base font-semibold tracking-tight">
          Select a label
        </h4>
        <Button
          variant="ghost"
          size="icon"
          onClick={onCancel}
          aria-label="Cancel label selection"
          className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive transition-colors"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {AVAILABLE_LABELS.map((label) => (
          <Badge
            key={label}
            variant="outline"
            className="cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors text-sm px-2.5 py-1 rounded-full"
            tabIndex={0}
            aria-label={`Select label ${label}`}
            onClick={() => onSelect(label)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") onSelect(label);
            }}
          >
            {LABEL_EMOJIS[label]} {label}
          </Badge>
        ))}
      </div>
    </div>
  );
});
