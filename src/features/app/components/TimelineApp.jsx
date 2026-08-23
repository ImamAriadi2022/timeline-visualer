"use client";
import React, { useState, useEffect } from "react";
import { OnboardingPage } from "@/features/onboarding/pages/OnboardingPage";
import { TimelineImportPage } from "@/features/timeline/pages/TimelineImportPage";
import { TimelineDashboardPage } from "@/features/timeline/pages/TimelineDashboardPage";
import { onboardingState } from "@/features/onboarding/services/onboarding.service";
import { timelineStorage } from "@/features/timeline/services/timeline-storage.service";
import { LoadingState } from "@/shared/components/LoadingState";

export function TimelineApp() {
  const [screen, setScreen] = useState("loading"); // "loading" | "onboarding" | "import" | "dashboard"
  const [timelineData, setTimelineData] = useState(null);

  useEffect(() => {
    async function initApp() {
      try {
        const isFirstTime = !onboardingState.isComplete();
        const savedTimeline = await timelineStorage.load();

        if (savedTimeline && savedTimeline.points?.length > 0) {
          setTimelineData(savedTimeline);
          setScreen(isFirstTime ? "onboarding" : "dashboard");
        } else {
          setScreen(isFirstTime ? "onboarding" : "import");
        }
      } catch {
        setScreen("import");
      }
    }

    initApp();
  }, []);

  const handleFinishOnboarding = () => {
    if (timelineData && timelineData.points?.length > 0) {
      setScreen("dashboard");
    } else {
      setScreen("import");
    }
  };

  const handleTimelineLoaded = (loadedTimeline) => {
    setTimelineData(loadedTimeline);
    setScreen("dashboard");
  };

  const handleReset = async () => {
    await timelineStorage.clear();
    setTimelineData(null);
    setScreen("import");
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

  if (screen === "import") {
    return <TimelineImportPage onTimelineLoaded={handleTimelineLoaded} />;
  }

  return (
    <TimelineDashboardPage
      timeline={timelineData}
      onReset={handleReset}
      onHelp={handleHelp}
    />
  );
}
