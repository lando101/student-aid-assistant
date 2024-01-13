export interface Message {
  assistant_id?: string;
  content: MessageContent[]; // Assuming content is an array of objects
  created_at?: number;
  file_ids?: string[];
  id?: string;
  metadata?: Record<string, any>; // Use a more specific type if you know the structure of metadata
  object?: string;
  role?: string;
  run_id?: string;
  thread_id?: string;
  liked?: 0 | 1 | 2 | null; // 0 no answer, 1 liked, 2 disliked
}

export interface MessageContent {
  text: MessageDetails
}

export interface MessageDetails {
  annotations?: any[];
  value: string;
}
