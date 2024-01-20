export interface ChatMessage {
    id: string | null;
    role: string | null;
    message: string | null;
    time_stamp: string | Date | null;
    model: string | null;
    thread_id: string | null;
    liked: 0 | 1 | 2;
    user_feedbac: string | null;
    uid: string | null;
}