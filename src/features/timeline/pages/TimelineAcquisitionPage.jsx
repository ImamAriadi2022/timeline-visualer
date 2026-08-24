"use client";
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/shared/components/Button";
import {
  UploadIcon,
  SparklesIcon,
  ShieldCheckIcon,
  CheckIcon,
  HelpIcon,
  RouteIcon,
} from "@/shared/components/Icons";
import {
  dataAcquisitionService,
  ACQUISITION_STATES,
} from "../services/data-acquisition.service";

export function TimelineAcquisitionPage({
  onTimelineLoaded,
  onBack,
  autoDetect = true,
}) {
  const fileInputRef = useRef(null);
  const [state, setState] = useState(
    autoDetect ? ACQUISITION_STATES.DETECTING : ACQUISITION_STATES.FALLBACK
  );
  const [errorMessage, setErrorMessage] = useState(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Automatic detection on mount
  useEffect(() => {
    let isMounted = true;

    async function runDetection() {
      if (!autoDetect) {
        setState(ACQUISITION_STATES.FALLBACK);
        return;
      }

      setState(ACQUISITION_STATES.DETECTING);
      await new Promise((r) => setTimeout(r, 600));

      try {
        const storedData = await dataAcquisitionService.detectStoredTimeline();
        if (!isMounted) return;

        if (storedData) {
          setState(ACQUISITION_STATES.READY);
          setTimeout(() => {
            if (isMounted) onTimelineLoaded?.(storedData);
          }, 700);
        } else {
          // If no stored data, transition gracefully to ready-to-acquire fallback
          setState(ACQUISITION_STATES.FALLBACK);
        }
      } catch {
        if (isMounted) setState(ACQUISITION_STATES.FALLBACK);
      }
    }

    runDetection();

    return () => {
      isMounted = false;
    };
  }, [autoDetect, onTimelineLoaded]);

  const handleProcessFile = async (file) => {
    if (!file) return;

    if (file.size > 100 * 1024 * 1024) {
      setErrorMessage("Ukuran file terlalu besar (maksimal 100 MB).");
      setState(ACQUISITION_STATES.ERROR);
      return;
    }

    setErrorMessage(null);
    setState(ACQUISITION_STATES.PROCESSING);

    try {
      const model = await dataAcquisitionService.processSource(file);
      setState(ACQUISITION_STATES.READY);
      setTimeout(() => {
        onTimelineLoaded?.(model);
      }, 700);
    } catch (err) {
      setErrorMessage(
        err.message ||
          "Data perjalanan tidak dapat dibaca dari file ini. Pastikan Anda memilih file riwayat dari Google Maps."
      );
      setState(ACQUISITION_STATES.ERROR);
    }
  };

  const handleNativeConnect = async () => {
    setErrorMessage(null);
    // Attempt modern File System Access API first if available
    if (typeof window !== "undefined" && typeof window.showOpenFilePicker === "function") {
      try {
        setState(ACQUISITION_STATES.ACQUIRING);
        const result = await dataAcquisitionService.acquireViaNativePicker();
        if (result) {
          setState(ACQUISITION_STATES.READY);
          setTimeout(() => {
            onTimelineLoaded?.(result);
          }, 700);
          return;
        } else {
          // Cancelled picker
          setState(ACQUISITION_STATES.FALLBACK);
          return;
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          // Fallback to standard input click
          fileInputRef.current?.click();
        } else {
          setState(ACQUISITION_STATES.FALLBACK);
        }
        return;
      }
    }

    // Standard native file input trigger
    fileInputRef.current?.click();
  };

  const handleLoadDemo = async () => {
    setErrorMessage(null);
    setState(ACQUISITION_STATES.PROCESSING);
    try {
      const sample = await dataAcquisitionService.loadSampleDemo();
      setState(ACQUISITION_STATES.READY);
      setTimeout(() => {
        onTimelineLoaded?.(sample);
      }, 600);
    } catch {
      setErrorMessage("Gagal memuat data contoh. Silakan coba lagi.");
      setState(ACQUISITION_STATES.ERROR);
    }
  };

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
      handleProcessFile(file);
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] text-[#F5F5F7] flex flex-col justify-between p-5 sm:p-8 lg:p-12 select-none">
      {/* Hidden File Input for Native OS Picker */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json,text/plain"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleProcessFile(file);
        }}
        className="hidden"
        aria-label="Pilih data perjalanan"
      />

      {/* Top Header */}
      <header className="flex items-center justify-between max-w-2xl w-full mx-auto">
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
          <div className="w-2 h-2 rounded-full bg-[#007AFF]" />
          <span className="text-xs font-bold tracking-widest text-[#F5F5F7]">
            TIMELINE VISUALIZER
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-[#30D158]">
          <ShieldCheckIcon className="w-4 h-4" />
          <span className="hidden sm:inline font-medium">100% Di Perangkat Anda</span>
        </div>
      </header>

      {/* Main Acquisition Workspace */}
      <main className="max-w-2xl w-full mx-auto my-auto py-8 flex flex-col items-center justify-center animate-fadeIn">
        {/* 1. DETECTING STATE */}
        {state === ACQUISITION_STATES.DETECTING && (
          <div className="flex flex-col items-center text-center p-8 space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-[#1C1C1E] border border-[#2C2C2E] flex items-center justify-center shadow-2xl">
              <div className="w-7 h-7 rounded-full border-2 border-[#38383A] border-t-[#007AFF] animate-spin" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Memeriksa data perjalanan yang tersedia...
            </h2>
            <p className="text-xs sm:text-sm text-[#98989D] max-w-sm">
              Mencari sesi linimasa lokal di perangkat Anda secara aman.
            </p>
          </div>
        )}

        {/* 2. PROCESSING / ACQUIRING STATE */}
        {(state === ACQUISITION_STATES.PROCESSING ||
          state === ACQUISITION_STATES.ACQUIRING) && (
          <div className="flex flex-col items-center text-center p-8 space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-[#007AFF]/10 border border-[#007AFF]/30 flex items-center justify-center shadow-2xl">
              <RouteIcon className="w-8 h-8 text-[#007AFF] animate-pulse" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Membaca riwayat tempat & rute...
            </h2>
            <p className="text-xs sm:text-sm text-[#98989D] max-w-sm">
              Menyiapkan koordinat dan jalur visualisasi di browser Anda.
            </p>
          </div>
        )}

        {/* 3. READY STATE */}
        {state === ACQUISITION_STATES.READY && (
          <div className="flex flex-col items-center text-center p-8 space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-[#30D158]/15 border border-[#30D158]/30 flex items-center justify-center shadow-2xl">
              <CheckIcon className="w-8 h-8 text-[#30D158]" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Data Perjalanan Siap!
            </h2>
            <p className="text-xs sm:text-sm text-[#98989D] max-w-sm">
              Membuka studio visualisasi peta...
            </p>
          </div>
        )}

        {/* 4. FALLBACK / DEFAULT ACQUISITION STATE */}
        {(state === ACQUISITION_STATES.FALLBACK ||
          state === ACQUISITION_STATES.ERROR) && (
          <div className="w-full space-y-6">
            {/* Card Content */}
            <div className="text-center max-w-lg mx-auto mb-2">
              <span className="text-[11px] font-bold tracking-wider text-[#007AFF] uppercase mb-1.5 block">
                SIAPKAN LINIMASA
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2">
                Hubungkan Data Perjalanan Anda
              </h1>
              <p className="text-xs sm:text-sm text-[#98989D] leading-relaxed">
                Pilih file riwayat yang Anda dapatkan dari Google Maps, atau coba data contoh untuk melihat animasi rute secara instan.
              </p>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="p-4 rounded-2xl bg-[#FF453A]/10 border border-[#FF453A]/20 text-[#FF453A] text-xs sm:text-sm text-center max-w-lg mx-auto">
                {errorMessage}
              </div>
            )}

            {/* Action Card with Drag-Drop & Direct Button */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`p-6 sm:p-8 rounded-3xl border transition-all ${
                isDragging
                  ? "border-[#007AFF] bg-[#007AFF]/10 scale-[1.01]"
                  : "border-[#2C2C2E] bg-[#1C1C1E]"
              } shadow-2xl`}
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-[#2C2C2E] flex items-center justify-center">
                  <UploadIcon className="w-7 h-7 text-[#007AFF]" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-base sm:text-lg font-semibold text-white">
                    Pilih File Data dari Perangkat
                  </h3>
                  <p className="text-xs text-[#98989D]">
                    File hasil unduhan dari Google Maps di ponsel atau komputer Anda.
                  </p>
                </div>

                {/* Big Primary Action Button */}
                <Button
                  size="lg"
                  variant="primary"
                  onClick={handleNativeConnect}
                  className="w-full sm:w-auto min-w-[220px] py-3.5 px-8 rounded-2xl text-sm font-semibold shadow-lg shadow-blue-500/20"
                  icon={<UploadIcon className="w-4 h-4" />}
                >
                  Hubungkan Data Perjalanan
                </Button>

                <span className="text-[11px] text-[#6E6E73] block pt-1">
                  atau tarik dan lepas file langsung ke area ini
                </span>
              </div>
            </div>

            {/* Quick Demo Button */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-[#1C1C1E]/60 border border-[#2C2C2E]">
              <div className="text-center sm:text-left">
                <span className="text-xs font-semibold text-white block">
                  Belum memiliki data dari Google Maps?
                </span>
                <span className="text-[11px] text-[#98989D]">
                  Lihat demo rute langsung tanpa perlu mengunduh data sendiri.
                </span>
              </div>

              <button
                type="button"
                onClick={handleLoadDemo}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#2C2C2E] hover:bg-[#3A3A3C] border border-[#38383A] text-xs font-semibold text-[#F5F5F7] shrink-0 transition-colors"
              >
                <SparklesIcon className="w-3.5 h-3.5 text-[#FF9F0A]" />
                <span>Gunakan Data Contoh</span>
              </button>
            </div>

            {/* Collapsible Contextual Help Accordion (NOT a tutorial wall) */}
            <div className="rounded-2xl bg-[#1C1C1E]/40 border border-[#2C2C2E]/60 overflow-hidden">
              <button
                type="button"
                onClick={() => setIsHelpOpen((prev) => !prev)}
                className="w-full flex items-center justify-between p-4 text-xs font-medium text-[#98989D] hover:text-[#F5F5F7] transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <HelpIcon className="w-3.5 h-3.5 text-[#007AFF]" />
                  <span>Butuh panduan cara mengunduh data dari Google Maps?</span>
                </div>
                <span>{isHelpOpen ? "▲ Tutup" : "▼ Lihat"}</span>
              </button>

              {isHelpOpen && (
                <div className="p-4 pt-0 text-xs text-[#98989D] space-y-2 border-t border-[#2C2C2E]/40 animate-fadeIn">
                  <div className="flex gap-2 items-start">
                    <span className="text-[#007AFF] font-bold">1.</span>
                    <span>Buka aplikasi <strong>Google Maps</strong> di HP Anda, lalu ketuk <strong>Foto Profil</strong> di kanan atas.</span>
                  </div>
                  <div className="flex gap-2 items-start">
                    <span className="text-[#007AFF] font-bold">2.</span>
                    <span>Pilih <strong>Linimasa Anda</strong> → ketuk ikon menu (⋯) atau setelan → <strong>Setelan & Privasi Linimasa</strong>.</span>
                  </div>
                  <div className="flex gap-2 items-start">
                    <span className="text-[#007AFF] font-bold">3.</span>
                    <span>Ketuk <strong>Ekspor / Unduh Data Linimasa</strong>, lalu pilih file tersebut dengan tombol di atas.</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center text-[11px] text-[#6E6E73] max-w-2xl w-full mx-auto pt-4 border-t border-[#1C1C1E]">
        Semua pemrosesan data linimasa berlangsung secara privat dan lokal di browser Anda.
      </footer>
    </div>
  );
}
