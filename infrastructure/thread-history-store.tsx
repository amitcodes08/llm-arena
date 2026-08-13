"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface ThreadHistoryContextType {
  updatedThreads: Array<{ id: string; title: string }>;
  addThread: (thread: { id: string; title: string }) => void;
}

const ThreadHistoryContext = createContext<ThreadHistoryContextType>({
  updatedThreads: [],
  addThread: () => {},
});

export function ThreadHistoryProvider({
  children,
}: {
  readonly children: ReactNode;
}) {
  const [updatedThreads, setUpdatedThreads] = useState<
    Array<{ id: string; title: string }>
  >([]);

  const addThread = (thread: { id: string; title: string }) => {
    setUpdatedThreads((prev) => [thread, ...prev]);
  };

  return (
    <ThreadHistoryContext.Provider value={{ updatedThreads, addThread }}>
      {children}
    </ThreadHistoryContext.Provider>
  );
}

export function useThreadHistory() {
  return useContext(ThreadHistoryContext);
}
