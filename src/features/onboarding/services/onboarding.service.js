const key = "timeline_onboarding_completed";
export const onboardingState = { isComplete: () => localStorage.getItem(key) === "true", complete: () => localStorage.setItem(key, "true"), reset: () => localStorage.removeItem(key) };
