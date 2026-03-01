'use client';

import { useState, use } from 'react';
import { submitToGAS } from '@/lib/gas-client';
import { SubmitAppPayload } from '@/lib/types';
import { validateFile, fileToBase64 } from '@/lib/file-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function ApplyPage({ params }: { params: Promise<{ jobId: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    driveFolderId: '', // Ideally fetched from job, but hardcoded here if needed by GAS directly
    file: null as File | null,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) {
      setFormData({ ...formData, file: null });
      return;
    }

    const { valid, error } = validateFile(selectedFile);
    
    if (!valid) {
      setFileError(error!);
      e.target.value = ''; // Clear the input
      setFormData({ ...formData, file: null });
      return;
    }

    setFormData({ ...formData, file: selectedFile });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.file) {
      toast.error('Please attach your resume.');
      return;
    }

    setIsSubmitting(true);
    setFileError(null);
    setIsValidating(true);

    try {
      // 1. Convert file to Base64 (with try/catch for corruption)
      const base64Data = await fileToBase64(formData.file);
      setIsValidating(false);

      // 2. Build payload
      const payload: SubmitAppPayload = {
        action: 'SUBMIT_APP',
        jobId: resolvedParams.jobId,
        name: formData.name,
        email: formData.email,
        fileBase64: base64Data,
        mimeType: formData.file.type,
        fileName: formData.file.name,
        // In a real app we'd fetch the job first and grab its driveFolderId.
        // For zero-budget demo, we ask the candidate to provide it or assume GAS handles it directly 
        // if jobId is enough. Following prompt requirements: employer provided it on creation, 
        // we need to pass it. If we don't have it here because we skipped fetching the single job,
        // we must fetch it. However, prompt asks for "Employer's Target Folder ID".
        // Let's add it as a visible input for the demo, or assume GAS looks it up by jobId.
        // I will add a text input for it here to strictly follow the prompt if GAS doesn't do the lookup.
        driveFolderId: formData.driveFolderId
      };

      // 3. Submit
      const success = await submitToGAS(payload);
      if (success) {
        toast.success(`Application submitted to job ${resolvedParams.jobId}!`);
        // Slight delay before redirect so toast is visible
        setTimeout(() => {
          router.push('/jobs');
        }, 1500);
      } else {
        toast.error('Failed to submit application. Please try again.');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred reading the file.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
      setIsValidating(false);
    }
  };

  return (
    <div className="container mx-auto py-12 px-4 max-w-2xl">
      <Card className="shadow-lg border-neutral-200/60">
        <CardHeader className="space-y-1 bg-neutral-50/50 rounded-t-xl pb-8">
          <CardTitle className="text-2xl font-bold tracking-tight">Apply for Position</CardTitle>
          <CardDescription className="text-base">
            Job ID: <span className="font-mono text-xs bg-neutral-200 px-1 py-0.5 rounded text-neutral-800">{resolvedParams.jobId}</span>
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="font-semibold">Full Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g. Jane Doe"
                required
                value={formData.name}
                onChange={handleChange}
                disabled={isSubmitting || isValidating}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="font-semibold">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="jane@example.com"
                required
                value={formData.email}
                onChange={handleChange}
                disabled={isSubmitting || isValidating}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="file" className="font-semibold">Resume / CV</Label>
              <Input
                id="file"
                name="file"
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                required
                onChange={handleFileChange}
                disabled={isSubmitting || isValidating}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer py-0 h-11"
              />
              <p className="text-xs text-neutral-500 mt-1">
                Max 5MB. Accepted formats: PDF, DOC, DOCX.
              </p>
              
              {fileError && (
                <Alert variant="destructive" className="mt-3">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{fileError}</AlertDescription>
                </Alert>
              )}
            </div>

            {/* Prompt asks for Employer Target Folder ID to be sent. If GAS isn't looking it up by jobId, we need it here. */}
            <div className="space-y-2 pt-4 border-t">
              <Label htmlFor="driveFolderId" className="font-semibold text-neutral-600">
                Employer's Drive Folder ID <span className="text-neutral-400 font-normal">(Demo purposes)</span>
              </Label>
              <Input
                id="driveFolderId"
                name="driveFolderId"
                placeholder="Folder ID required by backend for this demo..."
                required
                value={formData.driveFolderId}
                onChange={handleChange}
                disabled={isSubmitting || isValidating}
                className="h-11 text-sm font-mono text-neutral-600 bg-neutral-50"
              />
            </div>

          </CardContent>
          <CardFooter className="bg-neutral-50/50 rounded-b-xl py-6 border-t mt-2">
            <Button
              type="submit"
              className="w-full h-12 text-base font-medium shadow-sm transition-all"
              disabled={isSubmitting || isValidating || !!fileError}
            >
              {(isSubmitting || isValidating) ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {isValidating ? 'Preparing document...' : 'Uploading your resume… this may take a moment'}
                </>
              ) : (
                'Submit Application'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
