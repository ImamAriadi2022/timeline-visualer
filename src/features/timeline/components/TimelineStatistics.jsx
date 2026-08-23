import React from "react";
import { formatNumber, formatDistance } from "@/shared/utils/format-number";
import { formatDateRange } from "@/shared/utils/format-date";

export function TimelineStatistics({ summary, className = "" }) {
  if (!summary) return null;

  const stats = [
    {
      label: "Locations",
      value: formatNumber(summary.locations),
      detail: "recorded GPS points",
    },
    {
      label: "Total Distance",
      value: formatDistance(summary.distance),
      detail: "calculated route span",
    },
    {
      label: "Places Visited",
      value: formatNumber(summary.places),
      detail: "stops & destinations",
    },
    {
      label: "Journeys",
      value: formatNumber(summary.journeys),
      detail: "movement segments",
    },
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="p-3.5 rounded-xl bg-[#2C2C2E]/60 border border-[#38383A]/80 flex flex-col justify-between"
          >
            <span className="text-[11px] font-medium text-[#98989D] uppercase tracking-wider">
              {stat.label}
            </span>
            <div className="my-1">
              <span className="text-xl font-bold text-[#F5F5F7] tracking-tight">
                {stat.value}
              </span>
            </div>
            <span className="text-[10px] text-[#6E6E73] truncate">
              {stat.detail}
            </span>
          </div>
        ))}
      </div>

      <div className="px-3.5 py-2.5 rounded-xl bg-[#2C2C2E]/30 border border-[#38383A]/40 flex items-center justify-between text-xs">
        <span className="text-[#98989D]">Date Range</span>
        <span className="font-medium text-[#F5F5F7]">
          {formatDateRange(summary.start, summary.end)}
        </span>
      </div>
    </div>
  );
}
