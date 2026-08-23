const key = "timeline_mp4_export_unlocked";
export const exportEntitlement = { isUnlocked: () => localStorage.getItem(key) === "true", unlock: () => localStorage.setItem(key, "true") };
