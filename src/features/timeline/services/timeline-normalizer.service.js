import { calculateDistanceKm, getBoundingBox } from "@/shared/utils/geo";

/**
 * Normalizes intermediate parsed segments into the stable Internal Timeline Model.
 * This guarantees that components down the line never depend on Google raw format details.
 */
export function normalizeTimelineData(parsed) {
  const { rawPoints, rawPlaces, rawJourneys, rawActivities } = parsed;

  // 1. Filter and sanitize points
  const validPoints = rawPoints
    .filter(
      (p) =>
        p &&
        Number.isFinite(p.lat) &&
        Number.isFinite(p.lng) &&
        p.lat >= -90 &&
        p.lat <= 90 &&
        p.lng >= -180 &&
        p.lng <= 180
    )
    .sort((a, b) => {
      if (a.time && b.time) {
        return new Date(a.time).getTime() - new Date(b.time).getTime();
      }
      return 0;
    });

  if (validPoints.length === 0) {
    throw new Error(
      "File ini tidak berisi titik lokasi yang dapat digunakan. Pastikan ekspor Google Maps Timeline menyertakan riwayat lokasi."
    );
  }

  // Deduplicate consecutive identical points to save render overhead
  const dedupedPoints = [];
  for (let i = 0; i < validPoints.length; i++) {
    const current = validPoints[i];
    const prev = dedupedPoints[dedupedPoints.length - 1];
    if (
      !prev ||
      Math.abs(prev.lat - current.lat) > 0.00001 ||
      Math.abs(prev.lng - current.lng) > 0.00001
    ) {
      dedupedPoints.push(current);
    }
  }

  const finalPoints = dedupedPoints.length > 0 ? dedupedPoints : validPoints;

  // 2. Compute journeys with distances
  const normalizedJourneys = rawJourneys.map((j, idx) => {
    const route = j.route.filter(
      (p) => Number.isFinite(p.lat) && Number.isFinite(p.lng)
    );

    let distance = 0;
    if (j.distanceMeters != null) {
      distance = j.distanceMeters / 1000;
    } else if (route.length > 1) {
      for (let i = 1; i < route.length; i++) {
        distance += calculateDistanceKm(route[i - 1], route[i]);
      }
    }

    return {
      id: j.id || `journey_${idx}`,
      activity: j.activityType || "MOVING",
      startTime: j.startTime || route[0]?.time || null,
      endTime: j.endTime || route.at(-1)?.time || null,
      distanceKm: distance,
      pointCount: route.length,
    };
  });

  // Calculate total distance
  let totalDistanceKm = 0;
  if (normalizedJourneys.length > 0) {
    totalDistanceKm = normalizedJourneys.reduce((sum, j) => sum + (j.distanceKm || 0), 0);
  } else if (finalPoints.length > 1) {
    for (let i = 1; i < finalPoints.length; i++) {
      totalDistanceKm += calculateDistanceKm(finalPoints[i - 1], finalPoints[i]);
    }
  }

  // 3. Extract chronological dates
  const timestamps = finalPoints
    .map((p) => p.time)
    .filter(Boolean)
    .sort();

  const startDate = timestamps[0] || null;
  const endDate = timestamps[timestamps.length - 1] || null;

  // 4. Compute bounding box
  const bbox = getBoundingBox(finalPoints);

  return {
    points: finalPoints,
    places: rawPlaces || [],
    journeys: normalizedJourneys,
    activities: rawActivities || [],
    bbox,
    summary: {
      locations: finalPoints.length,
      journeys: normalizedJourneys.length,
      places: (rawPlaces || []).length,
      activities: (rawActivities || []).length,
      distance: totalDistanceKm,
      start: startDate,
      end: endDate,
    },
  };
}
