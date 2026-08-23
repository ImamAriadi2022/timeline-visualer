import { renderTimelineVideo } from "./video-export.service";

/**
 * Backwards-compatible exportMp4 function
 */
export async function exportMp4({ points, style, duration, aspect, onProgress }) {
  const result = await renderTimelineVideo({
    points,
    style,
    durationSeconds: duration,
    aspectRatio: aspect,
    onProgress,
  });
  return result.blob;
}
