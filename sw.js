const CACHE = "jacverse-offline";
const CORE = ["./", "index.html", "style.css", "script.js", "manifest.json", "icon-192.png", "icon-512.png", "icon-maskable-512.png", "data-class10.json", "data-class9-civics-book.json", "data-class9-economics-book.json", "data-class9-english-beehive-book.json", "data-class9-english-moments-book.json", "data-class9-geography-book.json", "data-class9-hindi-kritika-book.json", "data-class9-hindi-kshitij-book.json", "data-class9-history-book.json", "data-class9-maths-book.json", "data-class9-science-book.json", "data-class9.json", "data-formula-math.json", "data-formula-science.json", "data-site.json"];
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => Promise.all(CORE.map((u) => c.add(u).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
// Online: hamesha latest file. Offline: phone mein save ki hui file.
self.addEventListener("fetch", (e) => {
  const r = e.request;
  if (r.method !== "GET" || new URL(r.url).origin !== location.origin) return;
  e.respondWith(
    fetch(r).then((res) => { if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(r, copy)); } return res; })
      .catch(() => caches.match(r).then((x) => x || (r.mode === "navigate" ? caches.match("index.html") : Response.error())))
  );
});
