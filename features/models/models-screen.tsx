"use client";

import { CatalogModel } from "@/infrastructure/fetch-model-catalog";
import { Sparkles, Bot, ArrowRight } from "lucide-react";
import Link from "next/link";

interface ModelsScreenProps {
  readonly catalog: CatalogModel[] | null;
  readonly defaultSelection: string[];
}

export function ModelsScreen({ catalog }: Readonly<ModelsScreenProps>) {
  const models = catalog || [];
  const maxContext = Math.max(...models.map((m) => m.contextLength), 131072);

  return (
    <div className="animate-enter mx-auto w-full max-w-5xl flex-1 space-y-6 overflow-y-auto p-4 sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-normal tracking-tight sm:text-3xl">
            Models Catalog
          </h1>
          <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
            OpenRouter free-tier catalog sorted by context window capacity.
          </p>
        </div>
        <Link
          href="/"
          className="btn-accent flex items-center gap-1.5 self-start px-3.5 py-1.5 text-xs font-semibold sm:self-auto"
        >
          <span>Open Arena</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {models.map((model) => {
          const pct = Math.round((model.contextLength / maxContext) * 100);

          return (
            <div
              key={model.id}
              className="surface hover:border-input space-y-4 p-5 shadow-xs transition-all duration-150"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="bg-muted border-border text-foreground flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border font-bold">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-foreground truncate text-sm font-semibold">
                      {model.name}
                    </h3>
                    <p className="text-muted-foreground truncate font-mono text-[11px]">
                      {model.id}
                    </p>
                  </div>
                </div>

                <span className="border-border bg-muted/80 text-foreground flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium">
                  <Sparkles className="h-3 w-3 opacity-80" />
                  Free Tier
                </span>
              </div>

              {/* Context Window Comparison Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between font-mono text-xs">
                  <span className="text-muted-foreground">Context Window</span>
                  <span className="text-foreground font-medium">
                    {model.contextLength.toLocaleString()} tokens
                  </span>
                </div>
                <div className="measure-bar">
                  <span style={{ width: `${pct}%` }} />
                </div>
              </div>

              {/* Pricing breakdown */}
              <div className="border-border text-muted-foreground flex justify-between border-t pt-2 font-mono text-xs">
                <span>Prompt: $0.00 / 1M</span>
                <span>Completion: $0.00 / 1M</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
