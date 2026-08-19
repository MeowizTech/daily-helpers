import type { ReactNode } from "react";
import { goBack } from "../lib/router";

type ScreenProps = {
  readonly title: string;
  readonly action?: ReactNode;
  readonly children: ReactNode;
};

export const Screen = ({ title, action, children }: ScreenProps) => (
  <div className="min-h-dvh bg-bg">
    <header className="sticky top-0 z-10 border-b border-line bg-bg/90 pt-safe backdrop-blur">
      <div className="mx-auto flex h-12 max-w-2xl items-center gap-1 px-2">
        <button
          type="button"
          onClick={goBack}
          aria-label="メニューに戻る"
          className="-ml-1 flex size-11 items-center justify-center rounded-lg text-fg-muted hover:text-fg focus-visible:outline-2 focus-visible:outline-ink"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5">
            <path
              d="M15 5l-7 7 7 7"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <h1 className="min-w-0 flex-1 truncate text-[15px] font-semibold">{title}</h1>
        {action}
      </div>
    </header>
    <main className="mx-auto max-w-2xl px-4 pt-5 pb-safe">{children}</main>
  </div>
);
