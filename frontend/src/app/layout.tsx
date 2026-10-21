import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'The Dark Protocol: Harry Potter Cyber & Maths Module',
  description:
    'The Dark Protocol - An interactive magical book platform for the Cyber & Maths competition module featuring animated 3D grimoire opening, Harry Potter narration, sparkle wand cursor trails, 15-minute character timekeeper alerts, dynamic folder allocation, and live challenge rounds.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700;900&family=Cinzel:wght@500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Caveat:wght@600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#060c18] text-neutral-100 antialiased selection:bg-amber-500/30 selection:text-amber-200">
        {children}
      </body>
    </html>
  );
}
