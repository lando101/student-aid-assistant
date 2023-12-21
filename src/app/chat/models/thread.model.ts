export interface Thread {
  id?: string;
  object?: string;
  created_at?: number;
  metadata?: Record<string, any>; // or a more specific type if you know the structure of metadata
}
