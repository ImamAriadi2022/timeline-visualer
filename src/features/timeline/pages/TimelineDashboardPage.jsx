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
import { Button } from "@/shared/components/Button";
import { DownloadIcon, HelpIcon, UploadIcon } from "@/shared/components/Icons";

export function TimelineDashboardPage({ timeline, onReset, onHelp }) {
  const [style, setStyle] = useState("normal");
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isProofOpen, setIsProofOpen] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);

  const animControllerRef = useRef(null);

  // Initialize animation controller
  useEffect(() => {
    const controller = createAnimationController({
      durationSeconds: 12,
      onProgress: (p) => {
        setProgress(p);
      },
      onComplete: () => {
        setIsPlaying(false);
      },
    });

    animControllerRef.current = controller;
    // Auto-play once loaded
    controller.play(0);

    return () => {
      controller.destroy();
    };
  }, [timeline]);

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
      <header className="h-16 px-6 border-b border-[#2C2C2E] flex items-center justify-between shrink-0 bg-[#0A0A0C]">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold tracking-widest text-[#007AFF]">
            TIMELINE VISUALIZER
          </span>
          <span className="text-xs text-[#6E6E73]">/</span>
          <span className="text-xs text-[#98989D] uppercase tracking-wider">
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
            <span>Impor Baru</span>
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
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_380px] overflow-hidden">
        {/* Left: Map Canvas & Scrubber */}
        <main className="flex flex-col p-4 sm:p-6 gap-4 overflow-y-auto">
          <div className="flex-1 min-h-[400px] lg:min-h-[500px]">
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

        {/* Right: Controls & Metrics Sidebar */}
        <aside className="border-t lg:border-t-0 lg:border-l border-[#2C2C2E] bg-[#0A0A0C] p-6 flex flex-col justify-between gap-6 overflow-y-auto">
          <div className="space-y-6">
            {/* Style Selector */}
            <StyleSelector
              currentStyle={style}
              onStyleChange={(newStyle) => setStyle(newStyle)}
            />

            {/* Statistics */}
            <div>
              <label className="block text-xs font-semibold text-[#98989D] uppercase tracking-wider mb-2.5">
                Wawasan Perjalanan
              </label>
              <TimelineStatistics summary={timeline?.summary} />
            </div>
          </div>

          {/* Export Action */}
          <div className="pt-4 border-t border-[#2C2C2E]">
            <Button
              variant="primary"
              size="lg"
              className="w-full shadow-lg"
              onClick={handleOpenExport}
              icon={<DownloadIcon className="w-4 h-4" />}
            >
              Ekspor Video MP4
            </Button>
            <p className="text-[11px] text-[#6E6E73] text-center mt-2.5">
              Render dalam 9:16, 1:1, atau 16:9 di browser Anda
            </p>
          </div>
        </aside>
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        points={points}
        places={timeline?.places || []}
        style={style}
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
