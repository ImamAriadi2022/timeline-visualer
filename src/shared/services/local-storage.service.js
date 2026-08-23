export const localStorageService = {
  get(key, defaultValue = null) {
    if (typeof window === "undefined") return defaultValue;
    try {
      const item = window.localStorage.getItem(key);
      return item !== null ? item : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  getJSON(key, defaultValue = null) {
    if (typeof window === "undefined") return defaultValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  set(key, value) {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value));
    } catch {
      // Storage quota or private mode restriction
    }
  },

  remove(key) {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Storage restriction
    }
  },
};
