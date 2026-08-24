"use client";
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/shared/components/Button";
import {
  UploadIcon,
  SparklesIcon,
  ShieldCheckIcon,
  CheckIcon,
  RouteIcon,
  DownloadIcon,
} from "@/shared/components/Icons";
import {
  dataAcquisitionService,
  ACQUISITION_STATES,
} from "../services/data-acquisition.service";
import { pwaService } from "@/features/pwa/services/pwa.service";

export function TimelineAcquisitionPage({
  onTimelineLoaded,
  onBack,
  autoDetect = true,
}) {
  const fileInputRef = useRef(null);
  const [state, setState] = useState(
    autoDetect ? ACQUISITION_STATES.DETECTING : ACQUISITION_STATES.IDLE
  );
  const [errorMessage, setErrorMessage] = useState(null);
  const [isPwaInstalled, setIsPwaInstalled] = useState(false);
  const [canInstallPwa, setCanInstallPwa] = useState(false);
  const [isExportStepOpen, setIsExportStepOpen] = useState(false);

  // Check PWA installation and pending Web Share Target on mount
  useEffect(() => {
    let isMounted = true;

    setIsPwaInstalled(pwaService.isStandalone());

    const unsubscribe = pwaService.onInstallableChange((canInstall) => {
      if (isMounted) {
        setCanInstallPwa(canInstall);
        setIsPwaInstalled(pwaService.isStandalone());
      }
    });

    async function checkIncomingShareOrStored() {
      try {
        const incoming = await dataAcquisitionService.checkIncomingOrStored();
        if (!isMounted) return;

        if (incoming) {
          if (incoming.type === "shared") {
            // Received via Android Share Sheet Web Share Target
            const model = await dataAcquisitionService.processSource(
              incoming.data,
              (newState) => {
                if (isMounted) setState(newState);
              }
            );
            setTimeout(() => {
              if (isMounted) onTimelineLoaded?.(model);
            }, 600);
            return;
          }

          if (incoming.type === "stored" && autoDetect) {
            setState(ACQUISITION_STATES.READY);
            setTimeout(() => {
              if (isMounted) onTimelineLoaded?.(incoming.data);
            }, 600);
            return;
          }
        }

        setState(ACQUISITION_STATES.IDLE);
      } catch (err) {
        if (isMounted) {
          setErrorMessage(err.message || "Data perjalanan belum dapat dibaca.");
          setState(ACQUISITION_STATES.ERROR);
        }
      }
    }

    checkIncomingShareOrStored();

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [autoDetect, onTimelineLoaded]);

  const handleInstallAndConnect = async () => {
    if (canInstallPwa) {
      const accepted = await pwaService.promptInstall();
      if (accepted) {
        setIsPwaInstalled(true);
        setIsExportStepOpen(true);
        return;
      }
    }
    // If browser doesn't trigger prompt or already installed, proceed to step
    setIsExportStepOpen(true);
  };

  const handleOpenTimelineSettings = () => {
    // Open Google Maps Timeline settings
    window.open("https://www.google.com/maps/timeline", "_blank", "noopener,noreferrer");
  };

  const handleProcessFile = async (file) => {
    if (!file) return;

    if (file.size > 100 * 1024 * 1024) {
      setErrorMessage("Ukuran data terlalu besar (maksimal 100 MB).");
      setState(ACQUISITION_STATES.ERROR);
      return;
    }

    setErrorMessage(null);

    try {
      const model = await dataAcquisitionService.processSource(
        file,
        (newState) => setState(newState)
      );
      setTimeout(() => {
        onTimelineLoaded?.(model);
      }, 600);
    } catch (err) {
      setErrorMessage(
        err.message || "Data perjalanan belum dapat dibaca. Pastikan file riwayat sesuai."
      );
      setState(ACQUISITION_STATES.ERROR);
    }
  };

  const handleLoadDemo = async () => {
    setErrorMessage(null);
    setState(ACQUISITION_STATES.NORMALIZING);
    try {
      const sample = await dataAcquisitionService.loadSampleDemo();
      setState(ACQUISITION_STATES.READY);
      setTimeout(() => {
        onTimelineLoaded?.(sample);
      }, 500);
    } catch {
      setErrorMessage("Gagal memuat data contoh. Silakan coba lagi.");
      setState(ACQUISITION_STATES.ERROR);
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] text-[#F5F5F7] flex flex-col justify-between p-5 sm:p-8 lg:p-12 select-none">
      {/* Hidden File Input for Fallback Input */}
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
      <header className="flex items-center justify-between max-w-xl w-full mx-auto">
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
      <main className="max-w-xl w-full mx-auto my-auto py-8 flex flex-col items-center justify-center animate-fadeIn">
        {/* 1. DETECTING STATE */}
        {state === ACQUISITION_STATES.DETECTING && (
          <div className="flex flex-col items-center text-center p-8 space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-[#1C1C1E] border border-[#2C2C2E] flex items-center justify-center shadow-2xl">
              <div className="w-7 h-7 rounded-full border-2 border-[#38383A] border-t-[#007AFF] animate-spin" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Memeriksa data perjalanan...
            </h2>
            <p className="text-xs sm:text-sm text-[#98989D] max-w-sm">
              Mencari data linimasa yang terhubung di perangkat Anda.
            </p>
          </div>
        )}

        {/* 2. RECEIVING STATE */}
        {state === ACQUISITION_STATES.RECEIVING && (
          <div className="flex flex-col items-center text-center p-8 space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-[#007AFF]/15 border border-[#007AFF]/30 flex items-center justify-center shadow-2xl">
              <DownloadIcon className="w-8 h-8 text-[#007AFF] animate-bounce" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Menerima data perjalanan...
            </h2>
            <p className="text-xs sm:text-sm text-[#98989D] max-w-sm">
              Menerima file dari Android Share Sheet.
            </p>
          </div>
        )}

        {/* 3. VALIDATING / PARSING / NORMALIZING STATE */}
        {(state === ACQUISITION_STATES.VALIDATING ||
          state === ACQUISITION_STATES.PARSING ||
          state === ACQUISITION_STATES.NORMALIZING) && (
          <div className="flex flex-col items-center text-center p-8 space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-[#007AFF]/10 border border-[#007AFF]/30 flex items-center justify-center shadow-2xl">
              <RouteIcon className="w-8 h-8 text-[#007AFF] animate-pulse" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {state === ACQUISITION_STATES.VALIDATING
                ? "Memeriksa data perjalanan..."
                : state === ACQUISITION_STATES.PARSING
                ? "Membaca perjalanan Anda..."
                : "Menyiapkan linimasa..."}
            </h2>
            <p className="text-xs sm:text-sm text-[#98989D] max-w-sm">
              Memproses rute dan tempat singgah secara lokal di ponsel Anda.
            </p>
          </div>
        )}

        {/* 4. READY STATE */}
        {state === ACQUISITION_STATES.READY && (
          <div className="flex flex-col items-center text-center p-8 space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-[#30D158]/15 border border-[#30D158]/30 flex items-center justify-center shadow-2xl">
              <CheckIcon className="w-8 h-8 text-[#30D158]" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Linimasa siap.
            </h2>
            <p className="text-xs sm:text-sm text-[#98989D] max-w-sm">
              Membuka preview visualisasi peta...
            </p>
          </div>
        )}

        {/* 5. PRIMARY CONNECTION / PWA SHARE TARGET FLOW */}
        {(state === ACQUISITION_STATES.IDLE ||
          state === ACQUISITION_STATES.ERROR ||
          state === ACQUISITION_STATES.FALLBACK) && (
          <div className="w-full space-y-5">
            {/* Header Text */}
            <div className="text-center max-w-md mx-auto mb-1">
              <span className="text-[11px] font-bold tracking-wider text-[#007AFF] uppercase mb-1.5 block">
                PENGHUBUNG LINIMASA
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2">
                Hubungkan Timeline
              </h1>
              <p className="text-xs sm:text-sm text-[#98989D] leading-relaxed">
                Kami akan membantu menyiapkan perjalanan Anda langsung dari Google Maps.
              </p>
            </div>

            {/* Error message */}
            {errorMessage && (
              <div className="p-4 rounded-2xl bg-[#FF453A]/10 border border-[#FF453A]/20 text-[#FF453A] text-xs sm:text-sm text-center">
                {errorMessage}
              </div>
            )}

            {/* Step 1: Install PWA Prompt if not standalone and can install */}
            {!isPwaInstalled && !isExportStepOpen ? (
              <div className="p-6 rounded-3xl bg-[#1C1C1E] border border-[#2C2C2E] space-y-4 text-center shadow-xl">
                <div className="w-12 h-12 rounded-2xl bg-[#007AFF]/15 text-[#007AFF] flex items-center justify-center mx-auto">
                  <DownloadIcon className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-white">
                    Pasang Timeline Visualizer
                  </h3>
                  <p className="text-xs text-[#98989D] max-w-xs mx-auto">
                    Pasang Timeline Visualizer agar data perjalanan bisa dikirim langsung ke sini.
                  </p>
                </div>

                <Button
                  size="lg"
                  variant="primary"
                  onClick={handleInstallAndConnect}
                  className="w-full py-3.5 rounded-2xl text-sm font-semibold shadow-lg shadow-blue-500/20"
                >
                  Pasang & Hubungkan
                </Button>
              </div>
            ) : (
              /* Step 2: Export from Google Maps and Share to Timeline Visualizer */
              <div className="p-6 rounded-3xl bg-[#1C1C1E] border border-[#2C2C2E] space-y-5 shadow-xl">
                <div className="space-y-3">
                  <span className="text-xs font-semibold text-[#98989D] uppercase tracking-wider block">
                    3 Langkah Cepat
                  </span>

                  <div className="space-y-2.5">
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-[#2C2C2E]/60">
                      <span className="w-5 h-5 rounded-full bg-[#007AFF] text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        1
                      </span>
                      <span className="text-xs text-[#F5F5F7]">
                        Buka pengaturan Timeline di Google Maps
                      </span>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-xl bg-[#2C2C2E]/60">
                      <span className="w-5 h-5 rounded-full bg-[#007AFF] text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        2
                      </span>
                      <span className="text-xs text-[#F5F5F7]">
                        Export / Bagikan data perjalanan Anda
                      </span>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-xl bg-[#2C2C2E]/60">
                      <span className="w-5 h-5 rounded-full bg-[#30D158] text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        3
                      </span>
                      <span className="text-xs text-[#F5F5F7]">
                        Pilih <strong>Timeline Visualizer</strong> saat membagikan file
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  size="lg"
                  variant="primary"
                  onClick={handleOpenTimelineSettings}
                  className="w-full py-3.5 rounded-2xl text-sm font-semibold shadow-lg shadow-blue-500/20"
                >
                  Buka Pengaturan Timeline
                </Button>
              </div>
            )}

            {/* Quick Demo Button */}
            <div className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-[#1C1C1E]/60 border border-[#2C2C2E]">
              <div className="text-left">
                <span className="text-xs font-semibold text-white block">
                  Ingin langsung melihat pratinjau?
                </span>
                <span className="text-[11px] text-[#98989D]">
                  Coba visualisasi dengan rute contoh.
                </span>
              </div>

              <button
                type="button"
                onClick={handleLoadDemo}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#2C2C2E] hover:bg-[#3A3A3C] border border-[#38383A] text-xs font-semibold text-[#F5F5F7] shrink-0 transition-colors"
              >
                <SparklesIcon className="w-3.5 h-3.5 text-[#FF9F0A]" />
                <span>Gunakan Data Contoh</span>
              </button>
            </div>

            {/* Secondary Fallback File Input */}
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 text-xs text-[#98989D] hover:text-[#F5F5F7] underline underline-offset-4 transition-colors"
              >
                <UploadIcon className="w-3.5 h-3.5" />
                <span>Tambahkan data dari perangkat</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center text-[11px] text-[#6E6E73] max-w-xl w-full mx-auto pt-4 border-t border-[#1C1C1E]">
        Data perjalanan diproses di perangkat Anda selama memungkinkan.
      </footer>
    </div>
  );
}
