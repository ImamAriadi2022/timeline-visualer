import { renderVisualizationFrame } from "@/features/visualization/services/map-renderer.service";
import { getSupportedVideoMimeType } from "./video-encoder.service";

/**
 * Renders the timeline journey to a video Blob with silky-smooth frame timing.
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

  // Use canvas stream with target framerate
  const stream = canvas.captureStream(fps);
  const [videoTrack] = stream.getVideoTracks();
  const chunks = [];

  // High bitrate for 60fps / 30fps crisp quality
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

  recorder.start(250);

  const totalFrames = Math.max(25, Math.floor(durationSeconds * fps));
  const frameIntervalMs = 1000 / fps;

  // Render initial static frame before starting loop
  renderVisualizationFrame({
    ctx,
    width,
    height,
    points,
    places,
    progress: 0,
    style,
  });
  if (videoTrack?.requestFrame) videoTrack.requestFrame();
  await new Promise((r) => setTimeout(r, frameIntervalMs));

  const startTime = performance.now();

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

    if (videoTrack?.requestFrame) {
      videoTrack.requestFrame();
    }

    if (frame % Math.max(1, Math.floor(fps / 5)) === 0 || frame === totalFrames - 1) {
      onProgress?.(Math.round((frame / totalFrames) * 100));
    }

    // Precise real-time pacing so MediaRecorder captures every single frame smoothly
    const targetTime = startTime + (frame + 1) * frameIntervalMs;
    const delay = Math.max(2, targetTime - performance.now());
    await new Promise((r) => setTimeout(r, delay));
  }

  // Hold end frame slightly for clean finish
  await new Promise((r) => setTimeout(r, Math.max(100, frameIntervalMs * 3)));

  recorder.stop();
  return recordingFinished;
}
