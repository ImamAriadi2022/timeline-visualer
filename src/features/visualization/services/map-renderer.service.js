import { calculateBearing } from "@/shared/utils/geo";

/**
 * Transforms geographic coordinates to 2D canvas pixel coordinates
 */
export function createProjector(points, width, height, paddingRatio = 0.1) {
  if (!points || !points.length) {
    return () => ({ x: width / 2, y: height / 2 });
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

  const spanLat = Math.max(0.0001, maxLat - minLat);
  const spanLng = Math.max(0.0001, maxLng - minLng);

  const padX = width * paddingRatio;
  const padY = height * paddingRatio;
  const drawWidth = width - padX * 2;
  const drawHeight = height - padY * 2;

  // Preserve geographic aspect ratio (Mercator-ish approximation)
  const latMid = ((minLat + maxLat) / 2) * (Math.PI / 180);
  const lngScale = Math.cos(latMid);
  const geoAspect = (spanLng * lngScale) / spanLat;
  const screenAspect = drawWidth / drawHeight;

  let scaleX, scaleY, offsetX, offsetY;

  if (geoAspect > screenAspect) {
    scaleX = drawWidth / spanLng;
    scaleY = (drawWidth / geoAspect) / spanLat;
    offsetX = padX;
    offsetY = padY + (drawHeight - drawWidth / geoAspect) / 2;
  } else {
    scaleY = drawHeight / spanLat;
    scaleX = (drawHeight * geoAspect) / spanLng;
    offsetX = padX + (drawWidth - drawHeight * geoAspect) / 2;
    offsetY = padY;
  }

  return (coord) => {
    if (!coord || !Number.isFinite(coord.lat) || !Number.isFinite(coord.lng)) {
      return { x: width / 2, y: height / 2 };
    }
    const x = offsetX + (coord.lng - minLng) * scaleX;
    const y = height - (offsetY + (coord.lat - minLat) * scaleY);
    return { x, y };
  };
}

/**
 * Draws a single frame of the timeline journey visualization.
 */
export function renderVisualizationFrame({
  ctx,
  width,
  height,
  points,
  progress = 0,
  style = "normal",
  places = [],
}) {
  // Clear and paint deep dark canvas background
  ctx.fillStyle = "#0A0A0C";
  ctx.fillRect(0, 0, width, height);

  if (!points || points.length === 0) {
    ctx.fillStyle = "#6E6E73";
    ctx.font = "14px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("No route points to visualize", width / 2, height / 2);
    return;
  }

  const project = createProjector(points, width, height, 0.12);

  // Subtle background coordinate grid lines
  drawSubtleGrid(ctx, width, height);

  const clampedProgress = Math.max(0, Math.min(1, progress));
  const totalPoints = points.length;
  const currentIdx = Math.max(0, Math.min(totalPoints - 1, Math.floor(clampedProgress * (totalPoints - 1))));
  const activePoints = points.slice(0, currentIdx + 1);

  // 1. Draw entire faint route background (history path)
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
  ctx.lineWidth = Math.max(2, width * 0.003);
  ctx.beginPath();
  for (let i = 0; i < points.length; i++) {
    const pt = project(points[i]);
    if (i === 0) ctx.moveTo(pt.x, pt.y);
    else ctx.lineTo(pt.x, pt.y);
  }
  ctx.stroke();

  // 2. Style-specific active route rendering
  if (style === "travel") {
    // Glow effect for travel style
    ctx.save();
    ctx.shadowColor = "#007AFF";
    ctx.shadowBlur = Math.max(8, width * 0.012);
    ctx.strokeStyle = "#64D2FF";
    ctx.lineWidth = Math.max(3, width * 0.0045);
    ctx.beginPath();
    for (let i = 0; i < activePoints.length; i++) {
      const pt = project(activePoints[i]);
      if (i === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    }
    ctx.stroke();
    ctx.restore();

    // Subtle waypoint circles at intervals
    const step = Math.max(1, Math.floor(totalPoints / 25));
    for (let i = 0; i <= currentIdx; i += step) {
      const pt = project(points[i]);
      ctx.fillStyle = "rgba(100, 210, 255, 0.3)";
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, Math.max(4, width * 0.006), 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (style === "transport") {
    // High-contrast electric yellow-green for transit style
    ctx.strokeStyle = "#30D158";
    ctx.lineWidth = Math.max(3.5, width * 0.005);
    ctx.beginPath();
    for (let i = 0; i < activePoints.length; i++) {
      const pt = project(activePoints[i]);
      if (i === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    }
    ctx.stroke();
  } else if (style === "vehicle") {
    // Warm flame orange track
    ctx.strokeStyle = "#FF9F0A";
    ctx.lineWidth = Math.max(3, width * 0.0045);
    ctx.beginPath();
    for (let i = 0; i < activePoints.length; i++) {
      const pt = project(activePoints[i]);
      if (i === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    }
    ctx.stroke();
  } else {
    // Normal style: clean refined Apple blue/white polyline
    ctx.strokeStyle = "#007AFF";
    ctx.lineWidth = Math.max(3, width * 0.004);
    ctx.beginPath();
    for (let i = 0; i < activePoints.length; i++) {
      const pt = project(activePoints[i]);
      if (i === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    }
    ctx.stroke();
  }

  // 3. Draw start point pin
  if (points.length > 0) {
    const startPt = project(points[0]);
    ctx.fillStyle = "#30D158";
    ctx.beginPath();
    ctx.arc(startPt.x, startPt.y, Math.max(4, width * 0.005), 0, Math.PI * 2);
    ctx.fill();
  }

  // 4. Draw Current Position Indicator / Vehicle Head
  const currentCoord = activePoints[activePoints.length - 1] || points[0];
  const currentPt = project(currentCoord);

  if (style === "vehicle" && activePoints.length > 1) {
    // Calculate direction from last 2 points
    const prevCoord = activePoints[activePoints.length - 2];
    const prevPt = project(prevCoord);
    const angle = Math.atan2(currentPt.y - prevPt.y, currentPt.x - prevPt.x);

    drawVehicleMarker(ctx, currentPt.x, currentPt.y, angle, width);
  } else {
    // Standard sleek tracer head
    drawPulseMarker(ctx, currentPt.x, currentPt.y, style, width);
  }
}

function drawSubtleGrid(ctx, width, height) {
  ctx.strokeStyle = "rgba(255, 255, 255, 0.02)";
  ctx.lineWidth = 1;
  const gridSize = Math.max(40, width * 0.08);

  ctx.beginPath();
  for (let x = gridSize; x < width; x += gridSize) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
  }
  for (let y = gridSize; y < height; y += gridSize) {
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
  }
  ctx.stroke();
}

function drawPulseMarker(ctx, x, y, style, width) {
  const baseRadius = Math.max(5, width * 0.007);
  const outerColor =
    style === "transport"
      ? "rgba(48, 209, 88, 0.3)"
      : style === "travel"
      ? "rgba(100, 210, 255, 0.4)"
      : "rgba(0, 122, 255, 0.35)";

  const innerColor =
    style === "transport"
      ? "#30D158"
      : style === "travel"
      ? "#64D2FF"
      : "#FFFFFF";

  // Outer halo
  ctx.fillStyle = outerColor;
  ctx.beginPath();
  ctx.arc(x, y, baseRadius * 2.2, 0, Math.PI * 2);
  ctx.fill();

  // Core dot
  ctx.fillStyle = innerColor;
  ctx.beginPath();
  ctx.arc(x, y, baseRadius, 0, Math.PI * 2);
  ctx.fill();

  // Inner dot border
  ctx.strokeStyle = "#007AFF";
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

function drawVehicleMarker(ctx, x, y, angle, width) {
  const size = Math.max(9, width * 0.012);

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  // Directional triangle pointer
  ctx.fillStyle = "#FF9F0A";
  ctx.beginPath();
  ctx.moveTo(size * 1.4, 0);
  ctx.lineTo(-size, -size * 0.8);
  ctx.lineTo(-size * 0.4, 0);
  ctx.lineTo(-size, size * 0.8);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "#FFFFFF";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.restore();
}
