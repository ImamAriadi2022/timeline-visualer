import { localStorageService } from "@/shared/services/local-storage.service";

const ENTITLEMENT_KEY = "timeline_mp4_export_unlocked";

export const exportEntitlement = {
  isUnlocked() {
    return localStorageService.get(ENTITLEMENT_KEY) === "true";
  },

  unlock() {
    localStorageService.set(ENTITLEMENT_KEY, "true");
  },

  reset() {
    localStorageService.remove(ENTITLEMENT_KEY);
  },
};
