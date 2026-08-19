import { describe, expect, it } from "vitest";
import type { StockItem } from "./stock";
import { urgentSummary } from "./urgent-summary";

const item = (name: string, expiry: string | null): StockItem => ({
  id: name,
  name,
  quantity: 1,
  expiry,
});

const TODAY = "2026-08-19";

describe("urgentSummary", () => {
  it("期限切れ・今日・3日以内だけを拾う", () => {
    const { urgent } = urgentSummary(
      [
        item("期限切れ", "2026-08-17"),
        item("今日", "2026-08-19"),
        item("3日後", "2026-08-22"),
        item("4日後", "2026-08-23"),
        item("期限なし", null),
      ],
      TODAY,
    );
    expect(urgent.map((i) => i.name)).toEqual(["期限切れ", "今日", "3日後"]);
  });

  it("期限切れの数を数える", () => {
    const { expiredCount } = urgentSummary(
      [item("a", "2026-08-10"), item("b", "2026-08-18"), item("c", "2026-08-20")],
      TODAY,
    );
    expect(expiredCount).toBe(2);
  });

  it("空なら何も急がない", () => {
    expect(urgentSummary([], TODAY)).toEqual({ urgent: [], expiredCount: 0 });
  });
});
