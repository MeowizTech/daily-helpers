import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { type StockItem, toDateString } from "./stock";
import { StockScreen } from "./stock-screen";
import type { StockStore } from "./use-stock";

const day = (offset: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return toDateString(date);
};

/** 本番と同じ操作の流れを再現する軽量ストア */
const Harness = ({ initial }: { readonly initial: StockItem[] }) => {
  const [items, setItems] = useState(initial);
  const store: StockStore = {
    items,
    today: toDateString(new Date()),
    add: (item) => setItems((current) => [...current, { ...item, id: `id-${current.length}` }]),
    remove: (id) => setItems((current) => current.filter((item) => item.id !== id)),
    changeQuantity: (id, delta) =>
      setItems((current) =>
        current.map((item) =>
          item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item,
        ),
      ),
  };
  return <StockScreen store={store} />;
};

const item = (over: Partial<StockItem> = {}): StockItem => ({
  id: "1",
  name: "卵",
  quantity: 6,
  expiry: day(3),
  ...over,
});

describe("StockScreen", () => {
  it("0件なら次の操作を案内する", () => {
    render(<Harness initial={[]} />);
    expect(screen.getByText(/ストックはまだありません/)).toBeInTheDocument();
  });

  it("期限までの残り日数を日本語で出す", () => {
    render(
      <Harness
        initial={[
          item({ id: "a", name: "今日のもの", expiry: day(0) }),
          item({ id: "b", name: "切れたもの", expiry: day(-2) }),
          item({ id: "c", name: "期限なしのもの", expiry: null }),
        ]}
      />,
    );
    expect(screen.getByText("今日が期限")).toBeInTheDocument();
    expect(screen.getByText("2日前に期限切れ")).toBeInTheDocument();
    expect(screen.getByText("期限なし")).toBeInTheDocument();
  });

  it("長い品目名でも title 属性で全文を残す", () => {
    const longName = "業務用ホールトマト缶詰カットタイプ2800グラム×6缶セット";
    render(<Harness initial={[item({ name: longName })]} />);
    expect(screen.getByTitle(longName)).toHaveTextContent(longName);
  });

  it("同名の品目が複数あっても別々に扱える", () => {
    render(
      <Harness
        initial={[
          item({ id: "a", name: "牛乳", quantity: 1 }),
          item({ id: "b", name: "牛乳", quantity: 2 }),
        ]}
      />,
    );
    expect(screen.getAllByText("牛乳")).toHaveLength(2);
  });

  it("個数を増減でき、0未満にはならない", async () => {
    const user = userEvent.setup();
    render(<Harness initial={[item({ quantity: 1 })]} />);

    await user.click(screen.getByRole("button", { name: "卵 を1つ増やす" }));
    expect(screen.getByText("2")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "卵 を1つ減らす" }));
    await user.click(screen.getByRole("button", { name: "卵 を1つ減らす" }));
    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "卵 を1つ減らす" })).toBeDisabled();
  });

  it("削除すると一覧から消える", async () => {
    const user = userEvent.setup();
    render(<Harness initial={[item()]} />);
    await user.click(screen.getByRole("button", { name: "卵 を削除" }));
    expect(screen.getByText(/ストックはまだありません/)).toBeInTheDocument();
  });

  it("追加フォームから登録できる", async () => {
    const user = userEvent.setup();
    render(<Harness initial={[]} />);

    await user.click(screen.getByRole("button", { name: "追加" }));
    await user.type(screen.getByPlaceholderText("卵"), "食パン");
    await user.click(screen.getByRole("button", { name: "追加する" }));

    expect(screen.getByText("食パン")).toBeInTheDocument();
    // 登録後はフォームを閉じる
    expect(screen.queryByRole("button", { name: "追加する" })).not.toBeInTheDocument();
  });

  it("品目名が空のままでは登録できない", async () => {
    const user = userEvent.setup();
    render(<Harness initial={[]} />);
    await user.click(screen.getByRole("button", { name: "追加" }));
    expect(screen.getByRole("button", { name: "追加する" })).toBeDisabled();
  });
});
