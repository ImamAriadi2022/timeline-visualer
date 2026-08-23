"use client";
import React from "react";
import { VISUALIZATION_STYLES } from "@/shared/constants/styles";

export function StyleSelector({ currentStyle = "normal", onStyleChange }) {
  const stylesList = Object.values(VISUALIZATION_STYLES);

  return (
    <div className="w-full">
      <label className="block text-xs font-semibold text-[#98989D] uppercase tracking-wider mb-2.5">
        Visualization Style
      </label>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1 bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl">
        {stylesList.map((style) => {
          const isSelected = currentStyle === style.id;
          return (
            <button
              key={style.id}
              type="button"
              onClick={() => onStyleChange?.(style.id)}
              className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-lg text-xs font-medium transition-all ${
                isSelected
                  ? "bg-[#2C2C2E] text-white shadow-sm border border-[#38383A]"
                  : "text-[#98989D] hover:text-[#F5F5F7] hover:bg-white/5 border border-transparent"
              }`}
            >
              <span className="font-semibold">{style.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
