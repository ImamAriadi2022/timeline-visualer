"use client";
import React, { useState } from "react";
import { Button } from "@/shared/components/Button";
import { ArrowRightIcon, MapPinIcon, RouteIcon, SparklesIcon } from "@/shared/components/Icons";
import { onboardingState } from "../services/onboarding.service";

const ONBOARDING_SLIDES = [
  {
    icon: <RouteIcon className="w-8 h-8 text-[#007AFF]" />,
    tag: "KENANGAN PERJALANAN",
    title: "Ubah Cerita Perjalanan Menjadi Video Animasi",
    description:
      "Lihat kembali kota, tempat liburan, dan petualangan yang pernah Anda kunjungi dalam bentuk video animasi rute yang indah dan hidup.",
  },
  {
    icon: <MapPinIcon className="w-8 h-8 text-[#30D158]" />,
    tag: "PRIVASI 100% AMAN",
    title: "Data Anda Tetap Berada di Ponsel Anda",
    description:
      "Kami menghargai privasi Anda. Semua riwayat tempat dan perjalanan hanya dibuka dan diolah langsung di perangkat Anda, tanpa dikirim ke server mana pun.",
  },
  {
    icon: <SparklesIcon className="w-8 h-8 text-[#FF9F0A]" />,
    tag: "SIAP DIBAGIKAN",
    title: "Pilih Gaya & Bagikan Momen Berharga",
    description:
      "Pilih tampilan rute favorit Anda, sesuaikan durasi dan format video, lalu simpan untuk dibagikan ke Instagram Stories, TikTok, atau kenangan pribadi.",
  },
];

export function OnboardingPage({ onFinish }) {
  const [activeSlide, setActiveSlide] = useState(0);

  const isLastSlide = activeSlide === ONBOARDING_SLIDES.length - 1;

  const handleNext = () => {
    if (!isLastSlide) {
      setActiveSlide((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    onboardingState.complete();
    onFinish?.();
  };

  const slide = ONBOARDING_SLIDES[activeSlide];

  return (
    <div className="min-h-screen bg-[#000000] text-[#F5F5F7] flex flex-col justify-between p-5 sm:p-8 md:p-12 select-none">
      {/* Top Header */}
      <header className="flex items-center justify-between w-full max-w-xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#007AFF]" />
          <span className="text-xs font-bold tracking-widest text-[#F5F5F7]">
            TIMELINE VISUALIZER
          </span>
        </div>

        <button
          type="button"
          onClick={handleComplete}
          className="text-xs font-medium text-[#98989D] hover:text-white py-2 px-3 rounded-lg active:bg-white/5 transition-colors"
        >
          Lewati
        </button>
      </header>

      {/* Main Visual Slide Card */}
      <main className="w-full max-w-xl mx-auto my-auto py-6 sm:py-10 flex flex-col justify-center animate-fadeIn">
        {/* Animated Badge Icon */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-[#1C1C1E] border border-[#2C2C2E] flex items-center justify-center mb-6 shadow-2xl">
          {slide.icon}
        </div>

        <span className="text-[11px] font-bold tracking-wider text-[#007AFF] uppercase mb-2 block">
          {slide.tag}
        </span>

        <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white mb-4 leading-tight">
          {slide.title}
        </h1>

        <p className="text-sm sm:text-base text-[#98989D] leading-relaxed mb-8 max-w-md">
          {slide.description}
        </p>

        {/* Step dots */}
        <div className="flex items-center gap-2 mb-8">
          {ONBOARDING_SLIDES.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveSlide(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === activeSlide
                  ? "w-8 bg-[#007AFF]"
                  : "w-2 bg-[#2C2C2E] hover:bg-[#38383A]"
              }`}
              aria-label={`Slide ke-${idx + 1}`}
            />
          ))}
        </div>

        {/* Big Touch-Friendly CTA Button */}
        <div>
          <Button
            size="lg"
            variant="primary"
            onClick={handleNext}
            className="w-full sm:w-auto min-w-[200px] text-base py-4 px-8 rounded-2xl shadow-lg shadow-blue-500/20"
            icon={<ArrowRightIcon className="w-5 h-5" />}
          >
            {isLastSlide ? "Mulai Buat Linimasa" : "Lanjutkan"}
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-xl mx-auto flex items-center justify-between text-[11px] text-[#6E6E73] pt-4 border-t border-[#1C1C1E]">
        <span>PRIVAT & AMAN DI PERANGKAT</span>
        <span>{activeSlide + 1} / {ONBOARDING_SLIDES.length}</span>
      </footer>
    </div>
  );
}
