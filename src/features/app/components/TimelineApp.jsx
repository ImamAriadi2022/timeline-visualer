"use client";
import React, { useState, useEffect } from "react";
import { OnboardingPage } from "@/features/onboarding/pages/OnboardingPage";
import { TimelineWelcomePage } from "@/features/timeline/pages/TimelineWelcomePage";
import { TimelineAcquisitionPage } from "@/features/timeline/pages/TimelineAcquisitionPage";
import { TimelineDashboardPage } from "@/features/timeline/pages/TimelineDashboardPage";
import { onboardingState } from "@/features/onboarding/services/onboarding.service";
import { timelineStorage } from "@/features/timeline/services/timeline-storage.service";
import { dataAcquisitionService } from "@/features/timeline/services/data-acquisition.service";
import { LoadingState } from "@/shared/components/LoadingState";

export function TimelineApp() {
  const [screen, setScreen] = useState("loading"); // "loading" | "onboarding" | "welcome" | "prepare" | "dashboard"
  const [timelineData, setTimelineData] = useState(null);

  useEffect(() => {
    async function initApp() {
      try {
        const isFirstTime = !onboardingState.isComplete();
        const savedTimeline = await timelineStorage.load();

        if (isFirstTime) {
          setScreen("onboarding");
        } else if (savedTimeline && savedTimeline.points?.length > 0) {
          setTimelineData(savedTimeline);
          setScreen("dashboard");
        } else {
          setScreen("welcome");
        }
      } catch {
        setScreen("welcome");
      }
    }

    initApp();
  }, []);

  const handleFinishOnboarding = () => {
    if (timelineData && timelineData.points?.length > 0) {
      setScreen("dashboard");
    } else {
      setScreen("welcome");
    }
  };

  const handleStartTimeline = () => {
    setScreen("prepare");
  };

  const handleUseSample = async () => {
    const sample = await dataAcquisitionService.loadSampleDemo();
    setTimelineData(sample);
    setScreen("dashboard");
  };

  const handleTimelineLoaded = (loadedTimeline) => {
    setTimelineData(loadedTimeline);
    setScreen("dashboard");
  };

  const handleReset = async () => {
    await timelineStorage.clear();
    setTimelineData(null);
    setScreen("prepare");
  };

  const handleHelp = () => {
    onboardingState.reset();
    setScreen("onboarding");
  };

  if (screen === "loading") {
    return (
      <div className="min-h-screen bg-[#000000] text-[#F5F5F7] flex items-center justify-center">
        <LoadingState
          title="Timeline Visualizer"
          message="Menyiapkan studio lokal Anda..."
        />
      </div>
    );
  }

  if (screen === "onboarding") {
    return <OnboardingPage onFinish={handleFinishOnboarding} />;
  }

  if (screen === "welcome") {
    return (
      <TimelineWelcomePage
        onStart={handleStartTimeline}
        onUseSample={handleUseSample}
      />
    );
  }

  if (screen === "prepare") {
    return (
      <TimelineAcquisitionPage
        onTimelineLoaded={handleTimelineLoaded}
        onBack={() => setScreen("welcome")}
        autoDetect={false}
      />
    );
  }

  return (
    <TimelineDashboardPage
      timeline={timelineData}
      onReset={handleReset}
      onHelp={handleHelp}
    />
  );
}
