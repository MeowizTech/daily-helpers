import { useEffect, useState } from "react";

export const ROUTES = ["menu", "unit-price", "stock", "decision"] as const;

export type Route = (typeof ROUTES)[number];

const isRoute = (value: string): value is Route => (ROUTES as readonly string[]).includes(value);

const currentRoute = (): Route => {
  const raw = window.location.hash.replace(/^#\/?/, "");
  return isRoute(raw) ? raw : "menu";
};

/**
 * 依存ゼロのハッシュルーター。
 * 4画面しかないためルーターライブラリは入れない（モバイルでの転送量を優先）。
 * ハッシュ遷移なので端末の戻るジェスチャーがそのまま効く。
 */
export const useRoute = (): Route => {
  const [route, setRoute] = useState<Route>(currentRoute);

  useEffect(() => {
    const sync = () => setRoute(currentRoute());
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  return route;
};

export const navigate = (route: Route): void => {
  window.location.hash = route === "menu" ? "/" : `/${route}`;
};

export const goBack = (): void => {
  if (window.history.length > 1) {
    window.history.back();
    return;
  }
  navigate("menu");
};
