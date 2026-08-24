import { parseTimelineJson } from "./timeline-parser.service";
import { normalizeTimelineData } from "./timeline-normalizer.service";
import { timelineStorage } from "./timeline-storage.service";
import { getSampleTimelineData } from "./sample-data.service";
import { pwaService } from "@/features/pwa/services/pwa.service";

export const ACQUISITION_STATES = {
  IDLE: "IDLE",
  DETECTING: "DETECTING",
  RECEIVING: "RECEIVING",
  VALIDATING: "VALIDATING",
  PARSING: "PARSING",
  NORMALIZING: "NORMALIZING",
  READY: "READY",
  FALLBACK: "FALLBACK",
  ERROR: "ERROR",
};

/**
 * Service to orchestrate the Timeline Data Acquisition state machine and Web Share Target.
 */
export const dataAcquisitionService = {
  /**
   * Checks if an active timeline exists or if a pending file was received via Web Share Target.
   */
  async checkIncomingOrStored() {
    // 1. Check for incoming Web Share Target data from Android Share Sheet
    const sharedData = await pwaService.getPendingShareData();
    if (sharedData) {
      return { type: "shared", data: sharedData };
    }

    // 2. Check for existing timeline stored in IndexedDB
    try {
      const stored = await timelineStorage.load();
      if (stored && Array.isArray(stored.points) && stored.points.length > 0) {
        return { type: "stored", data: stored };
      }
    } catch {}

    return null;
  },

  /**
   * Processes a raw file or text source through the validation -> parsing -> normalizing pipeline,
   * updating through explicit progress states.
   */
  async processSource(fileOrText, onStateChange) {
    if (!fileOrText) {
      throw new Error("Data perjalanan belum dapat dibaca.");
    }

    onStateChange?.(ACQUISITION_STATES.RECEIVING);
    await new Promise((r) => setTimeout(r, 100));

    let textContent = "";
    if (typeof fileOrText === "string") {
      textContent = fileOrText;
    } else if (fileOrText instanceof File || fileOrText instanceof Blob) {
      textContent = await fileOrText.text();
    } else if (typeof fileOrText === "object") {
      textContent = JSON.stringify(fileOrText);
    }

    onStateChange?.(ACQUISITION_STATES.VALIDATING);
    if (!textContent || textContent.trim().length === 0) {
      throw new Error("Data perjalanan kosong atau tidak valid.");
    }
    await new Promise((r) => setTimeout(r, 100));

    onStateChange?.(ACQUISITION_STATES.PARSING);
    const rawParsed = parseTimelineJson(textContent);
    await new Promise((r) => setTimeout(r, 100));

    onStateChange?.(ACQUISITION_STATES.NORMALIZING);
    const normalizedModel = normalizeTimelineData(rawParsed);
    await new Promise((r) => setTimeout(r, 100));

    await timelineStorage.save(normalizedModel);
    onStateChange?.(ACQUISITION_STATES.READY);

    return normalizedModel;
  },

  /**
   * Loads the instant demo sample timeline data and saves to local storage.
   */
  async loadSampleDemo() {
    const sample = getSampleTimelineData();
    await timelineStorage.save(sample);
    return sample;
  },
};
