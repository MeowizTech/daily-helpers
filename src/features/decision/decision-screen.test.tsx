import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DecisionScreen } from "./decision-screen";

// 演出の待ち時間を挟まず結果を確認したいので、毎回 reduce 扱いにする
beforeEach(() => {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: query.includes("prefers-reduced-motion"),
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  }));
});

describe("DecisionScreen", () => {
  it("初期状態では候補の数を示す", () => {
    render(<DecisionScreen />);
    expect(screen.getByText("4個の中から1つ選びます。")).toBeInTheDocument();
    expect(screen.getByText("4 / 20")).toBeInTheDocument();
  });

  it("決めると候補のどれかが結果になる", async () => {
    const user = userEvent.setup();
    render(<DecisionScreen />);
    await user.click(screen.getByRole("button", { name: "決める" }));

    expect(screen.getByText("今日はこれ")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "もう一度" })).toBeInTheDocument();
  });

  it("重複した候補は理由付きで弾く", async () => {
    const user = userEvent.setup();
    render(<DecisionScreen />);
    await user.type(screen.getByPlaceholderText("そば"), "和食");
    await user.click(screen.getByRole("button", { name: "追加" }));

    expect(screen.getByText("同じ選択肢がすでにあります。")).toBeInTheDocument();
    expect(screen.getByText("4 / 20")).toBeInTheDocument();
  });

  it("空白のみの候補は弾く", async () => {
    const user = userEvent.setup();
    render(<DecisionScreen />);
    await user.type(screen.getByPlaceholderText("そば"), "   ");
    await user.click(screen.getByRole("button", { name: "追加" }));
    expect(screen.getByText("選択肢を入力してください。")).toBeInTheDocument();
  });

  it("候補を追加・削除できる", async () => {
    const user = userEvent.setup();
    render(<DecisionScreen />);

    await user.type(screen.getByPlaceholderText("そば"), "カレー");
    await user.click(screen.getByRole("button", { name: "追加" }));
    expect(screen.getByText("5 / 20")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "カレー を削除" }));
    expect(screen.getByText("4 / 20")).toBeInTheDocument();
  });

  it("候補を全部消すと決めるボタンが無効になる", async () => {
    const user = userEvent.setup();
    render(<DecisionScreen />);
    for (const name of ["中華", "和食", "イタリアン", "コンビニ"]) {
      await user.click(screen.getByRole("button", { name: `${name} を削除` }));
    }
    expect(screen.getByRole("button", { name: "決める" })).toBeDisabled();
    expect(screen.getByText(/下から選択肢を追加してください/)).toBeInTheDocument();
  });

  it("追加した候補は localStorage に残る", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<DecisionScreen />);
    await user.type(screen.getByPlaceholderText("そば"), "うどん");
    await user.click(screen.getByRole("button", { name: "追加" }));
    unmount();

    render(<DecisionScreen />);
    expect(screen.getByText("うどん")).toBeInTheDocument();
  });
});
