const DB_NAME = "timeline-visualizer";
const DB_VERSION = 1;

function openDatabase(storeName) {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB is not supported in this environment."));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error("Could not open local database."));
  });
}

export const indexedDbService = {
  async get(storeName, key) {
    const db = await openDatabase(storeName);
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(new Error("Failed to read from local database."));
    });
  },

  async set(storeName, key, value) {
    const db = await openDatabase(storeName);
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.put(value, key);

      transaction.oncomplete = () => resolve(true);
      transaction.onerror = () => reject(new Error("Failed to write to local database."));
    });
  },

  async delete(storeName, key) {
    const db = await openDatabase(storeName);
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      store.delete(key);

      transaction.oncomplete = () => resolve(true);
      transaction.onerror = () => reject(new Error("Failed to delete from local database."));
    });
  },

  async clear(storeName) {
    const db = await openDatabase(storeName);
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      store.clear();

      transaction.oncomplete = () => resolve(true);
      transaction.onerror = () => reject(new Error("Failed to clear local database."));
    });
  },
};
