"use client";
import React, { useState, useEffect, useRef } from "react";
import { Dialog } from "@/shared/components/Dialog";
import { Button } from "@/shared/components/Button";
import { DownloadIcon, CheckIcon } from "@/shared/components/Icons";
import { ASPECT_RATIOS } from "@/shared/constants/aspect-ratios";
import { VISUALIZATION_STYLES } from "@/shared/constants/styles";
import { renderVisualizationFrame, createProjector } from "@/features/visualization/services/map-renderer.service";
import { renderTimelineVideo } from "../services/video-export.service";

export function ExportModal({
  isOpen,
  onClose,
  points = [],
  places = [],
  style = "normal",
  aspectRatio = "square",
  duration = 10,
  fps = 60,
  isUnlocked = false,
  onRequestUnlock,
}) {
  const previewCanvasRef = useRef(null);
  const animRef = useRef(null);

  const [isRendering, setIsRendering] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const [error, setError] = useState(null);

  // Aspect ratio styling for preview container
  const aspectConfig = ASPECT_RATIOS[aspectRatio] || ASPECT_RATIOS.square;
  const styleConfig = VISUALIZATION_STYLES[style] || VISUALIZATION_STYLES.normal;

  // Animate live preview inside modal
  useEffect(() => {
    if (!isOpen || !previewCanvasRef.current || points.length === 0) return;

    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext("2d");

    let width = 540;
    let height = 540;
    if (aspectRatio === "portrait") {
      width = 360;
      height = 640;
    } else if (aspectRatio === "landscape") {
      width = 640;
      height = 360;
    }

    canvas.width = width;
    canvas.height = height;

    const projector = createProjector(points, width, height, 0.12);
    const projectedPoints = points.map((p) => projector(p));

    let startTime = performance.now();
    const cycleDurationMs = Math.min(8000, duration * 1000);

    function animate(now) {
      const elapsed = (now - startTime) % cycleDurationMs;
      const animProgress = elapsed / cycleDurationMs;

      renderVisualizationFrame({
        ctx,
        width,
        height,
        points,
        places,
        progress: animProgress,
        style,
        projector,
        projectedPoints,
      });

      animRef.current = requestAnimationFrame(animate);
    }

    animRef.current = requestAnimationFrame(animate);

    return () => {
      if (animRef.current) {
        cancelAnimationFrame(animRef.current);
        animRef.current = null;
      }
    };
  }, [isOpen, points, places, style, aspectRatio, duration]);

  const handleStartExport = async () => {
    if (!isUnlocked) {
      onRequestUnlock?.();
      return;
    }

    setError(null);
    setIsRendering(true);
    setProgress(0);
    setIsDone(false);

    try {
      const { blob, mimeType } = await renderTimelineVideo({
        points,
        places,
        style,
        durationSeconds: Number(duration),
        aspectRatio,
        fps: Number(fps),
        onProgress: setProgress,
      });

      // Trigger automatic file download
      const ext = mimeType.includes("mp4") ? "mp4" : "webm";
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `animasi-perjalanan-${style}-${duration}s-${fps}fps.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setIsDone(true);
      setTimeout(() => {
        onClose?.();
        setIsDone(false);
      }, 1500);
    } catch (err) {
      setError(err.message || "Gagal merender video.");
    } finally {
      setIsRendering(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={() => !isRendering && onClose?.()}
      title="Pratinjau & Ekspor Video"
      subtitle="EKSPOR VIDEO MP4"
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        {/* Settings Summary Badge */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#98989D] pb-1">
          <span className="px-2.5 py-1 rounded-lg bg-[#2C2C2E] font-semibold text-[#F5F5F7]">
            {aspectConfig.label} ({aspectConfig.ratio})
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-[#2C2C2E] font-semibold text-[#F5F5F7]">
            {duration} Detik
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-[#2C2C2E] font-semibold text-[#F5F5F7]">
            {fps} FPS
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-[#2C2C2E] font-semibold text-[#007AFF]">
            Gaya {styleConfig.label}
          </span>
        </div>

        {/* Live Video Preview Box */}
        <div className="w-full flex items-center justify-center p-3 bg-[#000000] border border-[#2C2C2E] rounded-2xl overflow-hidden min-h-[260px] max-h-[360px]">
          <canvas
            ref={previewCanvasRef}
            className="rounded-xl shadow-2xl max-w-full max-h-[320px] object-contain"
          />
        </div>

        {/* Render Progress or Status */}
        {isRendering && (
          <div className="p-4 rounded-xl bg-[#2C2C2E]/60 border border-[#38383A] space-y-2">
            <div className="flex items-center justify-between text-xs text-[#F5F5F7]">
              <span>Merender {fps} FPS ({duration}s) secara lokal...</span>
              <span className="font-mono font-semibold text-[#007AFF]">
                {progress}%
              </span>
            </div>
            <div className="w-full bg-[#1C1C1E] h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#007AFF] h-full transition-all duration-150 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {isDone && (
          <div className="p-3.5 rounded-xl bg-[#30D158]/10 border border-[#30D158]/20 text-[#30D158] text-xs flex items-center gap-2">
            <CheckIcon className="w-4 h-4" />
            <span>Video berhasil dibuat dan diunduh ke perangkat Anda!</span>
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-xl bg-[#FF453A]/10 border border-[#FF453A]/20 text-[#FF453A] text-xs">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-2 flex items-center justify-end gap-3">
          <Button
            variant="secondary"
            disabled={isRendering}
            onClick={onClose}
          >
            Batal
          </Button>

          <Button
            variant="primary"
            disabled={isRendering}
            onClick={handleStartExport}
            icon={<DownloadIcon className="w-4 h-4" />}
          >
            {isRendering
              ? `Merender (${progress}%)`
              : isDone
              ? "Selesai!"
              : isUnlocked
              ? "Mulai Ekspor Video (MP4)"
              : "Buka Kunci Ekspor MP4"}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
