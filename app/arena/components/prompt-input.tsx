"use client";

import { useState } from "react";
import { Plus, ArrowUp } from "lucide-react";

interface PromptInputProps {
  onSend?: (prompt: string) => void;
  selectedModelsCount?: number;
}

export function PromptInput({
  onSend,
  selectedModelsCount = 3,
}: Readonly<PromptInputProps>) {
  const [prompt, setPrompt] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onSend?.(prompt);
      setPrompt("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="border-border bg-card/80 sticky bottom-0 z-10 border-t p-4 backdrop-blur-sm">
      <form onSubmit={handleSubmit} className="mx-auto max-w-4xl space-y-3">
        {/* Main Textarea Container */}
        <div className="border-input bg-background focus-within:border-primary relative rounded-xl border p-4 shadow-xs transition-all">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Anything. Enter to send, Shift + Enter for a new line"
            rows={2}
            className="text-foreground placeholder-muted-foreground w-full resize-none bg-transparent text-sm outline-none"
          />

          {/* Action Bar inside textarea */}
          <div className="border-border mt-2 flex items-center justify-between border-t pt-3">
            <div className="flex items-center gap-2.5">
              {/* + Add Model Button */}
              <button
                type="button"
                className="border-border bg-muted hover:bg-primary hover:text-primary-foreground flex items-center gap-1.5 rounded-lg border px-3.5 py-1.5 text-xs font-semibold shadow-xs transition-all"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Model</span>
              </button>
              <span className="text-muted-foreground hidden text-xs sm:inline">
                Up to 3 · {selectedModelsCount} selected
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!prompt.trim()}
              aria-label="Send prompt"
              className="bg-primary text-primary-foreground hover:bg-primary/90 flex h-9 w-9 items-center justify-center rounded-lg text-base font-bold shadow-xs transition-all disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ArrowUp className="h-4 w-4 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
