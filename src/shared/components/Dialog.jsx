"use client";
import React, { useEffect } from "react";
import { CloseIcon } from "./Icons";

export function Dialog({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = "max-w-md",
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose?.();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div
        role="dialog"
        aria-modal="true"
        className={`relative w-full ${maxWidth} bg-[#1C1C1E] border border-[#38383A] text-[#F5F5F7] rounded-2xl shadow-2xl p-6 sm:p-8 z-10 transform transition-all animate-scaleUp`}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#98989D] hover:text-[#F5F5F7] p-1.5 rounded-lg hover:bg-white/5 transition-colors"
          aria-label="Close modal"
        >
          <CloseIcon className="w-5 h-5" />
        </button>

        {(title || subtitle) && (
          <div className="mb-6 pr-8">
            {subtitle && (
              <p className="text-[11px] font-semibold tracking-wider text-[#007AFF] uppercase mb-1">
                {subtitle}
              </p>
            )}
            {title && (
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                {title}
              </h2>
            )}
          </div>
        )}

        <div>{children}</div>
      </div>
    </div>
  );
}
