export interface ThreadSummary {
  id: string;
  title: string;
  updatedAt: Date;
}

export interface ThreadGroup {
  label: string;
  threads: ThreadSummary[];
}
