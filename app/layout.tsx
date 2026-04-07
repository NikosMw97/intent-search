import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'intent — the end of search',
  description:
    'Tell us what you want. AI understands it, providers compete, you get ranked answers with reasoning. Intent-based internet.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-void text-white bg-grid bg-noise antialiased">
        {/* Ambient background orbs */}
        <div className="orb orb-purple" />
        <div className="orb orb-cyan" />

        <div className="relative z-10 min-h-screen">{children}</div>
      </body>
    </html>
  );
}
