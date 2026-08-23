"use client";
import React, { useState } from "react";
import { TimelineGuide } from "../components/TimelineGuide";
import { TimelineUploader } from "../components/TimelineUploader";
import { parseTimelineJson } from "../services/timeline-parser.service";
import { normalizeTimelineData } from "../services/timeline-normalizer.service";
import { timelineStorage } from "../services/timeline-storage.service";
import { ShieldCheckIcon } from "@/shared/components/Icons";

export function TimelineImportPage({ onTimelineLoaded, onBack, onUseSample }) {
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
          "Gagal membaca file data perjalanan ini. Pastikan Anda memilih file yang baru saja diunduh dari Google Maps."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] text-[#F5F5F7] flex flex-col justify-between p-5 sm:p-8 lg:p-12">
      {/* Top Bar */}
      <header className="flex items-center justify-between max-w-4xl w-full mx-auto">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1 text-xs text-[#98989D] hover:text-white py-1.5 px-2.5 rounded-lg bg-[#1C1C1E] border border-[#2C2C2E] transition-colors mr-2"
            >
              <span>← Kembali</span>
            </button>
          )}
          <span className="text-xs font-bold tracking-widest text-[#007AFF]">
            TIMELINE VISUALIZER
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-[#30D158]">
          <ShieldCheckIcon className="w-4 h-4" />
          <span className="hidden sm:inline font-medium">Privasi Terjaga</span>
        </div>
      </header>

      {/* Main Preparation Workflow */}
      <main className="max-w-4xl w-full mx-auto my-6 space-y-6 animate-fadeIn">
        <div className="text-center max-w-2xl mx-auto mb-6">
          <span className="text-xs font-bold tracking-wider text-[#007AFF] uppercase mb-1 block">
            LANGKAH 1 DARI 2
          </span>
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white mb-2">
            Siapkan Data Perjalanan Anda
          </h1>
          <p className="text-xs sm:text-sm text-[#98989D] leading-relaxed">
            Ikuti panduan mudah di bawah ini untuk mengambil salinan riwayat perjalanan dari aplikasi Google Maps Anda.
          </p>
        </div>

        {/* Step-by-Step Interactive Guide */}
        <TimelineGuide />

        {/* File Picker / Input Section */}
        <div className="pt-2">
          <div className="text-center max-w-xl mx-auto mb-4">
            <span className="text-xs font-bold tracking-wider text-[#30D158] uppercase mb-1 block">
              LANGKAH 2 DARI 2
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-white mb-1">
              Masukkan File yang Telah Anda Dapatkan
            </h2>
            <p className="text-xs text-[#98989D]">
              Pilih file data perjalanan yang sudah Anda unduh dari Google Maps.
            </p>
          </div>

          <TimelineUploader
            onFileSelected={handleFile}
            onUseSample={onUseSample}
            isLoading={isLoading}
            error={error}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-[11px] text-[#6E6E73] max-w-4xl w-full mx-auto pt-4 border-t border-[#1C1C1E]">
        Semua proses pengolahan data berlangsung secara lokal di browser Anda.
      </footer>
    </div>
  );
}
