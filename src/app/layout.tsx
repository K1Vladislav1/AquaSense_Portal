import 'maplibre-gl/dist/maplibre-gl.css';
import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AquaSense Portal',
  description:
    'Портал мониторинга озёр и показателей воды. Просматривайте данные о качестве воды, температуре, прозрачности и других параметрах для различных озёр.',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
