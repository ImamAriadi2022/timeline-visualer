export const runtime = "nodejs";

export async function POST(request) {
  try {
    const formData = await request.formData();
    let file = formData.get("timeline") || formData.get("file");

    if (!file) {
      for (const value of formData.values()) {
        if (value && typeof value === "object" && typeof value.text === "function") {
          file = value;
          break;
        }
      }
    }

    let fileContent = "";
    if (file && typeof file.text === "function") {
      fileContent = await file.text();
    }

    // Return client-side script to save to IndexedDB and redirect without storing GPS data on server
    const escapedJson = JSON.stringify(fileContent);

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Menerima Data Perjalanan...</title>
  <style>
    body { background: #000000; color: #F5F5F7; font-family: -apple-system, BlinkMacSystemFont, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
    .loader { width: 32px; height: 32px; border: 3px solid #2C2C2E; border-top-color: #007AFF; border-radius: 50%; animation: spin 0.8s linear infinite; margin-bottom: 16px; }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div style="text-align: center;">
    <div class="loader" style="margin: 0 auto 16px;"></div>
    <div style="font-size: 14px; font-weight: 600;">Menerima data perjalanan Anda...</div>
  </div>
  <script>
    (function() {
      const data = ${escapedJson};
      try {
        const req = indexedDB.open("timeline_db", 1);
        req.onupgradeneeded = function(e) {
          const db = e.target.result;
          if (!db.objectStoreNames.contains("datasets")) db.createObjectStore("datasets");
          if (!db.objectStoreNames.contains("share_target")) db.createObjectStore("share_target");
        };
        req.onsuccess = function(e) {
          const db = e.target.result;
          const tx = db.transaction("share_target", "readwrite");
          tx.objectStore("share_target").put(data, "pending_share");
          tx.oncomplete = function() {
            window.location.replace("/?shared=1");
          };
          tx.onerror = function() {
            sessionStorage.setItem("pending_timeline_share", data);
            window.location.replace("/?shared=1");
          };
        };
        req.onerror = function() {
          sessionStorage.setItem("pending_timeline_share", data);
          window.location.replace("/?shared=1");
        };
      } catch (err) {
        sessionStorage.setItem("pending_timeline_share", data);
        window.location.replace("/?shared=1");
      }
    })();
  </script>
</body>
</html>`;

    return new Response(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (err) {
    return new Response(
      `<html><head><meta http-equiv="refresh" content="0;url=/?error=share"></head><body>Gagal memproses share target</body></html>`,
      {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      }
    );
  }
}
