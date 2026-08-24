import { parseGeoCoordinate } from "@/shared/utils/geo";

function parseIsoTime(input) {
  if (!input) return null;
  const d = new Date(input);
  return Number.isNaN(+d) ? null : d.toISOString();
}

/**
 * Parses raw input into standardized intermediate timeline segments.
 * Supports:
 * - Linimasa.json format (semanticSegments with timelinePath, visit, activity, and rawSignals)
 * - Google Takeout timelineObjects format (activitySegment, placeVisit)
 * - Google Takeout locations format (Records.json)
 * - Raw arrays of records
 */
export function parseTimelineJson(rawInput) {
  if (!rawInput) {
    throw new Error("Data riwayat perjalanan kosong. Silakan pilih file yang sesuai.");
  }

  let data = rawInput;
  if (typeof rawInput === "string") {
    try {
      data = JSON.parse(rawInput);
    } catch {
      throw new Error("File data tidak dapat dibaca. Pastikan file riwayat Google Maps tidak rusak.");
    }
  }

  const extractedPoints = [];
  const extractedPlaces = [];
  const extractedJourneys = [];
  const extractedActivities = new Set();

  // 1. Format: semanticSegments (Linimasa.json modern Google Maps export)
  if (Array.isArray(data.semanticSegments)) {
    data.semanticSegments.forEach((segment, segIdx) => {
      const startTime = parseIsoTime(segment.startTime);
      const endTime = parseIsoTime(segment.endTime);

      // Extract points from timelinePath
      if (Array.isArray(segment.timelinePath)) {
        const journeyPoints = [];
        segment.timelinePath.forEach((pt, ptIdx) => {
          const coord = parseGeoCoordinate(pt.point || pt);
          if (coord) {
            const time = parseIsoTime(pt.time) || startTime;
            const fullPoint = {
              ...coord,
              time,
              id: `seg_${segIdx}_pt_${ptIdx}`,
            };
            extractedPoints.push(fullPoint);
            journeyPoints.push(fullPoint);
          }
        });

        if (journeyPoints.length > 0) {
          extractedJourneys.push({
            id: `journey_${segIdx}`,
            startTime,
            endTime,
            route: journeyPoints,
            activityType: segment.activity?.topCandidate?.type || "IN_PASSENGER_VEHICLE",
          });
        }
      }

      // Extract places from visit
      if (segment.visit) {
        const visit = segment.visit;
        const placeCoord =
          parseGeoCoordinate(visit.topCandidate?.placeLocation) ||
          parseGeoCoordinate(visit.topCandidate) ||
          parseGeoCoordinate(visit);

        if (placeCoord) {
          extractedPoints.push({
            ...placeCoord,
            time: startTime,
            id: `visit_${segIdx}`,
          });

          extractedPlaces.push({
            id: `place_${segIdx}`,
            name:
              visit.topCandidate?.name ||
              visit.topCandidate?.placeID ||
              formatSemanticType(visit.topCandidate?.semanticType) ||
              "Tempat Singgah",
            location: placeCoord,
            startTime,
            endTime,
            semanticType: visit.topCandidate?.semanticType,
          });
        }
      }

      // Extract activity information
      if (segment.activity) {
        const actType = segment.activity.topCandidate?.type;
        if (actType) extractedActivities.add(actType);

        const startCoord = parseGeoCoordinate(segment.activity.start);
        const endCoord = parseGeoCoordinate(segment.activity.end);
        if (startCoord) {
          extractedPoints.push({
            ...startCoord,
            time: startTime,
            id: `act_start_${segIdx}`,
          });
        }
        if (endCoord) {
          extractedPoints.push({
            ...endCoord,
            time: endTime,
            id: `act_end_${segIdx}`,
          });
        }
      }

      // Fallback: extract from rawSignals if points are sparse
      if (Array.isArray(segment.rawSignals)) {
        segment.rawSignals.forEach((sig, sigIdx) => {
          if (sig.position) {
            const coord = parseGeoCoordinate(sig.position);
            if (coord) {
              extractedPoints.push({
                ...coord,
                time: parseIsoTime(sig.position.timestamp) || startTime,
                id: `raw_${segIdx}_${sigIdx}`,
              });
            }
          }
        });
      }
    });
  }

  // 2. Format: Raw signals array directly on root
  if (Array.isArray(data.rawSignals) && extractedPoints.length === 0) {
    data.rawSignals.forEach((sig, idx) => {
      if (sig.position) {
        const coord = parseGeoCoordinate(sig.position);
        if (coord) {
          extractedPoints.push({
            ...coord,
            time: parseIsoTime(sig.position.timestamp),
            id: `root_raw_${idx}`,
          });
        }
      }
    });
  }

  // 3. Format: Google Takeout timelineObjects
  if (Array.isArray(data.timelineObjects)) {
    data.timelineObjects.forEach((obj, idx) => {
      if (obj.activitySegment) {
        const act = obj.activitySegment;
        const start = parseIsoTime(act.duration?.startTimestamp);
        const end = parseIsoTime(act.duration?.endTimestamp);
        const actType = act.activityType;
        if (actType) extractedActivities.add(actType);

        const journeyPts = [];

        // Check waypoint path
        if (Array.isArray(act.waypointPath?.waypoints)) {
          act.waypointPath.waypoints.forEach((wp, wpIdx) => {
            const coord = parseGeoCoordinate(wp);
            if (coord) {
              const pt = {
                ...coord,
                time: start,
                id: `to_wp_${idx}_${wpIdx}`,
              };
              extractedPoints.push(pt);
              journeyPts.push(pt);
            }
          });
        }

        // Check simplified raw path
        if (Array.isArray(act.simplifiedRawPath?.points)) {
          act.simplifiedRawPath.points.forEach((p, pIdx) => {
            const coord = parseGeoCoordinate(p);
            if (coord) {
              const pt = {
                ...coord,
                time: parseIsoTime(p.timestampMs) || start,
                id: `to_srp_${idx}_${pIdx}`,
              };
              extractedPoints.push(pt);
              journeyPts.push(pt);
            }
          });
        }

        // Start and end location points
        const startCoord = parseGeoCoordinate(act.startLocation);
        const endCoord = parseGeoCoordinate(act.endLocation);

        if (startCoord) {
          const pt = { ...startCoord, time: start, id: `to_start_${idx}` };
          extractedPoints.push(pt);
          journeyPts.unshift(pt);
        }
        if (endCoord) {
          const pt = { ...endCoord, time: end, id: `to_end_${idx}` };
          extractedPoints.push(pt);
          journeyPts.push(pt);
        }

        if (journeyPts.length > 0) {
          extractedJourneys.push({
            id: `to_journey_${idx}`,
            startTime: start,
            endTime: end,
            route: journeyPts,
            activityType: actType || "IN_PASSENGER_VEHICLE",
          });
        }
      }

      if (obj.placeVisit) {
        const visit = obj.placeVisit;
        const loc = parseGeoCoordinate(visit.location);
        const start = parseIsoTime(visit.duration?.startTimestamp);
        const end = parseIsoTime(visit.duration?.endTimestamp);

        if (loc) {
          extractedPoints.push({ ...loc, time: start, id: `to_pv_${idx}` });
          extractedPlaces.push({
            id: `to_place_${idx}`,
            name: visit.location?.name || visit.location?.address || "Tempat Singgah",
            location: loc,
            startTime: start,
            endTime: end,
          });
        }
      }
    });
  }

  // 4. Format: Locations array (Records.json / location history)
  if (extractedPoints.length === 0 && Array.isArray(data.locations)) {
    data.locations.forEach((loc, idx) => {
      const coord = parseGeoCoordinate(loc);
      if (coord) {
        extractedPoints.push({
          ...coord,
          time: parseIsoTime(loc.timestamp || loc.timestampMs),
          id: `loc_${idx}`,
        });
      }
    });
  }

  if (extractedPoints.length === 0) {
    throw new Error(
      "Format file riwayat ini tidak berisi koordinat rute yang dapat digunakan. Silakan periksa kembali file dari Google Maps Anda."
    );
  }

  return {
    rawPoints: extractedPoints,
    rawPlaces: extractedPlaces,
    rawJourneys: extractedJourneys,
    rawActivities: Array.from(extractedActivities),
  };
}

function formatSemanticType(type) {
  if (!type) return "Tempat Singgah";
  return type
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
