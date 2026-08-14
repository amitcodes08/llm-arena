"use client";

import { useState, useRef } from "react";
import { ArrowUp, X } from "lucide-react";
import { CatalogModel } from "@/infrastructure/fetch-model-catalog";
import { ModelPickerPopover } from "@/features/models/model-picker-popover";

interface PromptInputProps {
  readonly onSend?: (prompt: string) => void;
  readonly catalog?: CatalogModel[] | null;
  readonly selectedModelIds?: string[];
  readonly onSelectionChange?: (ids: string[]) => void;
  readonly value?: string;
  readonly onChange?: (value: string) => void;
  readonly isSubmitting?: boolean;
}

export function PromptInput({
  onSend,
  catalog,
  selectedModelIds = [],
  onSelectionChange,
  value: controlledValue,
  onChange: onControlledChange,
  isSubmitting = false,
}: Readonly<PromptInputProps>) {
  const [internalPrompt, setInternalPrompt] = useState("");
  const isControlled = controlledValue !== undefined;
  const prompt = isControlled ? controlledValue : internalPrompt;
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handlePromptChange = (newVal: string) => {
    if (isControlled) {
      onControlledChange?.(newVal);
    } else {
      setInternalPrompt(newVal);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isSubmitting) {
      onSend?.(prompt.trim());
      handlePromptChange("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const removeChip = (id: string) => {
    if (selectedModelIds.length > 1 && onSelectionChange) {
      onSelectionChange(selectedModelIds.filter((m) => m !== id));
    }
  };

  return (
    <div className="border-border bg-card/80 sticky bottom-0 z-10 border-t p-3 backdrop-blur-sm sm:p-4">
      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-4xl space-y-2.5 sm:space-y-3"
      >
        {/* Selected Model Chips */}
        {selectedModelIds.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 px-1">
            {selectedModelIds.map((id) => {
              const model = catalog?.find((m) => m.id === id);
              const name =
                model?.name || id.split("/").pop()?.replace(":free", "") || id;

              return (
                <span
                  key={id}
                  className="bg-muted text-foreground border-border flex items-center gap-1.5 rounded-md border px-2 py-0.5 font-mono text-xs"
                >
                  <span className="max-w-[120px] truncate">{name}</span>
                  {selectedModelIds.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeChip(id)}
                      className="text-muted-foreground hover:text-foreground cursor-pointer rounded p-0.5"
                      title="Remove model"
                      aria-label={`Remove ${name}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </span>
              );
            })}
          </div>
        )}

        {/* Main Textarea Container */}
        <div className="border-input bg-background focus-within:border-primary relative rounded-xl border p-3 shadow-xs transition-all sm:p-4">
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => handlePromptChange(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isSubmitting}
            placeholder="Ask anything to benchmark side by side. Enter to send, Shift + Enter for a new line"
            rows={2}
            className="text-foreground placeholder-muted-foreground w-full resize-none bg-transparent text-sm outline-none"
          />

          {/* Action Bar inside textarea */}
          <div className="border-border mt-2 flex items-center justify-between border-t pt-2.5 sm:pt-3">
            <div className="flex items-center gap-2.5">
              {/* + Add Model Popover */}
              <ModelPickerPopover
                catalog={catalog || null}
                selectedModelIds={selectedModelIds}
                onSelectionChange={(ids) => onSelectionChange?.(ids)}
              />
              <span className="text-muted-foreground hidden text-xs sm:inline">
                Up to 3 · {selectedModelIds.length} selected
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={
                !prompt.trim() || isSubmitting || selectedModelIds.length === 0
              }
              aria-label="Send prompt"
              className="bg-primary text-primary-foreground hover:bg-primary/90 flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-base font-bold shadow-xs transition-all disabled:cursor-not-allowed disabled:opacity-30 sm:h-9 sm:w-9"
            >
              <ArrowUp className="h-4 w-4 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
