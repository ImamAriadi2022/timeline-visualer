import { renderVisualizationFrame } from "./map-renderer.service";

export const styles = {
  normal: "Normal",
  travel: "Travel",
  transport: "Transport",
  vehicle: "Vehicle",
};

/**
 * Backwards-compatible drawFrame function
 */
export function drawFrame(ctx, w, h, points, progress, style = "normal") {
  renderVisualizationFrame({
    ctx,
    width: w,
    height: h,
    points,
    progress,
    style,
  });
}
