"use client";
import React, { useRef, useEffect } from "react";
import { renderVisualizationFrame } from "../services/map-renderer.service";
import { formatDate } from "@/shared/utils/format-date";

export function TimelineMap({
  points = [],
  places = [],
  progress = 0,
  style = "normal",
  className = "",
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Handle high DPI / Retina displays
    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    const width = Math.floor(rect.width);
    const height = Math.floor(rect.height);

    if (width > 0 && height > 0) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.save();
      ctx.scale(dpr, dpr);
      renderVisualizationFrame({
        ctx,
        width,
        height,
        points,
        places,
        progress,
        style,
      });
      ctx.restore();
    }
  }, [points, places, progress, style]);

  // Current active point for HUD display
  const activeIdx =
    points.length > 0
      ? Math.max(0, Math.min(points.length - 1, Math.floor(progress * (points.length - 1))))
      : 0;
  const currentPoint = points[activeIdx];

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full min-h-[350px] bg-[#0A0A0C] rounded-2xl overflow-hidden border border-[#2C2C2E] shadow-2xl flex items-center justify-center ${className}`}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        aria-label="Animasi peta rute perjalanan interaktif"
      />

      {/* Floating HUD Chip */}
      {currentPoint && (
        <div className="absolute bottom-5 left-5 px-3.5 py-2 rounded-xl bg-[#1C1C1E]/80 backdrop-blur-md border border-[#38383A]/80 text-[#F5F5F7] shadow-lg flex items-center gap-3 text-xs pointer-events-none transition-all">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#007AFF] animate-ping" />
            <span className="font-medium">
              {currentPoint.time ? formatDate(currentPoint.time) : "Titik Perjalanan"}
            </span>
          </div>
          <span className="text-[#6E6E73] font-mono text-[11px]">
            {currentPoint.lat.toFixed(4)}°, {currentPoint.lng.toFixed(4)}°
          </span>
        </div>
      )}
    </div>
  );
}
