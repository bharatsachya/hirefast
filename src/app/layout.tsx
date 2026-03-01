import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Job Platform',
  description: 'Zero-budget, Google-powered Job Platform',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-neutral-50 flex flex-col`}>
        <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          <div className="container mx-auto flex h-14 items-center px-4 md:px-6">
            <Link href="/" className="flex items-center space-x-2">
              <span className="font-bold text-xl tracking-tight text-blue-600">Job Portal</span>
            </Link>
            <nav className="ml-auto flex items-center space-x-6 text-sm font-medium">
              <Link
                href="/jobs"
                className="text-neutral-600 transition-colors hover:text-neutral-950"
              >
                Browse Jobs
              </Link>
              <Link
                href="/post-job"
                className="text-blue-600 transition-colors hover:text-blue-700 font-semibold"
              >
                Post a Job
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1">
          {children}
        </main>
        <footer className="border-t py-6 md:py-0">
          <div className="container mx-auto flex flex-col items-center justify-center gap-4 md:h-24 md:flex-row px-4 md:px-6 text-center text-sm leading-loose text-neutral-500">
            <p>
              Powered by Next.js and Google Apps Script.
            </p>
          </div>
        </footer>
        <Toaster />
      </body>
    </html>
  );
}
