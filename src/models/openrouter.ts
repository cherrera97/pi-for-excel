/** OpenRouter-specific request and refresh policies. */

export const OPENROUTER_PROVIDER_ID = "openrouter";
export const OPENROUTER_API_BASE_URL = "https://openrouter.ai/api/v1";
export const OPENROUTER_CATALOG_TTL_MS = 24 * 60 * 60 * 1_000;
export const OPENROUTER_PRESET_SETTING = "openrouter.preset.slug";

export function normalizeOpenRouterPresetSlug(value: string | null): string | undefined {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
}

/** OpenRouter returns these terms when a removed model can no longer be routed. */
export function isOpenRouterRoutingError(message: string): boolean {
  const normalized = message.toLowerCase();
  return normalized.includes("openrouter") && (
    normalized.includes("routing")
    || normalized.includes("no endpoints found")
    || normalized.includes("no providers available")
    || normalized.includes("model not found")
  );
}

/** Adds the preset without modifying reasoning or any other request parameter. */
export function addOpenRouterPresetToPayload(
  payload: DynamicValue,
  presetSlug: string | undefined,
): DynamicValue {
  if (
    presetSlug === undefined
    || typeof payload !== "object"
    || payload === null
    || Array.isArray(payload)
  ) {
    return payload;
  }
  return { ...(payload as DynamicObject), preset: presetSlug };
}