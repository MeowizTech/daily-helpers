import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { type StockItem, toDateString } from "../stock/stock";
import type { StockStore } from "../stock/use-stock";
import { MenuScreen } from "./menu-screen";

const day = (offset: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return toDateString(date);
};

const storeWith = (items: StockItem[]): StockStore => ({
  items,
  today: toDateString(new Date()),
  add: () => {},
  remove: () => {},
  changeQuantity: () => {},
});

const item = (name: string, expiry: string | null): StockItem => ({
  id: name,
  name,
  quantity: 1,
  expiry,
});

describe("MenuScreen", () => {
  it("3つの道具を並べる", () => {
    render(<MenuScreen store={storeWith([])} />);
    for (const title of ["買い物比較", "ストック管理", "決定ルーレット"]) {
      expect(screen.getByRole("button", { name: new RegExp(title) })).toBeInTheDocument();
    }
  });

  it("急ぐものが無ければ主役枠を出さない", () => {
    render(<MenuScreen store={storeWith([item("米", null), item("醤油", day(30))])} />);
    expect(screen.getByText("期限が近いストックはありません。")).toBeInTheDocument();
  });

  it("期限が近いものを主役として先頭に出す", () => {
    render(<MenuScreen store={storeWith([item("牛乳", day(1))])} />);
    expect(screen.getByText("期限が近い")).toBeInTheDocument();
    expect(screen.getByText("牛乳")).toBeInTheDocument();
    expect(screen.getByText("明日が期限")).toBeInTheDocument();
  });

  it("期限切れがあれば件数を示す", () => {
    render(<MenuScreen store={storeWith([item("卵", day(-1)), item("豆腐", day(-3))])} />);
    expect(screen.getByText("期限切れ 2 件")).toBeInTheDocument();
  });

  it("急ぐものが複数あれば残りの件数と名前を添える", () => {
    render(
      <MenuScreen
        store={storeWith([item("卵", day(0)), item("牛乳", day(1)), item("納豆", day(2))])}
      />,
    );
    expect(screen.getByText(/ほかに2件・牛乳・納豆/)).toBeInTheDocument();
  });
});
