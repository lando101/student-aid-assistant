import { Timestamp } from "firebase/firestore";

export interface UserProfile {
  email: string | null,
  first_name: string | null,
  last_name: string | null,
  image: string | null,
  last_login: string | null,
  threads: Threads[] | null,
  uid: string | null,
}

export interface Threads {
  thread_id: string | null,
  thread_name: string | null,
  creation_date: string | Date | null,
  last_message_content: string | null,
  last_updated: string | Date | null
  created: boolean | null;
  deleted: boolean | null;
}
