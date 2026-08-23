"use client";
import React, { useRef, useState } from "react";
import { Dialog } from "@/shared/components/Dialog";
import { Button } from "@/shared/components/Button";
import { UploadIcon, ShieldCheckIcon, CheckIcon } from "@/shared/components/Icons";
import { exportEntitlement } from "../services/entitlement.service";

const TARGET_ACCOUNT = "@timelinevisualizer";

export function FollowProofModal({ isOpen, onClose, onUnlocked }) {
  const fileInputRef = useRef(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setStatusMessage("Please choose a PNG, JPG, or WebP screenshot.");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setStatusMessage("The screenshot must be smaller than 8 MB.");
      return;
    }

    setIsVerifying(true);
    setStatusMessage("Verifying Instagram Follow Proof with AI vision...");

    try {
      const formData = new FormData();
      formData.append("screenshot", file);

      const response = await fetch("/api/verify-follow", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.valid) {
        exportEntitlement.unlock();
        setIsSuccess(true);
        setStatusMessage("Verified! Video export is now unlocked.");
        setTimeout(() => {
          onUnlocked?.();
          onClose?.();
        }, 1200);
      } else {
        setStatusMessage(
          data.reason ||
            "We could not verify the follow. Make sure the target account and Following status are clearly visible."
        );
      }
    } catch {
      setStatusMessage("Verification request failed. Please check your connection and try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={() => !isVerifying && onClose?.()}
      title="Unlock Video Export"
      subtitle="FOLLOW PROOF"
      maxWidth="max-w-md"
    >
      <div className="space-y-6">
        <p className="text-sm text-[#98989D] leading-relaxed">
          Follow <span className="text-white font-semibold">{TARGET_ACCOUNT}</span> on Instagram, then upload a screenshot showing the account and your <span className="text-white font-semibold">Following</span> status.
        </p>

        {/* Upload drop area */}
        <div
          onClick={() => !isVerifying && fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
            isSuccess
              ? "border-[#30D158] bg-[#30D158]/10"
              : "border-[#38383A] hover:border-[#007AFF] bg-[#2C2C2E]/40 hover:bg-[#2C2C2E]/70"
          } ${isVerifying ? "opacity-60 pointer-events-none" : ""}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleFileChange}
            className="hidden"
            aria-label="Upload follow proof screenshot"
          />

          <div className="w-12 h-12 rounded-xl bg-[#2C2C2E] flex items-center justify-center mb-3">
            {isSuccess ? (
              <CheckIcon className="w-6 h-6 text-[#30D158]" />
            ) : isVerifying ? (
              <div className="w-5 h-5 rounded-full border-2 border-[#38383A] border-t-[#007AFF] animate-spin" />
            ) : (
              <UploadIcon className="w-5 h-5 text-[#007AFF]" />
            )}
          </div>

          <span className="text-sm font-semibold text-white mb-1">
            {isSuccess
              ? "Follow Verified!"
              : isVerifying
              ? "Verifying Screenshot..."
              : "Upload Proof Screenshot"}
          </span>

          <span className="text-xs text-[#6E6E73]">
            PNG, JPG, or WebP up to 8 MB
          </span>
        </div>

        {/* Status notice */}
        {statusMessage && (
          <div
            className={`p-3.5 rounded-xl text-xs ${
              isSuccess
                ? "bg-[#30D158]/10 border border-[#30D158]/20 text-[#30D158]"
                : "bg-[#FF453A]/10 border border-[#FF453A]/20 text-[#FF453A]"
            }`}
          >
            {statusMessage}
          </div>
        )}

        <div className="flex items-center gap-2 text-[11px] text-[#6E6E73]">
          <ShieldCheckIcon className="w-3.5 h-3.5 text-[#98989D]" />
          <span>We only inspect the screenshot to verify follow status.</span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            variant="secondary"
            disabled={isVerifying}
            onClick={onClose}
          >
            Close
          </Button>

          <Button
            variant="primary"
            disabled={isVerifying || isSuccess}
            onClick={() => fileInputRef.current?.click()}
          >
            Choose Screenshot
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
