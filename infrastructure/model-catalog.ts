import { CatalogModel } from "@/infrastructure/fetch-model-catalog";

/**
 * Returns default selected model IDs (up to 3 top free models).
 */
export function defaultModelSelection(catalog: CatalogModel[]): string[] {
  if (!catalog || catalog.length === 0) return [];
  return catalog.slice(0, 3).map((m) => m.id);
}
