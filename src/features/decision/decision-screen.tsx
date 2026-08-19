import { useEffect, useRef, useState } from "react";
import { Screen } from "../../components/screen";
import { MAX_OPTIONS, pick } from "./decision";
import { useOptions } from "./use-options";

const REASON_MESSAGE = {
  empty: "選択肢を入力してください。",
  duplicate: "同じ選択肢がすでにあります。",
  full: `選択肢は${MAX_OPTIONS}個までです。`,
} as const;

const SPIN_MS = 1200;

const prefersReducedMotion = (): boolean =>
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

export const DecisionScreen = () => {
  const { options, add, remove } = useOptions();
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  // 演出中にアンマウントされてもタイマーを残さない
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const spin = () => {
    const chosen = pick(options, Math.random);
    if (chosen === null) return;

    if (prefersReducedMotion()) {
      setResult(chosen);
      return;
    }

    setIsSpinning(true);
    setResult(null);
    timer.current = window.setTimeout(() => {
      setResult(chosen);
      setIsSpinning(false);
    }, SPIN_MS);
  };

  const submitDraft = () => {
    const outcome = add(draft);
    if (outcome.ok) {
      setDraft("");
      setError(null);
      return;
    }
    setError(REASON_MESSAGE[outcome.reason]);
  };

  return (
    <Screen title="決定ルーレット">
      <section
        aria-live="polite"
        className="flex min-h-40 flex-col items-center justify-center rounded-xl border border-line bg-surface px-4 py-6 text-center"
      >
        {isSpinning ? (
          <p className="text-sm text-fg-muted">考え中…</p>
        ) : result !== null ? (
          <>
            <p className="text-xs text-fg-subtle">今日はこれ</p>
            <p className="mt-1 max-w-full break-words text-4xl font-black tracking-tight">
              {result}
            </p>
          </>
        ) : (
          <p className="text-sm text-fg-muted">
            {options.length === 0
              ? "下から選択肢を追加してください。"
              : `${options.length}個の中から1つ選びます。`}
          </p>
        )}
      </section>

      <button
        type="button"
        onClick={spin}
        disabled={isSpinning || options.length === 0}
        className="mt-4 h-12 w-full rounded-lg bg-ink text-base font-semibold text-ink-fg disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
      >
        {result === null ? "決める" : "もう一度"}
      </button>

      <div className="mt-8">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xs font-semibold text-fg-muted">選択肢</h2>
          <span className="tnum text-xs text-fg-subtle">
            {options.length} / {MAX_OPTIONS}
          </span>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            submitDraft();
          }}
          className="mt-2 flex gap-2"
        >
          <input
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value);
              setError(null);
            }}
            placeholder="そば"
            enterKeyHint="done"
            aria-invalid={error !== null}
            className="h-11 min-w-0 flex-1 rounded-lg border border-line bg-surface px-3 text-base outline-none focus:border-ink placeholder:text-fg-subtle"
          />
          <button
            type="submit"
            className="h-11 shrink-0 rounded-lg border border-line px-4 text-sm font-medium hover:bg-line focus-visible:outline-2 focus-visible:outline-ink"
          >
            追加
          </button>
        </form>
        {error !== null && <p className="mt-2 text-xs text-danger">{error}</p>}

        <ul className="mt-3 flex flex-wrap gap-2">
          {options.map((option) => (
            <li key={option}>
              <span className="flex items-center gap-1 rounded-full border border-line py-1 pr-1 pl-3">
                <span className="max-w-40 truncate text-sm" title={option}>
                  {option}
                </span>
                <button
                  type="button"
                  onClick={() => remove(option)}
                  aria-label={`${option} を削除`}
                  className="flex size-7 items-center justify-center rounded-full text-fg-subtle hover:text-danger focus-visible:outline-2 focus-visible:outline-ink"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true" className="size-3.5">
                    <path
                      d="M6 6l12 12M18 6L6 18"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Screen>
  );
};
