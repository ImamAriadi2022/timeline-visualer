"use client";
import React, { useState } from "react";
import { Button } from "@/shared/components/Button";
import { ArrowRightIcon } from "@/shared/components/Icons";
import { onboardingState } from "../services/onboarding.service";

const SLIDES = [
  {
    eyebrow: "01 / DISCOVERY",
    title: "Your journey, visualized.",
    description:
      "Transform your raw Google Maps Timeline export into a smooth, cinematic route animation on your map. Local-first, private by default.",
  },
  {
    eyebrow: "02 / PRIVACY FIRST",
    title: "100% On-Device.",
    description:
      "Your GPS history, visits, and timeline stay on your browser. We never send your location data to any cloud or backend server.",
  },
  {
    eyebrow: "03 / 4 STORY STYLES",
    title: "Craft your aesthetic.",
    description:
      "Choose from Normal, Travel, Transport, and Vehicle styles to bring out the unique rhythm of your trips and commutes.",
  },
  {
    eyebrow: "04 / SHARE & EXPORT",
    title: "Export crisp MP4 videos.",
    description:
      "Render in 9:16 vertical, 1:1 square, or 16:9 landscape video for social stories, reels, or trip documentaries.",
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
          Skip intro
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
              aria-label={`Go to slide ${idx + 1}`}
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
            {currentSlide === SLIDES.length - 1 ? "Get Started" : "Continue"}
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-xs text-[#6E6E73] flex items-center justify-between">
        <span>LOCAL-FIRST · PRIVATE BY DEFAULT</span>
        <span>STEP {currentSlide + 1} OF {SLIDES.length}</span>
      </footer>
    </div>
  );
}
