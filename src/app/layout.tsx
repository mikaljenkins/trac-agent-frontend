import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TracAgent',
  description: 'The agent interface for Trac',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`bg-zinc-900 text-white ${inter.className}`}>
        {children}
      </body>
    </html>
  )
}
