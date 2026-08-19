import { expiryStatus, type StockItem } from "./stock";

export type UrgentSummary = {
  /** 期限切れ・今日・3日以内のもの（期限が近い順） */
  readonly urgent: StockItem[];
  readonly expiredCount: number;
};

export const urgentSummary = (items: readonly StockItem[], today: string): UrgentSummary => {
  const urgent = items.filter((item) => {
    const status = expiryStatus(item, today);
    return status === "expired" || status === "today" || status === "soon";
  });
  const expiredCount = urgent.filter((item) => expiryStatus(item, today) === "expired").length;
  return { urgent, expiredCount };
};
