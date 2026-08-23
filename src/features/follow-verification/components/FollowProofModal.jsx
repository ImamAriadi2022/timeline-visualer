"use client";
import React, { useRef, useState } from "react";
import { Dialog } from "@/shared/components/Dialog";
import { Button } from "@/shared/components/Button";
import { UploadIcon, ShieldCheckIcon, CheckIcon } from "@/shared/components/Icons";
import { exportEntitlement } from "../services/entitlement.service";

const TARGET_USERNAME = "imam_dev33";
const TARGET_ACCOUNT = `@${TARGET_USERNAME}`;
const INSTAGRAM_URL = "https://www.instagram.com/imam_dev33?igsi=MWF0OWYzdGVmY2N0OQ==";

export function FollowProofModal({ isOpen, onClose, onUnlocked }) {
  const fileInputRef = useRef(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setStatusMessage("Silakan pilih screenshot gambar berformat PNG, JPG, atau WebP.");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setStatusMessage("Ukuran screenshot harus lebih kecil dari 8 MB.");
      return;
    }

    setIsVerifying(true);
    setStatusMessage("Memverifikasi bukti follow Instagram dengan AI vision...");

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
        setStatusMessage("Berhasil diverifikasi! Fitur ekspor video MP4 kini terbuka.");
        setTimeout(() => {
          onUnlocked?.();
          onClose?.();
        }, 1200);
      } else {
        setStatusMessage(
          data.reason ||
            `Kami tidak dapat memverifikasi tangkapan layar. Pastikan akun ${TARGET_ACCOUNT} dan status Mengikuti (Following) terlihat jelas.`
        );
      }
    } catch {
      setStatusMessage("Permintaan verifikasi gagal. Silakan periksa koneksi Anda dan coba lagi.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={() => !isVerifying && onClose?.()}
      title="Buka Kunci Ekspor Video"
      subtitle="BUKTI FOLLOW"
      maxWidth="max-w-md"
    >
      <div className="space-y-6">
        <p className="text-sm text-[#98989D] leading-relaxed">
          Ikuti (Follow) akun Instagram{" "}
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#007AFF] hover:underline font-semibold"
          >
            {TARGET_ACCOUNT}
          </a>
          , lalu unggah screenshot yang memperlihatkan akun dan status{" "}
          <span className="text-white font-semibold">Mengikuti (Following)</span> Anda.
        </p>

        {/* Direct Link to Instagram */}
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-[#2C2C2E] hover:bg-[#3A3A3C] border border-[#38383A] text-xs font-semibold text-white transition-colors"
        >
          <span>Buka Profil Instagram @{TARGET_USERNAME}</span>
          <svg className="w-3.5 h-3.5 text-[#007AFF]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </a>

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
            aria-label="Unggah screenshot bukti follow Instagram"
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
              ? "Follow Terverifikasi!"
              : isVerifying
              ? "Memverifikasi Tangkapan Layar..."
              : "Unggah Bukti Screenshot"}
          </span>

          <span className="text-xs text-[#6E6E73]">
            PNG, JPG, atau WebP hingga 8 MB
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
          <span>Kami hanya memeriksa screenshot untuk validasi status follow.</span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            variant="secondary"
            disabled={isVerifying}
            onClick={onClose}
          >
            Tutup
          </Button>

          <Button
            variant="primary"
            disabled={isVerifying || isSuccess}
            onClick={() => fileInputRef.current?.click()}
          >
            Pilih Screenshot
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
