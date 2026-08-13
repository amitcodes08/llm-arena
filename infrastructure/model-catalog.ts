import { CatalogModel } from "@/infrastructure/fetch-model-catalog";

/**
 * Returns default selected model IDs (top 3 responsive free models).
 */
export function defaultModelSelection(catalog: CatalogModel[]): string[] {
  if (!catalog || catalog.length === 0) {
    return [
      "openai/gpt-oss-20b:free",
      "nvidia/nemotron-3.5-lightning:free",
      "google/gemma-4-26b-a4b-it:free",
    ];
  }
  return catalog.slice(0, 3).map((m) => m.id);
}
