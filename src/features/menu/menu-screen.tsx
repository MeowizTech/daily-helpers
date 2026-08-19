import { navigate, type Route } from "../../lib/router";
import { expiryLabel, expiryStatus } from "../stock/stock";
import { urgentSummary } from "../stock/urgent-summary";
import type { StockStore } from "../stock/use-stock";

const TOOLS: readonly { route: Route; title: string; hint: string }[] = [
  { route: "unit-price", title: "買い物比較", hint: "100あたりの価格でどちらが安いか" },
  { route: "stock", title: "ストック管理", hint: "家にある物と期限" },
  { route: "decision", title: "決定ルーレット", hint: "候補から1つ選ぶ" },
];

/**
 * 主役はツール一覧ではなく「期限が迫っているストック」。
 * 3機能のうち時間で状況が変わるのはストックだけなので、そこだけ先に出す。
 */
const UrgentBlock = ({ store }: { readonly store: StockStore }) => {
  const { urgent, expiredCount } = urgentSummary(store.items, store.today);

  if (urgent.length === 0) {
    return <p className="mt-6 text-sm text-fg-muted">期限が近いストックはありません。</p>;
  }

  const head = urgent[0];
  if (head === undefined) return null;
  const isExpired = expiryStatus(head, store.today) === "expired";

  return (
    <button
      type="button"
      onClick={() => navigate("stock")}
      className="mt-6 w-full rounded-xl border border-line bg-surface px-4 py-5 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
    >
      <p className={`text-xs font-semibold ${isExpired ? "text-danger" : "text-warn"}`}>
        {expiredCount > 0 ? `期限切れ ${expiredCount} 件` : "期限が近い"}
      </p>
      <p className="mt-1 truncate text-2xl font-bold tracking-tight" title={head.name}>
        {head.name}
      </p>
      <p className={`text-sm ${isExpired ? "text-danger" : "text-warn"}`}>
        {expiryLabel(head, store.today)}
      </p>
      {urgent.length > 1 && (
        <p className="mt-3 truncate border-t border-line pt-2 text-xs text-fg-muted">
          ほかに{urgent.length - 1}件
          {urgent
            .slice(1, 4)
            .map((item) => `・${item.name}`)
            .join("")}
          {urgent.length > 4 ? " …" : ""}
        </p>
      )}
    </button>
  );
};

export const MenuScreen = ({ store }: { readonly store: StockStore }) => (
  <div className="min-h-dvh bg-bg">
    <div className="mx-auto max-w-2xl px-4 pt-safe pb-safe">
      <h1 className="pt-8 text-sm font-semibold tracking-wide text-fg-muted">Daily Helpers</h1>

      <UrgentBlock store={store} />

      <nav className="mt-10">
        <h2 className="text-xs font-semibold text-fg-muted">道具</h2>
        <ul className="mt-1">
          {TOOLS.map((tool) => (
            <li key={tool.route}>
              <button
                type="button"
                onClick={() => navigate(tool.route)}
                className="flex w-full items-center gap-3 border-b border-line py-4 text-left last:border-0 focus-visible:outline-2 focus-visible:outline-ink"
              >
                <span className="min-w-0 flex-1">
                  <span className="block font-medium">{tool.title}</span>
                  <span className="block text-xs text-fg-subtle">{tool.hint}</span>
                </span>
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="size-4 shrink-0 text-fg-subtle"
                >
                  <path
                    d="M9 5l7 7-7 7"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  </div>
);
