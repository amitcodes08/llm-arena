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

    // Filter out rate-limited 31B model and prioritize rock-solid free models
    const freeModels: CatalogModel[] = json.data
      .filter((m) => m.id.endsWith(":free") && !m.id.includes("31b"))
      .map((m) => ({
        id: m.id,
        name: formatModelName(m.id, m.name),
        contextLength: m.context_length || 131072,
        pricingPrompt: m.pricing?.prompt ?? "0",
        pricingCompletion: m.pricing?.completion ?? "0",
        isFree: true,
      }))
      .sort((a, b) => {
        // Prioritize top responsive models first
        const priorityOrder = [
          "openai/gpt-oss-20b:free",
          "nvidia/nemotron-3.5-lightning:free",
          "google/gemma-4-26b-a4b-it:free",
          "nvidia/nemotron-3-nano-30b-a3b:free",
          "cohere/north-mini-code:free",
        ];
        const aIndex = priorityOrder.indexOf(a.id);
        const bIndex = priorityOrder.indexOf(b.id);
        if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
        if (aIndex !== -1) return -1;
        if (bIndex !== -1) return 1;
        return b.contextLength - a.contextLength;
      });

    return freeModels.length > 0 ? freeModels : fallbackCatalog;
  } catch (error) {
    console.error("[model-catalog] error fetching catalog", error);
    return fallbackCatalog;
  }
}

function formatModelName(id: string, rawName: string): string {
  if (rawName && !rawName.includes("/")) {
    return rawName.replace(":free", "").trim();
  }
  const cleanId = id.replace(":free", "");
  const [provider, model] = cleanId.split("/");
  const providerLabel = provider
    ? provider.charAt(0).toUpperCase() + provider.slice(1)
    : "";
  const modelLabel = model
    ? model
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ")
    : cleanId;

  return providerLabel ? `${providerLabel}: ${modelLabel}` : modelLabel;
}

export const fallbackCatalog: CatalogModel[] = [
  {
    id: "openai/gpt-oss-20b:free",
    name: "OpenAI: GPT OSS 20B",
    contextLength: 131072,
    pricingPrompt: "0",
    pricingCompletion: "0",
    isFree: true,
  },
  {
    id: "nvidia/nemotron-3.5-lightning:free",
    name: "NVIDIA: Nemotron 3.5 Lightning",
    contextLength: 131072,
    pricingPrompt: "0",
    pricingCompletion: "0",
    isFree: true,
  },
  {
    id: "google/gemma-4-26b-a4b-it:free",
    name: "Google: Gemma 4 26B A4B IT",
    contextLength: 131072,
    pricingPrompt: "0",
    pricingCompletion: "0",
    isFree: true,
  },
  {
    id: "nvidia/nemotron-3-nano-30b-a3b:free",
    name: "NVIDIA: Nemotron 3 Nano 30B",
    contextLength: 131072,
    pricingPrompt: "0",
    pricingCompletion: "0",
    isFree: true,
  },
  {
    id: "nvidia/nemotron-nano-9b-v2:free",
    name: "NVIDIA: Nemotron Nano 9B V2",
    contextLength: 131072,
    pricingPrompt: "0",
    pricingCompletion: "0",
    isFree: true,
  },
  {
    id: "cohere/north-mini-code:free",
    name: "Cohere: North Mini Code",
    contextLength: 65536,
    pricingPrompt: "0",
    pricingCompletion: "0",
    isFree: true,
  },
  {
    id: "liquid/lfm-2.5-2.6b:free",
    name: "Liquid: LFM 2.5 2.6B",
    contextLength: 32768,
    pricingPrompt: "0",
    pricingCompletion: "0",
    isFree: true,
  },
  {
    id: "poolside/laguna-s-2.1:free",
    name: "Poolside: Laguna S 2.1",
    contextLength: 32768,
    pricingPrompt: "0",
    pricingCompletion: "0",
    isFree: true,
  },
  {
    id: "poolside/laguna-xs-2.1:free",
    name: "Poolside: Laguna XS 2.1",
    contextLength: 16384,
    pricingPrompt: "0",
    pricingCompletion: "0",
    isFree: true,
  },
];
