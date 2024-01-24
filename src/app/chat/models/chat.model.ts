
export interface LiveThread {
  thread_id: string | null;
  thread_name: string | null;
  messages: LiveMessage[] | null;
  creation_date: string | Date | null;
  last_updated: string | Date | null;
  model: string | null;
  user_feedback: string | null;
  last_message: string | null;
  thread_length: number | null;
  assistant_type?: string | null;
  uid: string | null;
  created: boolean | null;
  deleted: boolean | null;
}


export interface LiveMessage {
    id: string | null;
    role: string | null;
    message: string | null;
    time_stamp: string | Date | null;
    model: string | null;
    thread_id: string | null;
    liked: 0 | 1 | 2;
    user_feedback: string | null;
    uid: string | null;
    animate?: boolean | null;
}

export interface OpenAIMesg {
  role: string,
  content: string
}

