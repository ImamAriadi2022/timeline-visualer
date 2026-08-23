import {
  renderVisualizationFrame,
  createProjector,
} from "@/features/visualization/services/map-renderer.service";
import { getSupportedVideoMimeType } from "./video-encoder.service";

/**
 * Renders the timeline journey to a video Blob with precise duration and frame timing.
 */
export async function renderTimelineVideo({
  points,
  places = [],
  style = "normal",
  durationSeconds = 10,
  aspectRatio = "square",
  fps = 60,
  onProgress,
}) {
  if (!points || points.length === 0) {
    throw new Error("Tidak ada titik rute yang tersedia untuk diekspor.");
  }

  const mimeType = getSupportedVideoMimeType();
  if (!mimeType) {
    throw new Error(
      "Browser Anda tidak mendukung perekaman video internal. Silakan gunakan Chrome, Edge, atau Safari versi terbaru."
    );
  }

  // Determine resolution based on aspect ratio
  let width = 1080;
  let height = 1080;

  if (aspectRatio === "portrait") {
    width = 720;
    height = 1280;
  } else if (aspectRatio === "landscape") {
    width = 1280;
    height = 720;
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  // Pre-project points once for instantaneous frame rendering
  const projector = createProjector(points, width, height, 0.12);
  const projectedPoints = points.map((p) => projector(p));

  // Initial draw
  renderVisualizationFrame({
    ctx,
    width,
    height,
    points,
    places,
    progress: 0,
    style,
    projector,
    projectedPoints,
  });

  const stream = canvas.captureStream(fps);
  const [videoTrack] = stream.getVideoTracks();
  const chunks = [];

  const targetBitrate = fps >= 60 ? 12_000_000 : 8_000_000;

  const recorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: targetBitrate,
  });

  const recordingFinished = new Promise((resolve, reject) => {
    recorder.onstop = () => {
      const blobType = mimeType.includes("mp4") ? "video/mp4" : "video/webm";
      const blob = new Blob(chunks, { type: blobType });
      resolve({ blob, mimeType: blobType });
    };
    recorder.onerror = (e) => {
      reject(new Error("Perekam video browser mengalami kesalahan: " + (e.error?.message || "tidak diketahui")));
    };
  });

  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) {
      chunks.push(e.data);
    }
  };

  const targetFrameCount = Math.max(1, Math.round(durationSeconds * fps));
  const frameIntervalMs = 1000 / fps;

  recorder.start(100);

  const startTime = performance.now();

  for (let frame = 0; frame < targetFrameCount; frame++) {
    const progress = targetFrameCount > 1 ? frame / (targetFrameCount - 1) : 1;

    renderVisualizationFrame({
      ctx,
      width,
      height,
      points,
      places,
      progress,
      style,
      projector,
      projectedPoints,
    });

    if (videoTrack?.requestFrame) {
      videoTrack.requestFrame();
    }

    if (frame % Math.max(1, Math.floor(fps / 5)) === 0 || frame === targetFrameCount - 1) {
      onProgress?.(Math.round((frame / targetFrameCount) * 100));
    }

    // Precise real-time pacing so MediaRecorder matches exact selected duration
    const targetWallTime = startTime + (frame + 1) * frameIntervalMs;
    const remainingTime = targetWallTime - performance.now();
    if (remainingTime > 0) {
      await new Promise((r) => setTimeout(r, remainingTime));
    }
  }

  // Small padding before stopping recorder
  await new Promise((r) => setTimeout(r, 100));
  recorder.stop();

  return recordingFinished;
}
