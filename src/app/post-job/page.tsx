'use client';

import { useState } from 'react';
import { submitToGAS } from '@/lib/gas-client';
import { CreateJobPayload } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function PostJobPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    description: '',
    driveFolderId: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload: CreateJobPayload = {
      action: 'CREATE_JOB',
      ...formData,
    };

    try {
      const success = await submitToGAS(payload);
      if (success) {
        toast.success('Job posted successfully!');
        setFormData({ title: '', company: '', description: '', driveFolderId: '' });
      } else {
        toast.error('Failed to post job. Please check your configuration and try again.');
      }
    } catch (error) {
      toast.error('An unexpected error occurred while posting the job.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-12 px-4 max-w-2xl">
      <Card className="shadow-lg border-neutral-200/60">
        <CardHeader className="space-y-1 bg-neutral-50/50 rounded-t-xl pb-8">
          <CardTitle className="text-2xl font-bold tracking-tight">Post a New Job</CardTitle>
          <CardDescription className="text-base">
            Fill out the details below. Applications will be saved directly to your Google Drive.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="font-semibold">Job Title</Label>
              <Input
                id="title"
                name="title"
                placeholder="e.g. Senior Frontend Engineer"
                required
                value={formData.title}
                onChange={handleChange}
                disabled={isSubmitting}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company" className="font-semibold">Company Name</Label>
              <Input
                id="company"
                name="company"
                placeholder="e.g. Acme Corp"
                required
                value={formData.company}
                onChange={handleChange}
                disabled={isSubmitting}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="font-semibold">Job Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe the role, responsibilities, and requirements..."
                required
                rows={6}
                value={formData.description}
                onChange={handleChange}
                disabled={isSubmitting}
                className="resize-y"
              />
            </div>

            <div className="space-y-4 pt-2 border-t mt-4">
              <div className="space-y-2">
                <Label htmlFor="driveFolderId" className="font-semibold">Google Drive Folder ID</Label>
                <div className="text-sm text-neutral-500 mb-2">
                  Where should we save candidate resumes?
                </div>
                <Input
                  id="driveFolderId"
                  name="driveFolderId"
                  placeholder="e.g. 1a2b3c4d5e6f7g8h9i0j..."
                  required
                  value={formData.driveFolderId}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="h-11 font-mono text-sm"
                />
              </div>

              <Alert variant="default" className="bg-blue-50/50 border-blue-200 text-blue-800">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-blue-900 font-semibold mb-1">Important: Folder Permissions</AlertTitle>
                <AlertDescription className="text-blue-800/90 text-sm leading-relaxed">
                  1. You can find the Folder ID in the URL when viewing the folder in Drive (the long string of letters and numbers at the end).
                  <br className="mb-1" />
                  2. You must share this folder and give "Editor" access to the Google Apps Script service account email, otherwise candidate uploads will fail silently.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
          <CardFooter className="bg-neutral-50/50 rounded-b-xl py-6 border-t mt-2">
            <Button
              type="submit"
              className="w-full h-12 text-base font-medium shadow-sm transition-all"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing... this might take a moment
                </>
              ) : (
                'Post Job'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
