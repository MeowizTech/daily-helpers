import { useState } from "react";
import { Field } from "../../components/field";
import type { StockItem } from "./stock";

type AddStockFormProps = {
  readonly onSubmit: (item: Omit<StockItem, "id">) => void;
};

export const AddStockForm = ({ onSubmit }: AddStockFormProps) => {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [expiry, setExpiry] = useState("");

  const trimmedName = name.trim();
  const parsedQuantity = Number.parseInt(quantity, 10);
  const validQuantity =
    Number.isInteger(parsedQuantity) && parsedQuantity >= 0 ? parsedQuantity : 1;
  const canSubmit = trimmedName !== "";

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (!canSubmit) return;
        onSubmit({
          name: trimmedName,
          quantity: validQuantity,
          expiry: expiry === "" ? null : expiry,
        });
        setName("");
        setQuantity("1");
        setExpiry("");
      }}
      className="rounded-xl border border-line bg-surface p-4"
    >
      <div className="space-y-3">
        <Field label="品目" value={name} onChange={setName} placeholder="卵" />
        <div className="flex gap-3">
          <div className="w-24">
            <Field label="個数" value={quantity} onChange={setQuantity} inputMode="numeric" />
          </div>
          <label className="block flex-1">
            <span className="text-xs text-fg-muted">賞味期限（任意）</span>
            <span className="mt-1 flex rounded-lg border border-line bg-surface px-3 focus-within:border-ink">
              <input
                type="date"
                value={expiry}
                onChange={(event) => setExpiry(event.target.value)}
                className="tnum h-11 w-full min-w-0 bg-transparent text-base outline-none"
              />
            </span>
          </label>
        </div>
      </div>

      <button
        type="submit"
        disabled={!canSubmit}
        className="mt-4 h-11 w-full rounded-lg bg-ink text-sm font-semibold text-ink-fg disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
      >
        追加する
      </button>
    </form>
  );
};
