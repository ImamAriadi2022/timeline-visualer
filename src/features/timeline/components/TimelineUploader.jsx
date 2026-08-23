"use client";
import React, { useRef, useState } from "react";
import { UploadIcon } from "@/shared/components/Icons";

export function TimelineUploader({ onFileSelected, isLoading = false, error = null }) {
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

    if (!file.name.toLowerCase().endsWith(".json") && file.type !== "application/json") {
      onFileSelected?.(null, "Silakan pilih file JSON yang valid dari ekspor Google Maps Timeline.");
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      onFileSelected?.(null, "Ukuran file lebih besar dari 100 MB. Silakan gunakan file ekspor yang lebih kecil.");
      return;
    }

    onFileSelected?.(file, null);
  };

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isLoading && fileInputRef.current?.click()}
        className={`group relative flex flex-col items-center justify-center p-10 sm:p-14 border-2 border-dashed rounded-3xl cursor-pointer transition-all duration-200 ${
          isDragging
            ? "border-[#007AFF] bg-[#007AFF]/10 scale-[1.01]"
            : "border-[#38383A] hover:border-[#86868B] bg-[#1C1C1E]/80 hover:bg-[#1C1C1E]"
        } ${isLoading ? "opacity-60 pointer-events-none" : ""}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          onChange={handleFileInputChange}
          className="hidden"
          aria-label="Unggah file JSON Google Maps Timeline"
        />

        <div className="w-16 h-16 rounded-2xl bg-[#2C2C2E] group-hover:bg-[#3A3A3C] flex items-center justify-center text-[#F5F5F7] mb-5 transition-colors shadow-inner">
          <UploadIcon className="w-7 h-7 text-[#007AFF]" />
        </div>

        <h3 className="text-xl sm:text-2xl font-semibold text-white tracking-tight mb-2 text-center">
          {isLoading ? "Membaca Linimasa Anda..." : "Impor Linimasa Anda"}
        </h3>

        <p className="text-sm text-[#98989D] text-center max-w-sm mb-6 leading-relaxed">
          Tarik & lepas file JSON ekspor Google Maps Anda ke sini, atau klik untuk memilih file. Data tidak pernah meninggalkan perangkat Anda.
        </p>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2C2C2E] border border-[#38383A] text-xs font-medium text-[#F5F5F7] group-hover:bg-[#3A3A3C] transition-colors">
          <span>Pilih File</span>
          <span className="text-[#6E6E73]">·</span>
          <span className="text-[#007AFF]">JSON</span>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 rounded-xl bg-[#FF453A]/10 border border-[#FF453A]/20 text-[#FF453A] text-sm text-center">
          {error}
        </div>
      )}
    </div>
  );
}
