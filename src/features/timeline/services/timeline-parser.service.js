import { parseGeoCoordinate } from "@/shared/utils/geo";

function parseIsoTime(input) {
  if (!input) return null;
  const d = new Date(input);
  return Number.isNaN(+d) ? null : d.toISOString();
}

/**
 * Parses raw JSON input into standardized intermediate timeline segments.
 * Supports:
 * - Linimasa.json format (semanticSegments with timelinePath, visit, activity, and rawSignals)
 * - Google Takeout timelineObjects format (activitySegment, placeVisit)
 * - Google Takeout locations format (Records.json)
 * - Raw arrays of records
 */
export function parseTimelineJson(rawInput) {
  if (!rawInput) {
    throw new Error("Empty Timeline data. Please choose a valid JSON file.");
  }

  let data = rawInput;
  if (typeof rawInput === "string") {
    try {
      data = JSON.parse(rawInput);
    } catch {
      throw new Error("Invalid JSON format. Please select an uncorrupted Google Maps Timeline file.");
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

      // (a) timelinePath
      if (Array.isArray(segment.timelinePath) && segment.timelinePath.length > 0) {
        const pathPoints = segment.timelinePath
          .map((tp, pIdx) => {
            const coord = parseGeoCoordinate(tp.point || tp);
            if (!coord) return null;
            return {
              ...coord,
              time: parseIsoTime(tp.time) || startTime,
              id: `tp_${segIdx}_${pIdx}`,
            };
          })
          .filter(Boolean);

        if (pathPoints.length > 0) {
          extractedPoints.push(...pathPoints);
          if (pathPoints.length > 1) {
            extractedJourneys.push({
              id: `j_path_${segIdx}`,
              route: pathPoints,
              startTime,
              endTime,
              activityType: "MOVING",
            });
          }
        }
      }

      // (b) visit
      if (segment.visit) {
        const top = segment.visit.topCandidate || segment.visit;
        const coord = parseGeoCoordinate(top.placeLocation || top.location || segment.visit);
        if (coord) {
          const placePoint = {
            ...coord,
            time: startTime,
            id: `visit_${segIdx}`,
          };
          extractedPoints.push(placePoint);

          extractedPlaces.push({
            id: `place_${segIdx}`,
            name:
              top.semanticType && top.semanticType !== "UNKNOWN"
                ? formatSemanticType(top.semanticType)
                : top.placeId
                ? `Place (${top.placeId.slice(0, 8)})`
                : "Visited Place",
            semanticType: top.semanticType || "VISIT",
            placeId: top.placeId || null,
            location: coord,
            startTime,
            endTime,
          });
        }
      }

      // (c) activity
      if (segment.activity) {
        const act = segment.activity;
        const actType =
          act.topCandidate?.type ||
          act.activityType ||
          "IN_PASSENGER_VEHICLE";

        extractedActivities.add(actType);

        const startCoord = parseGeoCoordinate(act.start);
        const endCoord = parseGeoCoordinate(act.end);

        const actPoints = [];
        if (startCoord) {
          actPoints.push({
            ...startCoord,
            time: startTime,
            id: `act_start_${segIdx}`,
          });
        }
        if (endCoord) {
          actPoints.push({
            ...endCoord,
            time: endTime,
            id: `act_end_${segIdx}`,
          });
        }

        if (actPoints.length > 0) {
          extractedPoints.push(...actPoints);
        }

        if (actPoints.length > 1) {
          extractedJourneys.push({
            id: `j_act_${segIdx}`,
            route: actPoints,
            startTime,
            endTime,
            activityType: actType,
            distanceMeters: act.distanceMeters,
          });
        }
      }
    });
  }

  // 2. Format: rawSignals (fallback or supplemental in modern exports)
  if (extractedPoints.length === 0 && Array.isArray(data.rawSignals)) {
    data.rawSignals.forEach((signal, sIdx) => {
      if (signal.position) {
        const coord = parseGeoCoordinate(signal.position.LatLng || signal.position.latLng || signal.position);
        if (coord) {
          extractedPoints.push({
            ...coord,
            time: parseIsoTime(signal.position.timestamp),
            id: `raw_${sIdx}`,
          });
        }
      }
    });
  }

  // 3. Format: timelineObjects (standard Google Takeout)
  const timelineObjects = Array.isArray(data)
    ? data
    : Array.isArray(data.timelineObjects)
    ? data.timelineObjects
    : null;

  if (timelineObjects && extractedPoints.length === 0) {
    timelineObjects.forEach((entry, idx) => {
      // Activity segment
      if (entry.activitySegment) {
        const seg = entry.activitySegment;
        const start = parseIsoTime(seg.duration?.startTimestamp || seg.duration?.startTimestampMs);
        const end = parseIsoTime(seg.duration?.endTimestamp || seg.duration?.endTimestampMs);
        const actType = seg.activityType || "MOVING";
        extractedActivities.add(actType);

        const rawPath =
          seg.simplifiedRawPath?.points ||
          seg.waypointPath?.waypoints ||
          seg.timelinePath ||
          [];

        const route = (Array.isArray(rawPath) ? rawPath : [])
          .map((p, pIdx) => {
            const coord = parseGeoCoordinate(p);
            if (!coord) return null;
            return {
              ...coord,
              time: parseIsoTime(p.timestamp || p.time) || start,
              id: `to_p_${idx}_${pIdx}`,
            };
          })
          .filter(Boolean);

        if (route.length > 0) {
          extractedPoints.push(...route);
          if (route.length > 1) {
            extractedJourneys.push({
              id: `to_j_${idx}`,
              route,
              startTime: start,
              endTime: end,
              activityType: actType,
              distanceMeters: seg.distance,
            });
          }
        }
      }

      // Place visit
      if (entry.placeVisit) {
        const visit = entry.placeVisit;
        const start = parseIsoTime(visit.duration?.startTimestamp || visit.duration?.startTimestampMs);
        const end = parseIsoTime(visit.duration?.endTimestamp || visit.duration?.endTimestampMs);
        const loc = parseGeoCoordinate(visit.location);

        if (loc) {
          extractedPoints.push({ ...loc, time: start, id: `to_pv_${idx}` });
          extractedPlaces.push({
            id: `to_place_${idx}`,
            name: visit.location?.name || visit.location?.address || "Visited Place",
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
      "We couldn't recognize this Timeline file or find usable location coordinates. Export Location History JSON from Google Maps and try again."
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
  if (!type) return "Place";
  return type
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
