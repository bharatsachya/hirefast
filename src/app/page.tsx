import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-theme(spacing.14)-theme(spacing.24))] justify-center items-center px-4 relative overflow-hidden">
      {/* Decorative background blur */}
      <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-blue-100 to-transparent -z-10 blur-3xl opacity-50 pointer-events-none" />

      <div className="max-w-3xl space-y-6 text-center z-10">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl bg-gradient-to-br from-neutral-900 to-neutral-600 bg-clip-text text-transparent">
          The Zero-Budget, Google-Powered Job Board
        </h1>
        <p className="mx-auto max-w-[600px] text-lg text-neutral-500 md:text-xl leading-relaxed">
          Manage your job postings and applications directly from Google Sheets and Google Drive.
          No database. No complex setup.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
          <Button asChild size="lg" className="w-full sm:w-auto h-12 px-8 shadow-md">
            <Link href="/jobs">Browse Jobs</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full sm:w-auto h-12 px-8 bg-white hover:bg-neutral-50"
          >
            <Link href="/post-job">Post a Job</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
