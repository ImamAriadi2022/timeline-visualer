import { parseTimelineJson } from "@/features/timeline/services/timeline-parser.service";
import { normalizeTimelineData } from "@/features/timeline/services/timeline-normalizer.service";

/**
 * Parses and normalizes any Google Maps Timeline JSON export.
 * @param {string|object} input - Raw JSON string or parsed JSON object
 * @returns {object} Internal Timeline Model
 */
export function parseTimeline(input) {
  const parsed = parseTimelineJson(input);
  return normalizeTimelineData(parsed);
}
