export interface AssistantRun {
  assistant_id?: string;
  cancelled_at?: number | null;
  completed_at?: number | null;
  created_at?: number;
  expires_at?: number;
  failed_at?: number | null;
  file_ids?: string[];
  id?: string;
  instructions?: string;
  last_error?: string | null;
  metadata?: Record<string, any>; // Use a more specific type if you know the structure of metadata
  model?: string;
  object?: string;
  started_at?: number | null;
  status?: string;
  thread_id?: string;
  tools?: any[]; // Replace 'any' with a more specific type if you know the structure of the tools
}
