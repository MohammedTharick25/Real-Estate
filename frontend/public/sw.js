// public/sw.js
self.addEventListener("install", (event) => {
  console.log("Service Worker installed");
});

self.addEventListener("fetch", (event) => {
  // This allows the app to work offline or from cache if you add logic here later
  event.respondWith(fetch(event.request));
});
