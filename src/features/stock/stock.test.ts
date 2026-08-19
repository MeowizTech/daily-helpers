import { describe, expect, it } from "vitest";
import {
  daysUntil,
  expiryLabel,
  expiryStatus,
  parseStockItems,
  type StockItem,
  sortByUrgency,
  toDateString,
} from "./stock";

const item = (name: string, expiry: string | null, quantity = 1): StockItem => ({
  id: name,
  name,
  quantity,
  expiry,
});

const TODAY = "2026-08-19";

describe("toDateString", () => {
  it("ローカル日付をゼロ埋めして返す", () => {
    expect(toDateString(new Date(2026, 0, 5))).toBe("2026-01-05");
    expect(toDateString(new Date(2026, 11, 31))).toBe("2026-12-31");
  });
});

describe("daysUntil", () => {
  it("残り日数を数える", () => {
    expect(daysUntil("2026-08-19", TODAY)).toBe(0);
    expect(daysUntil("2026-08-22", TODAY)).toBe(3);
    expect(daysUntil("2026-08-17", TODAY)).toBe(-2);
  });

  it("月と年を跨いでも数えられる", () => {
    expect(daysUntil("2026-09-01", "2026-08-31")).toBe(1);
    expect(daysUntil("2027-01-01", "2026-12-31")).toBe(1);
  });

  it("日付として読めなければ null", () => {
    expect(daysUntil("2026/08/19", TODAY)).toBeNull();
    expect(daysUntil("", TODAY)).toBeNull();
  });
});

describe("expiryStatus", () => {
  it("残り日数から状態を決める", () => {
    expect(expiryStatus(item("卵", "2026-08-17"), TODAY)).toBe("expired");
    expect(expiryStatus(item("卵", "2026-08-19"), TODAY)).toBe("today");
    expect(expiryStatus(item("卵", "2026-08-22"), TODAY)).toBe("soon");
    expect(expiryStatus(item("卵", "2026-08-23"), TODAY)).toBe("later");
    expect(expiryStatus(item("米", null), TODAY)).toBe("none");
  });
});

describe("expiryLabel", () => {
  it("残り日数を日本語で表す", () => {
    expect(expiryLabel(item("a", "2026-08-19"), TODAY)).toBe("今日が期限");
    expect(expiryLabel(item("a", "2026-08-20"), TODAY)).toBe("明日が期限");
    expect(expiryLabel(item("a", "2026-08-18"), TODAY)).toBe("昨日が期限");
    expect(expiryLabel(item("a", "2026-08-15"), TODAY)).toBe("4日前に期限切れ");
    expect(expiryLabel(item("a", "2026-08-25"), TODAY)).toBe("あと6日");
    expect(expiryLabel(item("a", null), TODAY)).toBeNull();
  });
});

describe("sortByUrgency", () => {
  it("期限が近い順、期限なしは最後", () => {
    const sorted = sortByUrgency(
      [item("米", null), item("牛乳", "2026-08-24"), item("卵", "2026-08-17")],
      TODAY,
    );
    expect(sorted.map((i) => i.name)).toEqual(["卵", "牛乳", "米"]);
  });

  it("同じ期限なら名前順で安定させる", () => {
    const sorted = sortByUrgency(
      [item("納豆", "2026-08-20"), item("あんぱん", "2026-08-20")],
      TODAY,
    );
    expect(sorted.map((i) => i.name)).toEqual(["あんぱん", "納豆"]);
  });

  it("元の配列を書き換えない", () => {
    const source = [item("b", "2026-08-25"), item("a", "2026-08-20")];
    sortByUrgency(source, TODAY);
    expect(source.map((i) => i.name)).toEqual(["b", "a"]);
  });
});

describe("parseStockItems", () => {
  it("正しい形だけ通す", () => {
    expect(parseStockItems([{ id: "1", name: "卵", quantity: 6, expiry: "2026-08-22" }])).toEqual([
      { id: "1", name: "卵", quantity: 6, expiry: "2026-08-22" },
    ]);
  });

  it("壊れた要素は取り除く", () => {
    const parsed = parseStockItems([
      { id: "1", name: "卵", quantity: 6, expiry: null },
      { id: "2", name: "牛乳" },
      { id: "3", name: "納豆", quantity: -1, expiry: null },
      { id: "4", name: "パン", quantity: 1, expiry: "2026/08/22" },
      null,
      "壊れた値",
    ]);
    expect(parsed?.map((i) => i.name)).toEqual(["卵"]);
  });

  it("配列以外は null", () => {
    expect(parseStockItems({ items: [] })).toBeNull();
    expect(parseStockItems(null)).toBeNull();
  });
});
