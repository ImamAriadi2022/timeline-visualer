let deferredPrompt = null;
let installListeners = [];

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installListeners.forEach((listener) => listener(true));
  });

  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    installListeners.forEach((listener) => listener(false));
  });
}

export const pwaService = {
  /**
   * Checks if running in standalone PWA display mode.
   */
  isStandalone() {
    if (typeof window === "undefined") return false;
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true ||
      document.referrer.includes("android-app://")
    );
  },

  /**
   * Checks if PWA install prompt is currently available.
   */
  canInstall() {
    return !!deferredPrompt;
  },

  /**
   * Subscribes to changes in installability status.
   */
  onInstallableChange(callback) {
    installListeners.push(callback);
    callback(this.canInstall());
    return () => {
      installListeners = installListeners.filter((l) => l !== callback);
    };
  },

  /**
   * Prompts the user to install the PWA.
   */
  async promptInstall() {
    if (!deferredPrompt) return false;
    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      deferredPrompt = null;
      installListeners.forEach((listener) => listener(false));
      return outcome === "accepted";
    } catch {
      return false;
    }
  },

  /**
   * Checks and extracts any pending shared data from Web Share Target.
   */
  async getPendingShareData() {
    if (typeof window === "undefined") return null;

    // Check sessionStorage first
    try {
      const sessionData = sessionStorage.getItem("pending_timeline_share");
      if (sessionData) {
        sessionStorage.removeItem("pending_timeline_share");
        return sessionData;
      }
    } catch {}

    // Check IndexedDB share_target store
    return new Promise((resolve) => {
      try {
        const req = indexedDB.open("timeline_db", 1);
        req.onsuccess = (e) => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains("share_target")) {
            resolve(null);
            return;
          }
          const tx = db.transaction("share_target", "readwrite");
          const store = tx.objectStore("share_target");
          const getReq = store.get("pending_share");

          getReq.onsuccess = () => {
            const val = getReq.result;
            if (val) {
              store.delete("pending_share");
              resolve(val);
            } else {
              resolve(null);
            }
          };
          getReq.onerror = () => resolve(null);
        };
        req.onerror = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
  },
};
