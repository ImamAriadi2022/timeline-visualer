import { parseTimelineJson } from "./timeline-parser.service";
import { normalizeTimelineData } from "./timeline-normalizer.service";
import { timelineStorage } from "./timeline-storage.service";
import { getSampleTimelineData } from "./sample-data.service";

export const ACQUISITION_STATES = {
  IDLE: "IDLE",
  DETECTING: "DETECTING",
  ACQUIRING: "ACQUIRING",
  PROCESSING: "PROCESSING",
  READY: "READY",
  FALLBACK: "FALLBACK",
  ERROR: "ERROR",
};

/**
 * Service to orchestrate the Timeline Data Acquisition state machine.
 */
export const dataAcquisitionService = {
  /**
   * Checks if a valid timeline dataset already exists in local storage / IndexedDB.
   */
  async detectStoredTimeline() {
    try {
      const stored = await timelineStorage.load();
      if (stored && Array.isArray(stored.points) && stored.points.length > 0) {
        return stored;
      }
      return null;
    } catch {
      return null;
    }
  },

  /**
   * Processes a raw file or text source, normalizes into the internal timeline model,
   * and saves it to local IndexedDB storage.
   */
  async processSource(fileOrText) {
    if (!fileOrText) {
      throw new Error("Sumber data perjalanan tidak ditemukan.");
    }

    let textContent = "";
    if (typeof fileOrText === "string") {
      textContent = fileOrText;
    } else if (fileOrText instanceof File || fileOrText instanceof Blob) {
      textContent = await fileOrText.text();
    } else if (typeof fileOrText === "object") {
      textContent = JSON.stringify(fileOrText);
    }

    const rawParsed = parseTimelineJson(textContent);
    const normalizedModel = normalizeTimelineData(rawParsed);

    await timelineStorage.save(normalizedModel);
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

  /**
   * Attempts to open the native system file picker if supported by the browser.
   */
  async acquireViaNativePicker() {
    if (typeof window !== "undefined" && typeof window.showOpenFilePicker === "function") {
      try {
        const [fileHandle] = await window.showOpenFilePicker({
          types: [
            {
              description: "Data Riwayat Lokasi Google Maps",
              accept: {
                "application/json": [".json"],
                "text/plain": [".json", ".txt"],
              },
            },
          ],
          excludeAcceptAllOption: false,
          multiple: false,
        });

        if (fileHandle) {
          const file = await fileHandle.getFile();
          return await this.processSource(file);
        }
      } catch (err) {
        // User aborted/cancelled the picker
        if (err.name === "AbortError") {
          return null;
        }
        throw err;
      }
    }
    return null;
  },
};
