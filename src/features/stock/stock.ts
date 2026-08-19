export type StockItem = {
  readonly id: string;
  readonly name: string;
  readonly quantity: number;
  /** YYYY-MM-DD。タイムゾーンに依存させないため Date ではなく日付文字列で持つ */
  readonly expiry: string | null;
};

export type ExpiryStatus = "expired" | "today" | "soon" | "later" | "none";

/** soon と扱う日数（今日から何日以内か） */
const SOON_WITHIN_DAYS = 3;

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const toDateString = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;

const toUtcDays = (dateString: string): number | null => {
  if (!DATE_PATTERN.test(dateString)) return null;
  const [year, month, day] = dateString.split("-").map(Number);
  if (year === undefined || month === undefined || day === undefined) return null;
  const ms = Date.UTC(year, month - 1, day);
  if (Number.isNaN(ms)) return null;
  return ms / 86_400_000;
};

/** 期限までの残り日数。今日なら 0、過去なら負。日付として読めなければ null */
export const daysUntil = (expiry: string, today: string): number | null => {
  const target = toUtcDays(expiry);
  const base = toUtcDays(today);
  if (target === null || base === null) return null;
  return target - base;
};

export const expiryStatus = (item: StockItem, today: string): ExpiryStatus => {
  if (item.expiry === null) return "none";
  const remaining = daysUntil(item.expiry, today);
  if (remaining === null) return "none";
  if (remaining < 0) return "expired";
  if (remaining === 0) return "today";
  if (remaining <= SOON_WITHIN_DAYS) return "soon";
  return "later";
};

/** 期限が近いものを上に。期限なしは最後。同日は名前順で並びを安定させる */
export const sortByUrgency = (items: readonly StockItem[], today: string): StockItem[] =>
  [...items].sort((left, right) => {
    const a = left.expiry === null ? null : daysUntil(left.expiry, today);
    const b = right.expiry === null ? null : daysUntil(right.expiry, today);
    if (a === null && b === null) return left.name.localeCompare(right.name, "ja");
    if (a === null) return 1;
    if (b === null) return -1;
    if (a !== b) return a - b;
    return left.name.localeCompare(right.name, "ja");
  });

export const expiryLabel = (item: StockItem, today: string): string | null => {
  if (item.expiry === null) return null;
  const remaining = daysUntil(item.expiry, today);
  if (remaining === null) return null;
  if (remaining < -1) return `${Math.abs(remaining)}日前に期限切れ`;
  if (remaining === -1) return "昨日が期限";
  if (remaining === 0) return "今日が期限";
  if (remaining === 1) return "明日が期限";
  return `あと${remaining}日`;
};

/** localStorage から読んだ未知の値を StockItem[] に絞り込む */
export const parseStockItems = (raw: unknown): StockItem[] | null => {
  if (!Array.isArray(raw)) return null;
  const items: StockItem[] = [];
  for (const entry of raw) {
    if (typeof entry !== "object" || entry === null) continue;
    const candidate = entry as Record<string, unknown>;
    const { id, name, quantity, expiry } = candidate;
    if (typeof id !== "string" || typeof name !== "string") continue;
    if (typeof quantity !== "number" || !Number.isInteger(quantity) || quantity < 0) continue;
    if (expiry !== null && (typeof expiry !== "string" || !DATE_PATTERN.test(expiry))) continue;
    items.push({ id, name, quantity, expiry: expiry as string | null });
  }
  return items;
};

export const createId = (): string =>
  globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
