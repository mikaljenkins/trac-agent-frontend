import { Inter } from 'next/font/google';
import Link from 'next/link';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'TracAgent',
  description: 'Symbolic chat intelligence system',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`bg-neutral-950 text-neutral-100 ${inter.className}`}> 
        <div className="flex h-screen overflow-hidden">
          <aside className="w-64 border-r border-neutral-800 bg-neutral-900 hidden md:flex flex-col p-4">
            <h2 className="text-xl font-bold mb-6">TracAgent</h2>
            <nav className="flex flex-col gap-2">
              <Link href="/" className="hover:underline">Chat</Link>
              <Link href="/playground" className="hover:underline">Playground</Link>
              <Link href="/stats" className="hover:underline">Stats</Link>
              <Link href="/thoughts" className="hover:underline">Thoughts</Link>
              <Link href="/data" className="hover:underline">Data</Link>
              <Link href="/settings" className="hover:underline">Settings</Link>
            </nav>
          </aside>
          <main className="flex-1 overflow-y-auto p-4">{children}</main>
        </div>
      </body>
    </html>
  );
} 