import { useState } from "react";
import { Field } from "../../components/field";
import { Screen } from "../../components/screen";
import { type Comparison, compare, formatYen, type ProductInput } from "./unit-price";

const EMPTY: ProductInput = { price: "", amount: "" };

const Verdict = ({ result }: { readonly result: Comparison }) => {
  if (result.kind === "incomplete") {
    return (
      <p className="text-sm text-fg-muted">
        4つの欄が埋まると、100あたりの価格で比べた結果が出ます。
      </p>
    );
  }

  if (result.cheaper === "tie") {
    return <p className="text-2xl font-bold">どちらも同じ</p>;
  }

  const name = result.cheaper === "a" ? "商品A" : "商品B";
  return (
    <p className="text-3xl font-bold tracking-tight">
      {name} が<span className="tnum text-ok"> {result.savingPercent.toFixed(0)}% </span>
      割安
    </p>
  );
};

const UnitRow = ({
  label,
  unit,
  isCheaper,
}: {
  readonly label: string;
  readonly unit: number;
  readonly isCheaper: boolean;
}) => (
  <div className="flex items-baseline justify-between">
    <span className="text-sm text-fg-muted">{label}</span>
    <span className={`tnum text-base ${isCheaper ? "font-semibold text-ok" : "text-fg"}`}>
      {formatYen(unit)} 円
    </span>
  </div>
);

export const UnitPriceScreen = () => {
  const [a, setA] = useState<ProductInput>(EMPTY);
  const [b, setB] = useState<ProductInput>(EMPTY);
  const result = compare(a, b);

  const reset = () => {
    setA(EMPTY);
    setB(EMPTY);
  };

  const isDirty = [a.price, a.amount, b.price, b.amount].some((value) => value !== "");

  return (
    <Screen
      title="買い物比較"
      action={
        isDirty ? (
          <button
            type="button"
            onClick={reset}
            className="h-11 shrink-0 px-2 text-sm text-fg-muted hover:text-fg focus-visible:outline-2 focus-visible:outline-ink"
          >
            クリア
          </button>
        ) : undefined
      }
    >
      {/* 結論を先頭に置く。買い物中に見たいのは単価そのものより「どちらを取るか」 */}
      <section
        aria-live="polite"
        className="rounded-xl border border-line bg-surface px-4 py-5 min-h-28 flex flex-col justify-center"
      >
        <Verdict result={result} />
        {result.kind === "ready" && (
          <div className="mt-4 space-y-1 border-t border-line pt-3">
            <UnitRow label="商品A / 100" unit={result.unitA} isCheaper={result.cheaper === "a"} />
            <UnitRow label="商品B / 100" unit={result.unitB} isCheaper={result.cheaper === "b"} />
          </div>
        )}
      </section>

      <div className="mt-6 space-y-4">
        {(
          [
            ["商品A", a, setA],
            ["商品B", b, setB],
          ] as const
        ).map(([label, value, setValue]) => (
          <fieldset key={label} className="rounded-xl border border-line px-4 py-3">
            <legend className="px-1 text-xs font-semibold text-fg-muted">{label}</legend>
            <div className="flex gap-3">
              <div className="flex-1">
                <Field
                  label="価格"
                  value={value.price}
                  onChange={(price) => setValue({ ...value, price })}
                  placeholder="450"
                  inputMode="decimal"
                  suffix="円"
                />
              </div>
              <div className="flex-1">
                <Field
                  label="量"
                  value={value.amount}
                  onChange={(amount) => setValue({ ...value, amount })}
                  placeholder="200"
                  inputMode="decimal"
                  suffix="g / ml"
                />
              </div>
            </div>
          </fieldset>
        ))}
      </div>

      <p className="mt-3 text-xs text-fg-subtle">
        2つの「量」は同じ単位で入れてください。g と ml が混ざると比較になりません。
      </p>
    </Screen>
  );
};
