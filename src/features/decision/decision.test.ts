import { describe, expect, it } from "vitest";
import { addOption, MAX_OPTIONS, normalizeOption, parseOptions, pick } from "./decision";

describe("normalizeOption", () => {
  it("前後の空白を落とし連続空白を1つにまとめる", () => {
    expect(normalizeOption("  カレー  ")).toBe("カレー");
    expect(normalizeOption("味噌    ラーメン")).toBe("味噌 ラーメン");
    expect(normalizeOption("   ")).toBe("");
  });
});

describe("addOption", () => {
  it("正規化して追加する", () => {
    expect(addOption(["和食"], " 中華 ")).toEqual({ ok: true, options: ["和食", "中華"] });
  });

  it("空白のみは追加しない", () => {
    expect(addOption([], "   ")).toEqual({ ok: false, reason: "empty" });
  });

  it("正規化後に一致するものは重複扱い", () => {
    expect(addOption(["味噌 ラーメン"], "味噌   ラーメン")).toEqual({
      ok: false,
      reason: "duplicate",
    });
  });

  it("上限を超えたら追加しない", () => {
    const full = Array.from({ length: MAX_OPTIONS }, (_, i) => `候補${i}`);
    expect(addOption(full, "もう一つ")).toEqual({ ok: false, reason: "full" });
  });

  it("元の配列を書き換えない", () => {
    const source = ["和食"];
    addOption(source, "中華");
    expect(source).toEqual(["和食"]);
  });
});

describe("pick", () => {
  it("rng の値に応じた要素を返す", () => {
    const options = ["A", "B", "C"];
    expect(pick(options, () => 0)).toBe("A");
    expect(pick(options, () => 0.5)).toBe("B");
    expect(pick(options, () => 0.99)).toBe("C");
  });

  it("rng が 1 を返しても範囲外にならない", () => {
    expect(pick(["A", "B"], () => 1)).toBe("B");
  });

  it("空なら null", () => {
    expect(pick([], () => 0)).toBeNull();
  });
});

describe("parseOptions", () => {
  it("文字列以外と重複を落とす", () => {
    expect(parseOptions(["和食", "和食", 42, "", "  中華  ", null])).toEqual(["和食", "中華"]);
  });

  it("上限で切る", () => {
    const many = Array.from({ length: MAX_OPTIONS + 5 }, (_, i) => `候補${i}`);
    expect(parseOptions(many)).toHaveLength(MAX_OPTIONS);
  });

  it("配列以外は null", () => {
    expect(parseOptions("和食")).toBeNull();
  });
});
