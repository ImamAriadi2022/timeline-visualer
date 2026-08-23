<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Arah Project: Timeline Visualizer

Project ini adalah aplikasi web **local-first** untuk mengubah export Google Maps Timeline pengguna menjadi visualisasi rute interaktif dan video MP4. Produk harus terasa seperti aplikasi consumer premium: minimal, tenang, map-first, responsif, dan mudah dipahami pengguna non-teknis.

### Prinsip produk yang tidak boleh dilanggar

- Dataset Timeline, GPS history, lokasi, tempat, dan perjalanan hanya diproses di browser. Jangan pernah kirim data tersebut ke API/server.
- Gunakan IndexedDB untuk dataset Timeline dan LocalStorage hanya untuk preference, status onboarding, dan entitlement export.
- Satu-satunya data yang boleh dikirim ke server adalah screenshot bukti follow Instagram untuk endpoint `POST /api/verify-follow`.
- API key OpenRouter hanya boleh digunakan di server. Jangan gunakan `NEXT_PUBLIC_` untuk secret dan jangan pernah mengekspos key ke client.
- Integrasi OpenRouter harus mengikuti `referensi.md`. Jangan mengubah model, endpoint, atau format request tanpa memeriksa file tersebut lebih dahulu.
- Hasil export harus berupa MP4 sungguhan; gunakan capability detection dan tampilkan pesan requirement browser yang jelas bila encoding MP4 tidak didukung.

### Arsitektur

- Gunakan arsitektur feature-first di `src/features/`. Feature utama: `onboarding`, `timeline`, `visualization`, `video-export`, dan `follow-verification`.
- Setiap feature utama memiliki `components/`, `pages/`, dan `services/`. Logic domain dan browser API tinggal di service feature terkait, bukan di page atau component besar.
- `src/app/` hanya untuk routing Next.js, layout, dan route handler. Route handler harus tipis dan mendelegasikan logic ke feature service.
- Gunakan alias `@/*` untuk import internal; jangan buat deep relative import baru.
- Internal Timeline Model adalah kontrak antarfeture. Parser Google Timeline tidak boleh bocor ke layer visualisasi atau export.
- Jangan memindahkan logic feature ke `shared/` kecuali benar-benar digunakan lintas feature dan tidak bergantung pada domain tertentu.

### UI dan UX

- Gunakan UI minimal seperti produk Apple modern: whitespace cukup, hirarki jelas, palet netral, aksen biru seperlunya, dan tanpa gradient/neon/glassmorphism berlebihan.
- Map/rute adalah fokus visual dashboard. Hindari dashboard CRUD, sidebar besar, card grid generik, emoji, dan elemen dekoratif tanpa fungsi.
- Gunakan SVG/icon library untuk icon, bukan emoji atau Unicode emoji.
- Motion harus singkat, purposeful, dan menghormati `prefers-reduced-motion`.
- Selalu sediakan loading state, empty state, error yang actionable, focus state keyboard, label yang benar, serta layout mobile yang intentional.

### Alur utama yang harus tetap berfungsi

1. Onboarding tersimpan di LocalStorage dan bisa dibuka ulang lewat Help.
2. Import file Timeline -> validasi -> parser/normalizer -> simpan IndexedDB -> dashboard.
3. Dashboard menampilkan rute dan empat style: Normal, Travel, Transport, Vehicle.
4. User memilih aspect ratio dan durasi 5--90 detik lalu preview/export MP4.
5. Bila belum unlock, export membuka Follow Proof gate.
6. Verifikasi screenshot berhasil menyimpan `timeline_mp4_export_unlocked=true` di LocalStorage.

### Sebelum menyerahkan perubahan

- Baca `referensi.md` untuk pekerjaan yang menyentuh OpenRouter.
- Baca dokumentasi Next.js yang relevan di `node_modules/next/dist/docs/` sebelum mengubah pola App Router atau API route.
- Jalankan `npm.cmd run lint` dan `npm.cmd run build`; perbaiki error yang muncul.
- Pertahankan perubahan pengguna yang tidak terkait dan jangan gunakan reset/checkout destruktif.
