/**
 * Calculates great-circle distance between two coordinates in kilometers using Haversine formula.
 */
export function calculateDistanceKm(coordA, coordB) {
  if (!coordA || !coordB) return 0;
  const lat1 = coordA.lat;
  const lon1 = coordA.lng;
  const lat2 = coordB.lat;
  const lon2 = coordB.lng;

  if (
    !Number.isFinite(lat1) ||
    !Number.isFinite(lon1) ||
    !Number.isFinite(lat2) ||
    !Number.isFinite(lon2)
  ) {
    return 0;
  }

  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculates bearing between two points in degrees (0..360)
 */
export function calculateBearing(coordA, coordB) {
  if (!coordA || !coordB) return 0;
  const lat1 = (coordA.lat * Math.PI) / 180;
  const lat2 = (coordB.lat * Math.PI) / 180;
  const dLon = ((coordB.lng - coordA.lng) * Math.PI) / 180;

  const y = Math.sin(dLon) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

  const brng = (Math.atan2(y, x) * 180) / Math.PI;
  return (brng + 360) % 360;
}

/**
 * Parses latitude and longitude from multiple Google Maps representations:
 * - String: "-5.0466374°, 105.3152138°", "-5.0466374, 105.3152138", "5.123 S, 105.123 E"
 * - Object: { lat, lng }, { latitude, longitude }, { latitudeE7, longitudeE7 }, { latE7, lngE7 }
 * - Nested wrappers: { point: "..." }, { latLng: "..." }, { LatLng: "..." }, { placeLocation: ... }
 */
export function parseGeoCoordinate(input) {
  if (!input) return null;

  if (typeof input === "object") {
    if (typeof input.lat === "number" && typeof input.lng === "number") {
      if (input.lat >= -90 && input.lat <= 90 && input.lng >= -180 && input.lng <= 180) {
        return { lat: input.lat, lng: input.lng };
      }
    }
    if (typeof input.latitude === "number" && typeof input.longitude === "number") {
      if (input.latitude >= -90 && input.latitude <= 90 && input.longitude >= -180 && input.longitude <= 180) {
        return { lat: input.latitude, lng: input.longitude };
      }
    }
    if (input.latitudeE7 != null && input.longitudeE7 != null) {
      const lat = input.latitudeE7 / 1e7;
      const lng = input.longitudeE7 / 1e7;
      if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        return { lat, lng };
      }
    }
    if (input.latE7 != null && input.lngE7 != null) {
      const lat = input.latE7 / 1e7;
      const lng = input.lngE7 / 1e7;
      if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        return { lat, lng };
      }
    }

    if (input.point) return parseGeoCoordinate(input.point);
    if (input.latLng) return parseGeoCoordinate(input.latLng);
    if (input.LatLng) return parseGeoCoordinate(input.LatLng);
    if (input.placeLocation) return parseGeoCoordinate(input.placeLocation);
    if (input.location) return parseGeoCoordinate(input.location);
    if (input.center) return parseGeoCoordinate(input.center);
    if (input.startLocation) return parseGeoCoordinate(input.startLocation);
    if (input.endLocation) return parseGeoCoordinate(input.endLocation);
    if (input.start) return parseGeoCoordinate(input.start);
    if (input.end) return parseGeoCoordinate(input.end);
  }

  if (typeof input === "string") {
    const cleaned = input.replace(/°/g, "").trim();
    // Match "lat, lng" or "lat lng"
    const match = cleaned.match(/([-+]?\d+(?:\.\d+)?)\s*[,;\s]\s*([-+]?\d+(?:\.\d+)?)/);
    if (match) {
      const lat = parseFloat(match[1]);
      const lng = parseFloat(match[2]);
      if (
        Number.isFinite(lat) &&
        Number.isFinite(lng) &&
        lat >= -90 &&
        lat <= 90 &&
        lng >= -180 &&
        lng <= 180
      ) {
        return { lat, lng };
      }
    }
  }

  return null;
}

/**
 * Computes bounding box for an array of points
 */
export function getBoundingBox(points) {
  if (!points || !points.length) {
    return { minLat: 0, maxLat: 0, minLng: 0, maxLng: 0, spanLat: 1, spanLng: 1 };
  }

  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLng = Infinity;
  let maxLng = -Infinity;

  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    if (Number.isFinite(p.lat) && Number.isFinite(p.lng)) {
      if (p.lat < minLat) minLat = p.lat;
      if (p.lat > maxLat) maxLat = p.lat;
      if (p.lng < minLng) minLng = p.lng;
      if (p.lng > maxLng) maxLng = p.lng;
    }
  }

  if (minLat === Infinity) {
    return { minLat: 0, maxLat: 0, minLng: 0, maxLng: 0, spanLat: 1, spanLng: 1 };
  }

  const spanLat = Math.max(0.001, maxLat - minLat);
  const spanLng = Math.max(0.001, maxLng - minLng);

  return { minLat, maxLat, minLng, maxLng, spanLat, spanLng };
}
