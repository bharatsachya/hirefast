export interface Job {
  id: string;
  title: string;
  company: string;
  description: string;
  driveFolderId: string;
  createdAt: string;
}

export interface CreateJobPayload {
  action: "CREATE_JOB";
  title: string;
  company: string;
  description: string;
  driveFolderId: string;
}

export interface SubmitAppPayload {
  action: "SUBMIT_APP";
  jobId: string;
  name: string;
  email: string;
  fileBase64: string;
  mimeType: string;
  fileName: string;
  driveFolderId: string;
}

export interface GASResponse<T = any> {
  status: "success" | "error";
  message?: string;
  data?: T;
}
