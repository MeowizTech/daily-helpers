export const MAX_OPTIONS = 20;

export const normalizeOption = (raw: string): string => raw.trim().replace(/\s+/g, " ");

export type AddResult =
  | { readonly ok: true; readonly options: string[] }
  | { readonly ok: false; readonly reason: "empty" | "duplicate" | "full" };

export const addOption = (options: readonly string[], raw: string): AddResult => {
  const value = normalizeOption(raw);
  if (value === "") return { ok: false, reason: "empty" };
  if (options.includes(value)) return { ok: false, reason: "duplicate" };
  if (options.length >= MAX_OPTIONS) return { ok: false, reason: "full" };
  return { ok: true, options: [...options, value] };
};

/** rng は 0 以上 1 未満を返すこと。テストで固定できるよう引数で受ける */
export const pick = (options: readonly string[], rng: () => number): string | null => {
  if (options.length === 0) return null;
  const index = Math.min(Math.floor(rng() * options.length), options.length - 1);
  return options[index] ?? null;
};

export const parseOptions = (raw: unknown): string[] | null => {
  if (!Array.isArray(raw)) return null;
  const seen = new Set<string>();
  for (const entry of raw) {
    if (typeof entry !== "string") continue;
    const value = normalizeOption(entry);
    if (value === "" || seen.has(value)) continue;
    seen.add(value);
  }
  return [...seen].slice(0, MAX_OPTIONS);
};
