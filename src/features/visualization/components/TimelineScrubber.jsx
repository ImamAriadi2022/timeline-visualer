"use client";
import React from "react";
import { PlayIcon, PauseIcon, RotateIcon } from "@/shared/components/Icons";
import { formatDate } from "@/shared/utils/format-date";

export function TimelineScrubber({
  progress = 0,
  isPlaying = false,
  onTogglePlay,
  onSeek,
  onReset,
  startDate = null,
  endDate = null,
  currentDate = null,
}) {
  const handleSliderChange = (e) => {
    const val = parseFloat(e.target.value);
    onSeek?.(val);
  };

  const percentage = Math.round(progress * 100);

  return (
    <div className="w-full bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl p-4 sm:p-5 flex flex-col gap-3 shadow-lg">
      {/* Top scrubber info */}
      <div className="flex items-center justify-between text-xs text-[#98989D]">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white">
            {currentDate ? formatDate(currentDate) : `${percentage}%`}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-[#6E6E73]">
          <span>{startDate ? formatDate(startDate) : "Start"}</span>
          <span>—</span>
          <span>{endDate ? formatDate(endDate) : "End"}</span>
        </div>
      </div>

      {/* Main Track & Thumb */}
      <div className="relative flex items-center w-full group py-1">
        <input
          type="range"
          min="0"
          max="1"
          step="0.001"
          value={progress}
          onChange={handleSliderChange}
          className="w-full h-2 bg-[#2C2C2E] rounded-lg appearance-none cursor-pointer accent-[#007AFF] focus:outline-none"
          aria-label="Timeline progress scrubber"
        />
      </div>

      {/* Bottom Controls */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onTogglePlay}
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#007AFF] text-white hover:bg-[#0066d6] active:scale-95 transition-transform"
            aria-label={isPlaying ? "Pause journey playback" : "Play journey playback"}
          >
            {isPlaying ? (
              <PauseIcon className="w-4 h-4" />
            ) : (
              <PlayIcon className="w-4 h-4 ml-0.5" />
            )}
          </button>

          <button
            type="button"
            onClick={onReset}
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#2C2C2E] text-[#98989D] hover:text-[#F5F5F7] hover:bg-[#3A3A3C] active:scale-95 transition-all"
            aria-label="Reset timeline to beginning"
          >
            <RotateIcon className="w-4 h-4" />
          </button>
        </div>

        <div className="text-xs text-[#98989D] font-medium font-mono">
          {percentage}%
        </div>
      </div>
    </div>
  );
}
