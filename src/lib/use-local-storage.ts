import { useCallback, useEffect, useRef, useState } from "react";

/**
 * localStorage に同期する useState。
 * プライベートブラウジングや容量超過で localStorage が使えない環境でも
 * 「保存されないだけ」で動き続けるよう、読み書きは常に失敗を許容する。
 */
export const useLocalStorage = <T>(
  key: string,
  fallback: T,
  parse: (raw: unknown) => T | null,
): [T, (next: T) => void] => {
  const parseRef = useRef(parse);
  parseRef.current = parse;

  const [value, setValue] = useState<T>(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null) return fallback;
      const parsed = parseRef.current(JSON.parse(raw));
      return parsed ?? fallback;
    } catch {
      return fallback;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // 保存できなくても操作は継続させる
    }
  }, [key, value]);

  const update = useCallback((next: T) => setValue(next), []);

  return [value, update];
};
