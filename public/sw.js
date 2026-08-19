// 依存ゼロの軽量 Service Worker。
// ビルド成果物のハッシュ名に依存しないよう、precache ではなく実行時キャッシュで組む。
const CACHE = "daily-helpers-v1";
const BASE = new URL("./", self.location.href).pathname;
const SHELL = BASE;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll([SHELL, `${BASE}manifest.webmanifest`, `${BASE}icon.svg`])),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) return;

  // 画面遷移: 新しい HTML を優先し、オフライン時はキャッシュしたシェルを返す
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          caches.open(CACHE).then((cache) => cache.put(SHELL, res.clone()));
          return res;
        })
        .catch(() => caches.match(SHELL).then((hit) => hit ?? Response.error())),
    );
    return;
  }

  // 静的アセット: ハッシュ付きなのでキャッシュ優先で問題ない
  event.respondWith(
    caches.match(request).then((hit) => {
      if (hit) return hit;
      return fetch(request).then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
        }
        return res;
      });
    }),
  );
});
