"use client";

import { CatalogModel } from "@/infrastructure/fetch-model-catalog";
import { ArenaScreen } from "@/features/arena/arena-screen";

interface HomeScreenProps {
  readonly catalog: CatalogModel[] | null;
  readonly defaultSelection: string[];
  readonly onCastVote: (
    turnId: string,
    modelResponseId: string
  ) => Promise<{ success: boolean; error?: string }>;
}

export function HomeScreen({
  catalog,
  defaultSelection,
  onCastVote,
}: Readonly<HomeScreenProps>) {
  return (
    <ArenaScreen
      catalog={catalog}
      defaultSelection={defaultSelection}
      onCastVote={onCastVote}
    />
  );
}
