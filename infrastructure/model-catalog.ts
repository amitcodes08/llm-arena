import { CatalogModel } from "@/infrastructure/fetch-model-catalog";

/**
 * Returns default selected model IDs (up to 3 top free models).
 */
export function defaultModelSelection(catalog: CatalogModel[]): string[] {
  if (!catalog || catalog.length === 0) {
    return [
      "google/gemma-4-31b-it:free",
      "openai/gpt-oss-20b:free",
      "nvidia/nemotron-3.5-lightning:free",
    ];
  }
  return catalog.slice(0, 3).map((m) => m.id);
}
