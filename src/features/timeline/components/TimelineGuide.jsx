"use client";
import React, { useState } from "react";

const PLATFORMS = [
  { id: "android", label: "Ponsel Android", icon: "📱" },
  { id: "iphone", label: "iPhone / iOS", icon: "🍏" },
  { id: "computer", label: "Komputer / Laptop", icon: "💻" },
];

const STEPS = {
  android: [
    {
      num: "1",
      title: "Buka Aplikasi Google Maps",
      desc: "Buka aplikasi Google Maps di ponsel Anda dan pastikan sudah login ke akun Google Anda.",
    },
    {
      num: "2",
      title: "Buka Menu Linimasa Anda",
      desc: "Ketuk foto profil Anda di pojok kanan atas, lalu pilih menu 'Linimasa Anda' (Your Timeline).",
    },
    {
      num: "3",
      title: "Masuk ke Setelan Linimasa",
      desc: "Ketuk ikon Titik Tiga (⋯) atau ikon Roda Gigi di pojok kanan atas, lalu pilih 'Setelan & privasi Linimasa'.",
    },
    {
      num: "4",
      title: "Ekspor & Simpan Data",
      desc: "Gulir ke bawah dan ketuk 'Ekspor data Linimasa' atau 'Unduh salinan data', lalu simpan file ke ponsel Anda.",
    },
  ],
  iphone: [
    {
      num: "1",
      title: "Buka Google Maps di iPhone",
      desc: "Buka aplikasi Google Maps di iPhone Anda.",
    },
    {
      num: "2",
      title: "Pilih Linimasa Anda",
      desc: "Ketuk ikon profil di pojok kanan atas -> pilih 'Linimasa Anda'.",
    },
    {
      num: "3",
      title: "Buka Setelan Privasi",
      desc: "Ketuk ikon menu (⋯) di kanan atas -> pilih 'Setelan & Privasi Linimasa'.",
    },
    {
      num: "4",
      title: "Simpan File ke Aplikasi Files",
      desc: "Pilih opsi 'Ekspor data Linimasa' dan simpan file ke aplikasi 'Files' di iPhone Anda.",
    },
  ],
  computer: [
    {
      num: "1",
      title: "Buka Google Maps Web",
      desc: "Buka browser di komputer Anda dan kunjungi maps.google.com, lalu pastikan Anda sudah login.",
    },
    {
      num: "2",
      title: "Akses Linimasa Google",
      desc: "Buka menu garis tiga (≡) di pojok kiri atas -> pilih 'Linimasa Anda' (atau akses google.com/maps/timeline).",
    },
    {
      num: "3",
      title: "Unduh Salinan Data",
      desc: "Klik ikon roda gigi setelan di pojok kanan bawah -> pilih 'Unduh salinan semua data Anda'.",
    },
    {
      num: "4",
      title: "Simpan File ke Komputer",
      desc: "Simpan file unduhan tersebut di folder komputer Anda agar mudah dipilih pada langkah berikutnya.",
    },
  ],
};

export function TimelineGuide() {
  const [activePlatform, setActivePlatform] = useState("android");
  const steps = STEPS[activePlatform] || STEPS.android;

  return (
    <div className="w-full bg-[#1C1C1E] border border-[#2C2C2E] rounded-3xl p-5 sm:p-7 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-5 border-b border-[#2C2C2E]">
        <div>
          <span className="text-[11px] font-bold tracking-wider text-[#007AFF] uppercase mb-1 block">
            PANDUAN LANGKAH DEMI LANGKAH
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            Cara Mengambil Data dari Google Maps
          </h2>
        </div>

        {/* Platform Selector Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-[#2C2C2E] rounded-xl self-start sm:self-auto">
          {PLATFORMS.map((p) => {
            const isSelected = activePlatform === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setActivePlatform(p.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isSelected
                    ? "bg-[#007AFF] text-white shadow-sm"
                    : "text-[#98989D] hover:text-white hover:bg-white/5"
                }`}
              >
                <span className="mr-1">{p.icon}</span>
                <span>{p.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {steps.map((step) => (
          <div
            key={step.num}
            className="p-4 rounded-2xl bg-[#2C2C2E]/50 border border-[#38383A]/60 flex gap-3.5 items-start"
          >
            <div className="w-7 h-7 rounded-xl bg-[#007AFF]/15 border border-[#007AFF]/30 flex items-center justify-center text-xs font-bold text-[#007AFF] shrink-0 mt-0.5">
              {step.num}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white mb-1">
                {step.title}
              </h3>
              <p className="text-xs text-[#98989D] leading-relaxed">
                {step.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
