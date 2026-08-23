import React from "react";
import { formatDate } from "@/shared/utils/format-date";

export function TimelineSummary({ summary, activePoint = null }) {
  if (!summary) return null;

  return (
    <div className="flex items-center justify-between py-2 text-xs text-[#98989D]">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#30D158] animate-pulse" />
        <span className="font-medium text-[#F5F5F7]">
          {activePoint?.time ? formatDate(activePoint.time) : "Linimasa Aktif"}
        </span>
      </div>
      {activePoint && (
        <span className="text-[#6E6E73] font-mono">
          {activePoint.lat.toFixed(4)}°, {activePoint.lng.toFixed(4)}°
        </span>
      )}
    </div>
  );
}
