import "./globals.css";

export const metadata = {
  title: "Timeline Visualizer",
  description: "Ubah riwayat Google Maps Timeline Anda menjadi visualisasi rute interaktif dan video MP4.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
