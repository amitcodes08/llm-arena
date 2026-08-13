"use client";

import { useState, useRef, useEffect } from "react";
import { CatalogModel } from "@/infrastructure/fetch-model-catalog";
import { Check, Plus, X, Bot } from "lucide-react";

interface ModelPickerPopoverProps {
  readonly catalog: CatalogModel[] | null;
  readonly selectedModelIds: string[];
  readonly onSelectionChange: (selectedIds: string[]) => void;
}

export function ModelPickerPopover({
  catalog,
  selectedModelIds,
  onSelectionChange,
}: Readonly<ModelPickerPopoverProps>) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const models = catalog || [];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleModel = (id: string) => {
    if (selectedModelIds.includes(id)) {
      if (selectedModelIds.length > 1) {
        onSelectionChange(selectedModelIds.filter((m) => m !== id));
      }
    } else {
      if (selectedModelIds.length < 3) {
        onSelectionChange([...selectedModelIds, id]);
      } else {
        // If capped at 3, replace the last model
        onSelectionChange([...selectedModelIds.slice(0, 2), id]);
      }
    }
  };

  return (
    <div className="relative inline-block" ref={popoverRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="border-border bg-muted hover:bg-primary hover:text-primary-foreground flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold shadow-xs transition-all"
      >
        <Plus className="h-3.5 w-3.5" />
        <span>Add Model</span>
      </button>

      {/* Floating Popover */}
      {isOpen && (
        <div className="surface animate-in fade-in zoom-in-95 absolute bottom-full left-0 z-50 mb-2 w-80 p-3 shadow-xl duration-150">
          <div className="border-border mb-2 flex items-center justify-between border-b pb-2">
            <span className="text-eyebrow">Select Models (1-3)</span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-muted-foreground hover:text-foreground rounded-md p-1"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="max-h-64 space-y-1 overflow-y-auto">
            {models.map((model) => {
              const isSelected = selectedModelIds.includes(model.id);

              return (
                <button
                  key={model.id}
                  type="button"
                  onClick={() => toggleModel(model.id)}
                  className={`flex w-full items-center justify-between rounded-lg p-2 text-left text-xs transition-colors ${
                    isSelected
                      ? "bg-primary/10 text-foreground border-primary/30 border"
                      : "hover:bg-muted text-muted-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate pr-2">
                    <Bot className="h-4 w-4 shrink-0" />
                    <div className="truncate">
                      <div className="text-foreground truncate font-semibold">
                        {model.name}
                      </div>
                      <div className="text-muted-foreground truncate font-mono text-[10px]">
                        {model.contextLength.toLocaleString()} tokens
                      </div>
                    </div>
                  </div>

                  <div
                    className={`flex h-4 w-4 items-center justify-center rounded border transition-colors ${
                      isSelected
                        ? "bg-primary border-primary text-primary-foreground"
                        : "border-input"
                    }`}
                  >
                    {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
