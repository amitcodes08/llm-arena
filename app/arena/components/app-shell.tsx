"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { TopBar } from "./top-bar";
import { ArenaGrid } from "./arena-grid";
import { PromptInput } from "./prompt-input";

export function AppShell() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[var(--background)]">
      {/* Persistent Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((prev) => !prev)}
      />

      {/* Main Content Area */}
      <div className="flex h-screen flex-1 flex-col overflow-hidden">
        <TopBar />
        <ArenaGrid />
        <PromptInput />
      </div>
    </div>
  );
}
