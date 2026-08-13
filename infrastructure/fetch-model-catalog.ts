export interface OpenRouterModel {
  id: string;
  name: string;
  context_length: number;
  pricing: {
    prompt: string;
    completion: string;
  };
}

export interface CatalogModel {
  id: string;
  name: string;
  contextLength: number;
  pricingPrompt: string;
  pricingCompletion: string;
  isFree: boolean;
}

/**
 * Server-side fetcher querying OpenRouter's live API for free-tier models (:free).
 */
export async function fetchFreeModelCatalog(): Promise<CatalogModel[] | null> {
  try {
    const res = await fetch("https://openrouter.ai/api/v1/models", {
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      console.error(
        "[model-catalog] failed to fetch OpenRouter models",
        res.status
      );
      return fallbackCatalog;
    }

    const json = (await res.json()) as { data: OpenRouterModel[] };

    if (!json?.data || !Array.isArray(json.data)) {
      return fallbackCatalog;
    }

    const freeModels: CatalogModel[] = json.data
      .filter((m) => m.id.endsWith(":free"))
      .map((m) => ({
        id: m.id,
        name: m.name.replace(":free", "").trim(),
        contextLength: m.context_length || 8192,
        pricingPrompt: m.pricing?.prompt ?? "0",
        pricingCompletion: m.pricing?.completion ?? "0",
        isFree: true,
      }))
      .sort((a, b) => b.contextLength - a.contextLength);

    return freeModels.length > 0 ? freeModels : fallbackCatalog;
  } catch (error) {
    console.error("[model-catalog] error fetching catalog", error);
    return fallbackCatalog;
  }
}

const fallbackCatalog: CatalogModel[] = [
  {
    id: "meta-llama/llama-3.1-8b-instruct:free",
    name: "Llama 3.1 8B Instruct",
    contextLength: 131072,
    pricingPrompt: "0",
    pricingCompletion: "0",
    isFree: true,
  },
  {
    id: "qwen/qwen-2.5-72b-instruct:free",
    name: "Qwen 2.5 72B Instruct",
    contextLength: 32768,
    pricingPrompt: "0",
    pricingCompletion: "0",
    isFree: true,
  },
  {
    id: "google/gemma-2-9b-it:free",
    name: "Gemma 2 9B IT",
    contextLength: 8192,
    pricingPrompt: "0",
    pricingCompletion: "0",
    isFree: true,
  },
];
