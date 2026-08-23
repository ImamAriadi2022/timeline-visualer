"use client";
import React, { useState } from "react";
import { TimelineUploader } from "../components/TimelineUploader";
import { parseTimelineJson } from "../services/timeline-parser.service";
import { normalizeTimelineData } from "../services/timeline-normalizer.service";
import { timelineStorage } from "../services/timeline-storage.service";
import { ShieldCheckIcon } from "@/shared/components/Icons";

export function TimelineImportPage({ onTimelineLoaded }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFile = async (file, validationError) => {
    if (validationError) {
      setError(validationError);
      return;
    }
    if (!file) return;

    setError(null);
    setIsLoading(true);

    try {
      const text = await file.text();
      const rawParsed = parseTimelineJson(text);
      const timelineModel = normalizeTimelineData(rawParsed);

      await timelineStorage.save(timelineModel);
      onTimelineLoaded?.(timelineModel);
    } catch (err) {
      setError(
        err.message ||
          "Gagal membaca file Linimasa ini. Pastikan Anda memilih file ekspor Google Maps Timeline yang valid."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] text-[#F5F5F7] flex flex-col justify-between p-6 sm:p-12 lg:p-16">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold tracking-widest text-[#007AFF]">
            TIMELINE VISUALIZER
          </span>
          <span className="text-xs text-[#6E6E73]">·</span>
          <span className="text-xs text-[#98989D]">LOKAL & PRIVAT</span>
        </div>
      </header>

      {/* Main Import Card */}
      <main className="max-w-xl w-full mx-auto my-auto py-8">
        <div className="text-center mb-8">
          <p className="text-xs font-semibold tracking-wider text-[#007AFF] uppercase mb-2">
            01 / IMPOR
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-4">
            Hidupkan riwayat perjalanan Anda.
          </h1>
          <p className="text-[#98989D] text-base leading-relaxed max-w-md mx-auto">
            Pilih file ekspor Google Maps Timeline JSON Anda. Semua proses parsing dan rendering berlangsung secara lokal di browser Anda.
          </p>
        </div>

        <TimelineUploader
          onFileSelected={handleFile}
          isLoading={isLoading}
          error={error}
        />

        {/* Privacy Note */}
        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-[#6E6E73]">
          <ShieldCheckIcon className="w-4 h-4 text-[#30D158]" />
          <span>Privat secara default: Tidak ada data lokasi atau GPS yang dikirim ke server.</span>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-[#6E6E73]">
        Mendukung format Google Maps Timeline & Location History JSON modern
      </footer>
    </div>
  );
}
