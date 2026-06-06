export type JobStatus = "queued" | "compressing" | "done" | "error";

export interface Job {
  id: string;
  file: File;
  originalUrl: string;
  originalSize: number;
  status: JobStatus;
  progress?: number;
  error?: string;
  outputBlob?: Blob;
  outputUrl?: string;
  outputName?: string;
  outputSize?: number;
}

export interface SideBarMenuDto {
  id: string;
  title: string[];
  url?: string[];
  isActive: string[];
  role: string[]; 
};
