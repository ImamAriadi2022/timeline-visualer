"use client";
import React, { useState } from "react";
import { Button } from "@/shared/components/Button";
import { ArrowRightIcon } from "@/shared/components/Icons";
import { onboardingState } from "../services/onboarding.service";

const SLIDES = [
  {
    eyebrow: "01 / PENJELAJAHAN",
    title: "Perjalanan Anda, divisualisasikan.",
    description:
      "Ubah data ekspor Google Maps Timeline Anda menjadi animasi rute sinematik di peta. Berjalan lokal di perangkat, aman dan privat.",
  },
  {
    eyebrow: "02 / PRIVASI TERJAGA",
    title: "100% Di Perangkat Anda.",
    description:
      "Riwayat GPS, tempat kunjungan, dan linimasa Anda hanya diproses di browser Anda. Kami tidak pernah mengirim data lokasi ke server mana pun.",
  },
  {
    eyebrow: "03 / 4 PILIHAN GAYA",
    title: "Ekspresikan Cerita Anda.",
    description:
      "Pilih dari gaya Normal, Perjalanan, Transportasi, dan Kendaraan untuk menghidupkan setiap jejak langkah dan momen perjalanan Anda.",
  },
  {
    eyebrow: "04 / BAGIKAN & EKSPOR",
    title: "Ekspor Video MP4 Berkualitas.",
    description:
      "Render dalam format vertikal 9:16, persegi 1:1, atau lanskap 16:9 untuk story media sosial, reels, maupun arsip perjalanan Anda.",
  },
];

export function OnboardingPage({ onFinish }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    onboardingState.complete();
    onFinish?.();
  };

  const slide = SLIDES[currentSlide];

  return (
    <div className="min-h-screen bg-[#000000] text-[#F5F5F7] flex flex-col justify-between p-6 sm:p-12 lg:p-16 select-none">
      {/* Top Bar */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold tracking-widest text-[#007AFF]">
            TIMELINE VISUALIZER
          </span>
          <span className="text-xs text-[#6E6E73]">·</span>
          <span className="text-xs text-[#98989D]">STUDIO</span>
        </div>

        <button
          onClick={handleComplete}
          className="text-xs text-[#98989D] hover:text-[#F5F5F7] transition-colors py-1 px-2"
        >
          Lewati pengenalan
        </button>
      </header>

      {/* Main Slide Content */}
      <main className="max-w-2xl w-full my-auto py-12">
        <p className="text-xs font-semibold tracking-wider text-[#007AFF] uppercase mb-4">
          {slide.eyebrow}
        </p>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6 leading-[1.05]">
          {slide.title}
        </h1>

        <p className="text-base sm:text-lg text-[#98989D] max-w-lg leading-relaxed mb-10">
          {slide.description}
        </p>

        {/* Progress indicator */}
        <div className="flex items-center gap-2 mb-8">
          {SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentSlide
                  ? "w-8 bg-[#007AFF]"
                  : "w-2 bg-[#2C2C2E] hover:bg-[#38383A]"
              }`}
              aria-label={`Buka slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* CTA */}
        <div>
          <Button
            size="lg"
            variant="primary"
            onClick={handleNext}
            icon={<ArrowRightIcon className="w-4 h-4" />}
          >
            {currentSlide === SLIDES.length - 1 ? "Mulai Visualisasi" : "Lanjutkan"}
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-xs text-[#6E6E73] flex items-center justify-between">
        <span>LOCAL-FIRST · PRIVAT SECARA DEFAULT</span>
        <span>LANGKAH {currentSlide + 1} DARI {SLIDES.length}</span>
      </footer>
    </div>
  );
}
