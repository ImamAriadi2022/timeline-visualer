"use client";
import React, { useState } from "react";
import { Dialog } from "@/shared/components/Dialog";
import { Button } from "@/shared/components/Button";
import { DownloadIcon } from "@/shared/components/Icons";
import { ASPECT_RATIOS } from "@/shared/constants/aspect-ratios";
import { renderTimelineVideo } from "../services/video-export.service";

export function ExportModal({
  isOpen,
  onClose,
  points = [],
  places = [],
  style = "normal",
  isUnlocked = false,
  onRequestUnlock,
}) {
  const [aspect, setAspect] = useState("square");
  const [duration, setDuration] = useState(10);
  const [isRendering, setIsRendering] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const handleStartExport = async () => {
    if (!isUnlocked) {
      onRequestUnlock?.();
      return;
    }

    if (duration < 5 || duration > 90) {
      setError("Please choose a duration between 5 and 90 seconds.");
      return;
    }

    setError(null);
    setIsRendering(true);
    setProgress(0);

    try {
      const { blob, mimeType } = await renderTimelineVideo({
        points,
        places,
        style,
        durationSeconds: Number(duration),
        aspectRatio: aspect,
        onProgress: setProgress,
      });

      // Trigger automatic file download
      const ext = mimeType.includes("mp4") ? "mp4" : "webm";
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `timeline-journey-${style}-${duration}s.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      onClose?.();
    } catch (err) {
      setError(err.message || "Failed to render video.");
    } finally {
      setIsRendering(false);
      setProgress(0);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={() => !isRendering && onClose?.()}
      title="Export Journey Video"
      subtitle="EXPORT"
      maxWidth="max-w-lg"
    >
      <div className="space-y-6">
        {/* Aspect Ratio Selector */}
        <div>
          <label className="block text-xs font-semibold text-[#98989D] uppercase tracking-wider mb-2.5">
            Format / Aspect Ratio
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {Object.values(ASPECT_RATIOS).map((item) => {
              const selected = aspect === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  disabled={isRendering}
                  onClick={() => setAspect(item.id)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                    selected
                      ? "bg-[#2C2C2E] border-[#007AFF] text-white shadow-sm"
                      : "bg-[#1C1C1E] border-[#38383A] text-[#98989D] hover:border-[#6E6E73] hover:text-[#F5F5F7]"
                  }`}
                >
                  <span className="text-sm font-bold">{item.label}</span>
                  <span className="text-[10px] text-[#6E6E73] mt-0.5">
                    {item.sublabel}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Duration Slider */}
        <div>
          <div className="flex items-center justify-between text-xs font-semibold text-[#98989D] uppercase tracking-wider mb-2">
            <span>Video Duration</span>
            <span className="text-white font-mono text-sm">{duration}s</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-[#6E6E73]">5s</span>
            <input
              type="range"
              min="5"
              max="90"
              step="1"
              value={duration}
              disabled={isRendering}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full h-2 bg-[#2C2C2E] rounded-lg appearance-none cursor-pointer accent-[#007AFF]"
            />
            <span className="text-xs text-[#6E6E73]">90s</span>
          </div>
        </div>

        {/* Render Progress or Error */}
        {isRendering && (
          <div className="p-4 rounded-xl bg-[#2C2C2E]/60 border border-[#38383A] space-y-2">
            <div className="flex items-center justify-between text-xs text-[#F5F5F7]">
              <span>Rendering frames locally...</span>
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

        {error && (
          <div className="p-3.5 rounded-xl bg-[#FF453A]/10 border border-[#FF453A]/20 text-[#FF453A] text-xs">
            {error}
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2 flex items-center justify-end gap-3">
          <Button
            variant="secondary"
            disabled={isRendering}
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button
            variant="primary"
            disabled={isRendering}
            onClick={handleStartExport}
            icon={<DownloadIcon className="w-4 h-4" />}
          >
            {isRendering
              ? `Rendering (${progress}%)`
              : isUnlocked
              ? "Export Video (MP4)"
              : "Unlock MP4 Export"}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
