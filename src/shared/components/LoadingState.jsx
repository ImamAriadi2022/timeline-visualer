import React from "react";

export function LoadingState({
  title = "Memuat...",
  message = "Menyiapkan data Anda secara lokal",
  progress = null,
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 min-h-[300px]">
      <div className="relative w-12 h-12 mb-6">
        <div className="w-12 h-12 rounded-full border-2 border-[#38383A] border-t-[#007AFF] animate-spin" />
      </div>

      <h3 className="text-lg font-semibold text-[#F5F5F7] tracking-tight mb-2">
        {title}
      </h3>
      {message && (
        <p className="text-sm text-[#98989D] max-w-sm">{message}</p>
      )}

      {progress != null && (
        <div className="w-48 bg-[#2C2C2E] h-1.5 rounded-full mt-5 overflow-hidden">
          <div
            className="bg-[#007AFF] h-full transition-all duration-300 rounded-full"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      )}
    </div>
  );
}
