import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { UnitPriceScreen } from "./unit-price-screen";

const fill = async (values: readonly [string, string, string, string]) => {
  const user = userEvent.setup();
  const prices = screen.getAllByPlaceholderText("450");
  const amounts = screen.getAllByPlaceholderText("200");
  await user.type(prices[0] as HTMLElement, values[0]);
  await user.type(amounts[0] as HTMLElement, values[1]);
  await user.type(prices[1] as HTMLElement, values[2]);
  await user.type(amounts[1] as HTMLElement, values[3]);
};

describe("UnitPriceScreen", () => {
  it("未入力ではやることを案内する", () => {
    render(<UnitPriceScreen />);
    expect(screen.getByText(/4つの欄が埋まると/)).toBeInTheDocument();
  });

  it("入力が揃うと割安な方と単価を出す", async () => {
    render(<UnitPriceScreen />);
    await fill(["200", "100", "500", "200"]);

    expect(screen.getByText(/商品A が/)).toBeInTheDocument();
    expect(screen.getByText("20%")).toBeInTheDocument();
    expect(screen.getByText("200 円")).toBeInTheDocument();
    expect(screen.getByText("250 円")).toBeInTheDocument();
  });

  it("全角数字でも計算できる", async () => {
    render(<UnitPriceScreen />);
    await fill(["２００", "１００", "５００", "２００"]);
    expect(screen.getByText(/商品A が/)).toBeInTheDocument();
  });

  it("量が0なら結果を出さない", async () => {
    render(<UnitPriceScreen />);
    await fill(["200", "0", "500", "200"]);
    expect(screen.getByText(/4つの欄が埋まると/)).toBeInTheDocument();
  });

  it("同単価は引き分けとして示す", async () => {
    render(<UnitPriceScreen />);
    await fill(["100", "50", "400", "200"]);
    expect(screen.getByText("どちらも同じ")).toBeInTheDocument();
  });

  it("クリアは入力があるときだけ出て、押すと初期状態に戻る", async () => {
    const user = userEvent.setup();
    render(<UnitPriceScreen />);
    expect(screen.queryByRole("button", { name: "クリア" })).not.toBeInTheDocument();

    await fill(["200", "100", "500", "200"]);
    await user.click(screen.getByRole("button", { name: "クリア" }));

    expect(screen.getByText(/4つの欄が埋まると/)).toBeInTheDocument();
    expect(screen.getAllByPlaceholderText("450")[0]).toHaveValue("");
  });
});
