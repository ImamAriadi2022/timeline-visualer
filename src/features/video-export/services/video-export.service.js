import {
  renderVisualizationFrame,
  createProjector,
} from "@/features/visualization/services/map-renderer.service";
import { getSupportedVideoMimeType } from "./video-encoder.service";

/**
 * Renders the timeline journey to a video Blob with strictly enforced duration.
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

  // Pre-project points once for instantaneous frame rendering (< 1ms per frame)
  const projector = createProjector(points, width, height, 0.12);
  const projectedPoints = points.map((p) => projector(p));

  // Initial draw at progress 0
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

  const totalDurationMs = Math.min(90000, Math.max(5000, Number(durationSeconds) * 1000));

  // Start recording
  recorder.start(200);

  const startTime = performance.now();

  // Run time-driven animation loop for exactly totalDurationMs
  await new Promise((resolve) => {
    let isFinished = false;
    let rafId = null;
    let fallbackInterval = null;

    function renderStep() {
      if (isFinished) return;

      const elapsed = performance.now() - startTime;
      const progress = Math.min(1, elapsed / totalDurationMs);

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

      onProgress?.(Math.min(100, Math.round(progress * 100)));

      if (elapsed >= totalDurationMs) {
        isFinished = true;
        if (rafId) cancelAnimationFrame(rafId);
        if (fallbackInterval) clearInterval(fallbackInterval);

        // Render final static frame at 100%
        renderVisualizationFrame({
          ctx,
          width,
          height,
          points,
          places,
          progress: 1,
          style,
          projector,
          projectedPoints,
        });
        if (videoTrack?.requestFrame) {
          videoTrack.requestFrame();
        }

        resolve();
      } else {
        rafId = requestAnimationFrame(renderStep);
      }
    }

    rafId = requestAnimationFrame(renderStep);

    // Fallback interval to guarantee progress even if tab background throttles RAF
    fallbackInterval = setInterval(() => {
      if (!isFinished && performance.now() - startTime >= totalDurationMs) {
        renderStep();
      }
    }, 100);
  });

  // Hold final frame for 150ms before finalizing
  await new Promise((r) => setTimeout(r, 150));
  recorder.stop();

  return recordingFinished;
}
