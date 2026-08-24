"use client";
import React from "react";
import { Button } from "@/shared/components/Button";
import { ArrowRightIcon, RouteIcon, SparklesIcon, ShieldCheckIcon, MapPinIcon } from "@/shared/components/Icons";

export function TimelineWelcomePage({ onStart, onUseSample }) {
  return (
    <div className="min-h-screen bg-[#000000] text-[#F5F5F7] flex flex-col justify-between p-6 sm:p-10 lg:p-14 select-none">
      {/* Top Header */}
      <header className="flex items-center justify-between max-w-4xl w-full mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#007AFF] animate-pulse" />
          <span className="text-xs font-bold tracking-widest text-[#F5F5F7]">
            TIMELINE VISUALIZER
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#30D158]">
          <ShieldCheckIcon className="w-4 h-4" />
          <span className="hidden sm:inline font-medium">100% Di Perangkat Anda</span>
        </div>
      </header>

      {/* Main Hero Card */}
      <main className="max-w-4xl w-full mx-auto my-auto py-8 sm:py-12 flex flex-col items-center text-center animate-fadeIn">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#007AFF]/10 border border-[#007AFF]/25 text-[#007AFF] text-xs font-semibold mb-6">
          <SparklesIcon className="w-3.5 h-3.5" />
          <span>Visualisasi Jejak Perjalanan</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-5 max-w-2xl leading-tight">
          Buat Video Animasi dari Jejak Perjalanan Anda
        </h1>

        <p className="text-sm sm:text-base text-[#98989D] max-w-xl leading-relaxed mb-10">
          Ubah catatan tempat dan riwayat bepergian Anda menjadi video animasi peta yang halus dan siap dibagikan ke media sosial.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto mb-12">
          <Button
            size="lg"
            variant="primary"
            onClick={onStart}
            className="w-full sm:w-auto text-base py-4 px-8 rounded-2xl shadow-xl shadow-blue-500/25"
            icon={<ArrowRightIcon className="w-5 h-5" />}
          >
            Hubungkan Timeline
          </Button>

          {onUseSample && (
            <Button
              size="lg"
              variant="secondary"
              onClick={onUseSample}
              className="w-full sm:w-auto text-sm py-4 px-6 rounded-2xl"
              icon={<SparklesIcon className="w-4 h-4 text-[#FF9F0A]" />}
            >
              Coba Data Contoh (Demo)
            </Button>
          )}
        </div>

        {/* Value Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full text-left">
          <div className="p-5 rounded-2xl bg-[#1C1C1E] border border-[#2C2C2E]">
            <div className="w-9 h-9 rounded-xl bg-[#007AFF]/15 text-[#007AFF] flex items-center justify-center mb-3">
              <RouteIcon className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">
              Peta Rute Interaktif
            </h3>
            <p className="text-xs text-[#98989D] leading-relaxed">
              Animasi garis rute dan penanda titik tempat yang pernah Anda kunjungi.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#1C1C1E] border border-[#2C2C2E]">
            <div className="w-9 h-9 rounded-xl bg-[#FF9F0A]/15 text-[#FF9F0A] flex items-center justify-center mb-3">
              <SparklesIcon className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">
              4 Pilihan Gaya Visual
            </h3>
            <p className="text-xs text-[#98989D] leading-relaxed">
              Gaya Normal, Perjalanan, Transportasi, dan Kendaraan untuk setiap momen.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#1C1C1E] border border-[#2C2C2E]">
            <div className="w-9 h-9 rounded-xl bg-[#30D158]/15 text-[#30D158] flex items-center justify-center mb-3">
              <ShieldCheckIcon className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">
              Privasi Terjaga
            </h3>
            <p className="text-xs text-[#98989D] leading-relaxed">
              Semua data disimpan di memori browser Anda tanpa pernah diunggah ke server.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-[#6E6E73] max-w-4xl w-full mx-auto pt-4 border-t border-[#1C1C1E]">
        Timeline Visualizer · Menghidupkan Kenangan Perjalanan Anda
      </footer>
    </div>
  );
}
