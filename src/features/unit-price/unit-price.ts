/** 全角数字・桁区切り・空白を許容して半角の数値文字列に寄せる */
const normalizeNumeric = (raw: string): string =>
  raw
    .replace(/[０-９．]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 0xfee0))
    .replace(/[,，、\s]/g, "");

/** 単価計算に使える正の数だけ通す。それ以外は null */
export const parsePositive = (raw: string): number | null => {
  const normalized = normalizeNumeric(raw);
  if (normalized === "") return null;
  const value = Number(normalized);
  if (!Number.isFinite(value) || value <= 0) return null;
  return value;
};

export type ProductInput = {
  readonly price: string;
  readonly amount: string;
};

export type Comparison =
  | { readonly kind: "incomplete" }
  | {
      readonly kind: "ready";
      readonly unitA: number;
      readonly unitB: number;
      readonly cheaper: "a" | "b" | "tie";
      /** 高い方を基準にした割安率（%）。同額なら 0 */
      readonly savingPercent: number;
    };

/** 100g / 100ml あたりの価格 */
export const unitPrice = (price: number, amount: number): number => (price / amount) * 100;

export const compare = (a: ProductInput, b: ProductInput): Comparison => {
  const priceA = parsePositive(a.price);
  const amountA = parsePositive(a.amount);
  const priceB = parsePositive(b.price);
  const amountB = parsePositive(b.amount);

  if (priceA === null || amountA === null || priceB === null || amountB === null) {
    return { kind: "incomplete" };
  }

  const unitA = unitPrice(priceA, amountA);
  const unitB = unitPrice(priceB, amountB);

  if (unitA === unitB) {
    return { kind: "ready", unitA, unitB, cheaper: "tie", savingPercent: 0 };
  }

  const cheaper = unitA < unitB ? "a" : "b";
  const higher = Math.max(unitA, unitB);
  const lower = Math.min(unitA, unitB);
  return {
    kind: "ready",
    unitA,
    unitB,
    cheaper,
    savingPercent: ((higher - lower) / higher) * 100,
  };
};

/** 桁数に応じて小数を出し分ける（¥1,280 と ¥0.8 が同じ体裁で並ぶのを避ける） */
export const formatYen = (value: number): string => {
  const digits = value >= 100 ? 0 : value >= 10 ? 1 : 2;
  return value.toLocaleString("ja-JP", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
};
