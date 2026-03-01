'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchJobs } from '@/lib/gas-client';
import { Job } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadJobs = async () => {
    setIsLoading(true);
    setError(false);
    try {
      const data = await fetchJobs();
      if (!data) {
        throw new Error('Data fetch failed');
      }
      // Assuming empty array is valid, but error if fetch fundamentally threw
      setJobs(data);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  return (
    <div className="container mx-auto py-12 px-4 max-w-5xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Open Positions</h1>
          <p className="text-neutral-500 mt-1">Browse and apply to the latest opportunities.</p>
        </div>
        <Button asChild variant="outline" className="shadow-sm">
          <Link href="/post-job">Post a Job</Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="h-full flex flex-col border-neutral-200">
              <CardHeader className="pb-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="flex-1 pb-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Skeleton className="h-10 w-24" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card className="max-w-md mx-auto mt-12 border-dashed border-2 text-center py-12 px-6">
          <AlertCircle className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">Unable to load jobs right now</h3>
          <p className="text-neutral-500 mb-6 w-full max-w-[300px] mx-auto">
            We're having trouble connecting to our systems. Please try again later.
          </p>
          <Button onClick={loadJobs} variant="outline" className="shadow-sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </Card>
      ) : jobs.length === 0 ? (
        <Card className="max-w-md mx-auto mt-12 border-dashed border-2 text-center py-12 px-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">No open positions</h3>
          <p className="text-neutral-500 mb-6">
            There are currently no active job listings. Check back later or post one yourself!
          </p>
          <Button asChild className="shadow-sm">
            <Link href="/post-job">Post a Job</Link>
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <Card key={job.id} className="h-full flex flex-col shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl line-clamp-1" title={job.title}>{job.title}</CardTitle>
                <CardDescription className="text-sm font-medium text-blue-600 line-clamp-1">
                  {job.company}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 pb-4">
                <p className="text-neutral-600 text-sm line-clamp-3 whitespace-pre-wrap">
                  {job.description}
                </p>
              </CardContent>
              <CardFooter className="pt-0 justify-between items-center border-t py-4">
                <span className="text-xs text-neutral-400 font-medium">
                  {new Date(job.createdAt).toLocaleDateString()}
                </span>
                <Button asChild size="sm">
                  <Link href={`/apply/${job.id}`}>Apply Now</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
