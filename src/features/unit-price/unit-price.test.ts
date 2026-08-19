import { describe, expect, it } from "vitest";
import { compare, formatYen, parsePositive, unitPrice } from "./unit-price";

describe("parsePositive", () => {
  it("半角の数値をそのまま読む", () => {
    expect(parsePositive("450")).toBe(450);
    expect(parsePositive("12.5")).toBe(12.5);
  });

  it("全角数字と桁区切りを正規化する", () => {
    expect(parsePositive("４５０")).toBe(450);
    expect(parsePositive("1,280")).toBe(1280);
    expect(parsePositive("１２．５")).toBe(12.5);
    expect(parsePositive(" 300 ")).toBe(300);
  });

  it("単価計算に使えない入力は null", () => {
    expect(parsePositive("")).toBeNull();
    expect(parsePositive("0")).toBeNull();
    expect(parsePositive("-100")).toBeNull();
    expect(parsePositive("abc")).toBeNull();
    expect(parsePositive("Infinity")).toBeNull();
  });
});

describe("unitPrice", () => {
  it("100 単位あたりに換算する", () => {
    expect(unitPrice(450, 200)).toBe(225);
    expect(unitPrice(100, 1000)).toBe(10);
  });
});

describe("compare", () => {
  it("4つ揃うまでは incomplete", () => {
    expect(compare({ price: "450", amount: "200" }, { price: "", amount: "" }).kind).toBe(
      "incomplete",
    );
    expect(compare({ price: "450", amount: "0" }, { price: "300", amount: "100" }).kind).toBe(
      "incomplete",
    );
  });

  it("単価が安い方を割安率つきで返す", () => {
    const result = compare({ price: "200", amount: "100" }, { price: "500", amount: "200" });
    expect(result).toMatchObject({ kind: "ready", cheaper: "a", unitA: 200, unitB: 250 });
    if (result.kind === "ready") expect(result.savingPercent).toBeCloseTo(20);
  });

  it("Bが安いケースも判定できる", () => {
    const result = compare({ price: "500", amount: "200" }, { price: "200", amount: "100" });
    expect(result).toMatchObject({ kind: "ready", cheaper: "b" });
  });

  it("同単価は tie で割安率0", () => {
    const result = compare({ price: "100", amount: "50" }, { price: "400", amount: "200" });
    expect(result).toMatchObject({ kind: "ready", cheaper: "tie", savingPercent: 0 });
  });

  it("極端に安い大容量でも壊れない", () => {
    const result = compare({ price: "1", amount: "999999" }, { price: "999999", amount: "1" });
    expect(result.kind).toBe("ready");
    if (result.kind === "ready") expect(result.cheaper).toBe("a");
  });
});

describe("formatYen", () => {
  it("桁数に応じて小数を出し分ける", () => {
    expect(formatYen(1280)).toBe("1,280");
    expect(formatYen(99.44)).toBe("99.4");
    expect(formatYen(0.83)).toBe("0.83");
  });
});
