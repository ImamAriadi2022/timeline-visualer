import { renderVisualizationFrame } from "@/features/visualization/services/map-renderer.service";
import { getSupportedVideoMimeType } from "./video-encoder.service";

/**
 * Renders the timeline journey to a video Blob.
 */
export async function renderTimelineVideo({
  points,
  places = [],
  style = "normal",
  durationSeconds = 10,
  aspectRatio = "square",
  fps = 30,
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

  const stream = canvas.captureStream(fps);
  const chunks = [];

  const recorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: 8_000_000, // 8 Mbps for crisp output
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

  recorder.start(500);

  const totalFrames = Math.max(15, Math.floor(durationSeconds * fps));

  for (let frame = 0; frame < totalFrames; frame++) {
    const progress = frame / (totalFrames - 1);

    renderVisualizationFrame({
      ctx,
      width,
      height,
      points,
      places,
      progress,
      style,
    });

    if (frame % 5 === 0 || frame === totalFrames - 1) {
      onProgress?.(Math.round((frame / totalFrames) * 100));
      await new Promise((r) => setTimeout(r, 0));
    }
  }

  recorder.stop();
  return recordingFinished;
}
