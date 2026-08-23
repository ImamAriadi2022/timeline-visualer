"use client";
import React, { useRef, useState } from "react";
import { UploadIcon, SparklesIcon } from "@/shared/components/Icons";

export function TimelineUploader({
  onFileSelected,
  onUseSample,
  isLoading = false,
  error = null,
}) {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file) => {
    if (!file) return;

    if (file.size > 100 * 1024 * 1024) {
      onFileSelected?.(null, "Ukuran file terlalu besar (maksimal 100 MB). Silakan gunakan file ekspor yang lebih kecil.");
      return;
    }

    onFileSelected?.(file, null);
  };

  return (
    <div className="w-full space-y-4">
      {/* File Drop & Pick Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isLoading && fileInputRef.current?.click()}
        className={`group relative flex flex-col items-center justify-center p-8 sm:p-12 border-2 border-dashed rounded-3xl cursor-pointer transition-all duration-200 ${
          isDragging
            ? "border-[#007AFF] bg-[#007AFF]/10 scale-[1.01]"
            : "border-[#38383A] hover:border-[#007AFF] bg-[#1C1C1E]/90 hover:bg-[#1C1C1E]"
        } ${isLoading ? "opacity-60 pointer-events-none" : ""}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json,text/plain"
          onChange={handleFileInputChange}
          className="hidden"
          aria-label="Pilih file data perjalanan"
        />

        <div className="w-16 h-16 rounded-2xl bg-[#2C2C2E] group-hover:bg-[#007AFF]/20 flex items-center justify-center text-[#F5F5F7] mb-4 transition-colors">
          {isLoading ? (
            <div className="w-6 h-6 rounded-full border-2 border-[#38383A] border-t-[#007AFF] animate-spin" />
          ) : (
            <UploadIcon className="w-7 h-7 text-[#007AFF]" />
          )}
        </div>

        <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight mb-2 text-center">
          {isLoading ? "Sedang Membaca Data Perjalanan..." : "Pilih File Data Perjalanan Anda"}
        </h3>

        <p className="text-xs sm:text-sm text-[#98989D] text-center max-w-md mb-6 leading-relaxed">
          Ketuk di sini atau tarik file hasil unduhan dari Google Maps ke area ini. Kami akan langsung menyiapkan rute Anda.
        </p>

        <div className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#007AFF] text-white text-xs font-semibold shadow-md group-hover:bg-[#0066d6] transition-colors">
          <UploadIcon className="w-4 h-4" />
          <span>Buka File dari Perangkat</span>
        </div>
      </div>

      {/* Alternative Sample Data Button */}
      {onUseSample && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-[#1C1C1E]/60 border border-[#2C2C2E]">
          <div className="text-center sm:text-left">
            <span className="text-xs font-semibold text-white block">
              Belum punya file ekspor Google Maps?
            </span>
            <span className="text-[11px] text-[#98989D]">
              Coba gunakan data contoh untuk melihat cara kerja visualisasi rute.
            </span>
          </div>

          <button
            type="button"
            disabled={isLoading}
            onClick={(e) => {
              e.stopPropagation();
              onUseSample();
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2C2C2E] hover:bg-[#3A3A3C] border border-[#38383A] text-xs font-semibold text-[#F5F5F7] shrink-0 transition-colors"
          >
            <SparklesIcon className="w-3.5 h-3.5 text-[#FF9F0A]" />
            <span>Gunakan Data Contoh</span>
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-[#FF453A]/10 border border-[#FF453A]/20 text-[#FF453A] text-xs sm:text-sm text-center">
          {error}
        </div>
      )}
    </div>
  );
}
