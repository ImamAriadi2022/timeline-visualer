const CACHE_NAME = "timeline-visualizer-v1";
const OFFLINE_URLS = ["/", "/manifest.json", "/icons/icon-192x192.png", "/icons/icon-512x512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(OFFLINE_URLS).catch(() => {});
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Helper to store shared file content in IndexedDB from Service Worker
function storeSharedFileInIdb(fileText) {
  return new Promise((resolve) => {
    try {
      const request = indexedDB.open("timeline_db", 1);
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains("datasets")) {
          db.createObjectStore("datasets");
        }
        if (!db.objectStoreNames.contains("share_target")) {
          db.createObjectStore("share_target");
        }
      };
      request.onsuccess = (e) => {
        const db = e.target.result;
        try {
          if (!db.objectStoreNames.contains("share_target")) {
            resolve();
            return;
          }
          const tx = db.transaction("share_target", "readwrite");
          const store = tx.objectStore("share_target");
          store.put(fileText, "pending_share");
          tx.oncomplete = () => resolve();
          tx.onerror = () => resolve();
        } catch {
          resolve();
        }
      };
      request.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

// Handle Web Share Target POST requests
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  if (event.request.method === "POST" && url.pathname === "/share") {
    event.respondWith(
      (async () => {
        try {
          const formData = await event.request.formData();
          let file = formData.get("timeline") || formData.get("file");

          if (!file) {
            for (const value of formData.values()) {
              if (value && typeof value === "object" && typeof value.text === "function") {
                file = value;
                break;
              }
            }
          }

          if (file && typeof file.text === "function") {
            const text = await file.text();
            await storeSharedFileInIdb(text);
          }
        } catch (err) {
          console.warn("[SW] Failed to process share target in service worker", err);
        }

        // Redirect client to main app with shared signal
        return Response.redirect("/?shared=1", 303);
      })()
    );
    return;
  }

  // Cache-first for static assets, network-first for pages
  if (event.request.method === "GET") {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).catch(() => {
          if (event.request.mode === "navigate") {
            return caches.match("/");
          }
        });
      })
    );
  }
});
