"use client";
import React, { useState, useEffect, useRef } from "react";
import { TimelineMap } from "@/features/visualization/components/TimelineMap";
import { TimelineScrubber } from "@/features/visualization/components/TimelineScrubber";
import { StyleSelector } from "@/features/visualization/components/StyleSelector";
import { TimelineStatistics } from "@/features/timeline/components/TimelineStatistics";
import { ExportModal } from "@/features/video-export/components/ExportModal";
import { FollowProofModal } from "@/features/follow-verification/components/FollowProofModal";
import { createAnimationController } from "@/features/visualization/services/route-animation.service";
import { exportEntitlement } from "@/features/follow-verification/services/entitlement.service";
import { ASPECT_RATIOS } from "@/shared/constants/aspect-ratios";
import { Button } from "@/shared/components/Button";
import { DownloadIcon, HelpIcon, UploadIcon } from "@/shared/components/Icons";

const FPS_OPTIONS = [
  { id: 24, label: "24 FPS", sublabel: "Sinematik" },
  { id: 30, label: "30 FPS", sublabel: "Standar Web" },
  { id: 60, label: "60 FPS", sublabel: "Sangat Mulus" },
];

const DURATION_PRESETS = [10, 15, 30, 60, 90];

export function TimelineDashboardPage({ timeline, onReset, onHelp }) {
  const [style, setStyle] = useState("normal");
  const [aspectRatio, setAspectRatio] = useState("square");
  const [duration, setDuration] = useState(15);
  const [fps, setFps] = useState(30);

  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isProofOpen, setIsProofOpen] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);

  const animControllerRef = useRef(null);

  // Initialize animation controller with user-selected duration
  useEffect(() => {
    const controller = createAnimationController({
      durationSeconds: Math.min(90, Math.max(5, Number(duration))),
      onProgress: (p) => {
        setProgress(p);
      },
      onComplete: () => {
        setIsPlaying(false);
      },
    });

    animControllerRef.current = controller;
    controller.play(0);

    return () => {
      controller.destroy();
    };
  }, [timeline, duration]);

  const handleTogglePlay = () => {
    if (!animControllerRef.current) return;
    if (isPlaying) {
      animControllerRef.current.pause();
      setIsPlaying(false);
    } else {
      animControllerRef.current.play(progress >= 1 ? 0 : progress);
      setIsPlaying(true);
    }
  };

  const handleSeek = (newProgress) => {
    if (!animControllerRef.current) return;
    animControllerRef.current.seek(newProgress);
    setProgress(newProgress);
  };

  const handleReset = () => {
    if (!animControllerRef.current) return;
    animControllerRef.current.seek(0);
    setProgress(0);
    animControllerRef.current.play(0);
    setIsPlaying(true);
  };

  const handleOpenExport = () => {
    const currentUnlocked = exportEntitlement.isUnlocked();
    setIsUnlocked(currentUnlocked);
    if (!currentUnlocked) {
      setIsProofOpen(true);
    } else {
      setIsExportOpen(true);
    }
  };

  // Find active point for dates
  const points = timeline?.points || [];
  const activeIdx =
    points.length > 0
      ? Math.max(0, Math.min(points.length - 1, Math.floor(progress * (points.length - 1))))
      : 0;
  const currentPoint = points[activeIdx];

  return (
    <div className="min-h-screen bg-[#000000] text-[#F5F5F7] flex flex-col">
      {/* Top Header */}
      <header className="h-16 px-4 sm:px-6 border-b border-[#2C2C2E] flex items-center justify-between shrink-0 bg-[#0A0A0C]">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-[#007AFF]" />
          <span className="text-xs font-bold tracking-widest text-[#007AFF]">
            TIMELINE VISUALIZER
          </span>
          <span className="text-xs text-[#6E6E73] hidden sm:inline">/</span>
          <span className="text-xs text-[#98989D] uppercase tracking-wider hidden sm:inline">
            STUDIO
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-[#98989D] hover:text-[#F5F5F7] hover:bg-white/5 transition-colors"
          >
            <UploadIcon className="w-3.5 h-3.5" />
            <span>Ganti Data</span>
          </button>

          <button
            type="button"
            onClick={onHelp}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-[#98989D] hover:text-[#F5F5F7] hover:bg-white/5 transition-colors"
          >
            <HelpIcon className="w-3.5 h-3.5" />
            <span>Bantuan</span>
          </button>
        </div>
      </header>

      {/* Main Studio Workspace */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_400px] overflow-hidden">
        {/* Left: Map Canvas & Scrubber */}
        <main className="flex flex-col p-3 sm:p-6 gap-3 sm:gap-4 overflow-y-auto">
          <div className="flex-1 min-h-[360px] sm:min-h-[460px] lg:min-h-[500px]">
            <TimelineMap
              points={points}
              places={timeline?.places || []}
              progress={progress}
              style={style}
            />
          </div>

          <div className="shrink-0">
            <TimelineScrubber
              progress={progress}
              isPlaying={isPlaying}
              onTogglePlay={handleTogglePlay}
              onSeek={handleSeek}
              onReset={handleReset}
              startDate={timeline?.summary?.start}
              endDate={timeline?.summary?.end}
              currentDate={currentPoint?.time}
            />
          </div>
        </main>

        {/* Right: Controls & Video Configuration Sidebar */}
        <aside className="border-t lg:border-t-0 lg:border-l border-[#2C2C2E] bg-[#0A0A0C] p-4 sm:p-6 flex flex-col justify-between gap-6 overflow-y-auto">
          <div className="space-y-5 sm:space-y-6">
            {/* 1. Style Selector */}
            <StyleSelector
              currentStyle={style}
              onStyleChange={(newStyle) => setStyle(newStyle)}
            />

            {/* 2. Aspect Ratio Selector */}
            <div>
              <label className="block text-xs font-semibold text-[#98989D] uppercase tracking-wider mb-2">
                Rasio Aspek Video
              </label>
              <div className="grid grid-cols-3 gap-2">
                {Object.values(ASPECT_RATIOS).map((item) => {
                  const selected = aspectRatio === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setAspectRatio(item.id)}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${
                        selected
                          ? "bg-[#2C2C2E] border-[#007AFF] text-white shadow-sm"
                          : "bg-[#1C1C1E] border-[#38383A] text-[#98989D] hover:border-[#6E6E73] hover:text-[#F5F5F7]"
                      }`}
                    >
                      <span className="text-xs font-bold">{item.label}</span>
                      <span className="text-[10px] text-[#6E6E73] mt-0.5">
                        {item.ratio}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Duration Selector & Preset Chips */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-[#98989D] uppercase tracking-wider mb-2">
                <span>Durasi Video</span>
                <span className="text-white font-mono text-xs bg-[#1C1C1E] px-2 py-0.5 rounded border border-[#2C2C2E]">
                  {duration} detik
                </span>
              </div>

              {/* Preset Chips */}
              <div className="grid grid-cols-5 gap-1.5 mb-2.5">
                {DURATION_PRESETS.map((sec) => (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => setDuration(sec)}
                    className={`py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      duration === sec
                        ? "bg-[#007AFF] text-white shadow-sm"
                        : "bg-[#1C1C1E] border border-[#2C2C2E] text-[#98989D] hover:text-white"
                    }`}
                  >
                    {sec}s
                  </button>
                ))}
              </div>

              {/* Slider */}
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-[#6E6E73]">5s</span>
                <input
                  type="range"
                  min="5"
                  max="90"
                  step="1"
                  value={duration}
                  onChange={(e) => setDuration(Math.min(90, Number(e.target.value)))}
                  className="w-full h-2 bg-[#2C2C2E] rounded-lg appearance-none cursor-pointer accent-[#007AFF]"
                />
                <span className="text-[10px] text-[#6E6E73]">90s</span>
              </div>
            </div>

            {/* 4. Frame Rate (FPS) Selector */}
            <div>
              <label className="block text-xs font-semibold text-[#98989D] uppercase tracking-wider mb-2">
                Frame Rate (FPS)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {FPS_OPTIONS.map((item) => {
                  const selected = fps === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setFps(item.id)}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all ${
                        selected
                          ? "bg-[#2C2C2E] border-[#007AFF] text-white shadow-sm"
                          : "bg-[#1C1C1E] border-[#38383A] text-[#98989D] hover:border-[#6E6E73] hover:text-[#F5F5F7]"
                      }`}
                    >
                      <span className="text-xs font-bold">{item.label}</span>
                      <span className="text-[9px] text-[#6E6E73] mt-0.5">
                        {item.sublabel}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 5. Statistics */}
            <div>
              <label className="block text-xs font-semibold text-[#98989D] uppercase tracking-wider mb-2.5">
                Wawasan Perjalanan
              </label>
              <TimelineStatistics summary={timeline?.summary} />
            </div>
          </div>

          {/* Export Action Trigger */}
          <div className="pt-4 border-t border-[#2C2C2E]">
            <Button
              variant="primary"
              size="lg"
              className="w-full shadow-lg shadow-blue-500/20 py-3.5"
              onClick={handleOpenExport}
              icon={<DownloadIcon className="w-4 h-4" />}
            >
              Ekspor Video MP4
            </Button>
            <p className="text-[11px] text-[#6E6E73] text-center mt-2">
              {duration}s · {fps} FPS · {ASPECT_RATIOS[aspectRatio]?.label}
            </p>
          </div>
        </aside>
      </div>

      {/* Export Modal with Focused Live Preview & Download */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        points={points}
        places={timeline?.places || []}
        style={style}
        aspectRatio={aspectRatio}
        duration={duration}
        fps={fps}
        isUnlocked={isUnlocked}
        onRequestUnlock={() => {
          setIsExportOpen(false);
          setIsProofOpen(true);
        }}
      />

      {/* Follow Proof Gate Modal */}
      <FollowProofModal
        isOpen={isProofOpen}
        onClose={() => setIsProofOpen(false)}
        onUnlocked={() => {
          setIsUnlocked(true);
          setIsProofOpen(false);
          setIsExportOpen(true);
        }}
      />
    </div>
  );
}
