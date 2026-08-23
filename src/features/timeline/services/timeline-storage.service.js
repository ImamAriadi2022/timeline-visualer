import { indexedDbService } from "@/shared/services/indexed-db.service";

const STORE_NAME = "datasets";
const ACTIVE_KEY = "active";

export const timelineStorage = {
  async save(timelineData) {
    try {
      await indexedDbService.set(STORE_NAME, ACTIVE_KEY, timelineData);
      return true;
    } catch {
      throw new Error("Could not save Timeline dataset locally in your browser.");
    }
  },

  async load() {
    try {
      const data = await indexedDbService.get(STORE_NAME, ACTIVE_KEY);
      return data || null;
    } catch {
      throw new Error("Could not read saved Timeline dataset.");
    }
  },

  async clear() {
    try {
      await indexedDbService.delete(STORE_NAME, ACTIVE_KEY);
      return true;
    } catch {
      return false;
    }
  },
};
