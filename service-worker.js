self.addEventListener("install", e => {
  e.waitUntil(
    caches.open("essensliste").then(cache =>
      cache.addAll([
        "./",
        "./index.html",
        "./style.css",
        "./app.js",
        "./icon.png"
      ])
    )
  );
});
