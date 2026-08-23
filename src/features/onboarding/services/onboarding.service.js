import { localStorageService } from "@/shared/services/local-storage.service";

const ONBOARDING_KEY = "timeline_visualizer_onboarded";
const LEGACY_KEY = "timeline_onboarding_completed";

export const onboardingState = {
  isComplete() {
    return (
      localStorageService.get(ONBOARDING_KEY) === "true" ||
      localStorageService.get(LEGACY_KEY) === "true"
    );
  },

  complete() {
    localStorageService.set(ONBOARDING_KEY, "true");
  },

  reset() {
    localStorageService.remove(ONBOARDING_KEY);
    localStorageService.remove(LEGACY_KEY);
  },
};
