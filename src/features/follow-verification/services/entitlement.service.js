import { localStorageService } from "@/shared/services/local-storage.service";

const VERIFIED_KEY = "timeline_visualizer_export_verified";
const LEGACY_KEY = "timeline_mp4_export_unlocked";

export const exportEntitlement = {
  isUnlocked() {
    return (
      localStorageService.get(VERIFIED_KEY) === "true" ||
      localStorageService.get(LEGACY_KEY) === "true"
    );
  },

  unlock() {
    localStorageService.set(VERIFIED_KEY, "true");
    localStorageService.set(LEGACY_KEY, "true");
  },

  reset() {
    localStorageService.remove(VERIFIED_KEY);
    localStorageService.remove(LEGACY_KEY);
  },
};
