import { useState } from "react";
import { EmptyState } from "../../components/empty-state";
import { Screen } from "../../components/screen";
import { AddStockForm } from "./add-stock-form";
import { type ExpiryStatus, expiryLabel, expiryStatus, type StockItem } from "./stock";
import type { StockStore } from "./use-stock";

const STATUS_TEXT: Record<ExpiryStatus, string> = {
  expired: "text-danger",
  today: "text-warn",
  soon: "text-warn",
  later: "text-fg-muted",
  none: "text-fg-subtle",
};

const StockRow = ({
  item,
  today,
  onChangeQuantity,
  onRemove,
}: {
  readonly item: StockItem;
  readonly today: string;
  readonly onChangeQuantity: (delta: number) => void;
  readonly onRemove: () => void;
}) => {
  const status = expiryStatus(item, today);
  const label = expiryLabel(item, today);

  return (
    <li className="flex items-center gap-3 border-b border-line py-3 last:border-0">
      {/* 期限切れだけ左端に印を出す。色だけに意味を持たせない */}
      <span
        aria-hidden="true"
        className={`w-1 self-stretch rounded-full ${
          status === "expired"
            ? "bg-danger"
            : status === "today" || status === "soon"
              ? "bg-warn"
              : "bg-transparent"
        }`}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium" title={item.name}>
          {item.name}
        </p>
        <p className={`text-xs ${STATUS_TEXT[status]}`}>{label ?? "期限なし"}</p>
      </div>

      <div className="flex shrink-0 items-center gap-0.5">
        <button
          type="button"
          onClick={() => onChangeQuantity(-1)}
          disabled={item.quantity === 0}
          aria-label={`${item.name} を1つ減らす`}
          className="flex size-9 items-center justify-center rounded-md text-fg-muted disabled:opacity-30 hover:bg-line focus-visible:outline-2 focus-visible:outline-ink"
        >
          −
        </button>
        <span className="tnum w-9 text-center text-sm font-semibold">{item.quantity}</span>
        <button
          type="button"
          onClick={() => onChangeQuantity(1)}
          aria-label={`${item.name} を1つ増やす`}
          className="flex size-9 items-center justify-center rounded-md text-fg-muted hover:bg-line focus-visible:outline-2 focus-visible:outline-ink"
        >
          ＋
        </button>
      </div>

      <button
        type="button"
        onClick={onRemove}
        aria-label={`${item.name} を削除`}
        className="flex size-9 shrink-0 items-center justify-center rounded-md text-fg-subtle hover:text-danger focus-visible:outline-2 focus-visible:outline-ink"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4">
          <path
            d="M6 6l12 12M18 6L6 18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </li>
  );
};

export const StockScreen = ({ store }: { readonly store: StockStore }) => {
  const [isAdding, setIsAdding] = useState(false);
  const { items, today, add, remove, changeQuantity } = store;

  return (
    <Screen
      title="ストック管理"
      action={
        <button
          type="button"
          onClick={() => setIsAdding((open) => !open)}
          aria-expanded={isAdding}
          className="h-11 shrink-0 px-2 text-sm font-medium text-fg-muted hover:text-fg focus-visible:outline-2 focus-visible:outline-ink"
        >
          {isAdding ? "閉じる" : "追加"}
        </button>
      }
    >
      {isAdding && (
        <AddStockForm
          onSubmit={(item) => {
            add(item);
            setIsAdding(false);
          }}
        />
      )}

      {items.length === 0 ? (
        <EmptyState>ストックはまだありません。右上の「追加」から登録できます。</EmptyState>
      ) : (
        <ul className={isAdding ? "mt-6" : ""}>
          {items.map((item) => (
            <StockRow
              key={item.id}
              item={item}
              today={today}
              onChangeQuantity={(delta) => changeQuantity(item.id, delta)}
              onRemove={() => remove(item.id)}
            />
          ))}
        </ul>
      )}
    </Screen>
  );
};
