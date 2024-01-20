export interface ChatCompletionResponse {
    id: string | null;
    object: string | null;
    created: number | null;
    model: string | null;
    system_fingerprint: string | null;
    choices: Choice[] | null;
  }
  
  export interface Choice {
    index: number | null;
    delta: Delta | null;
    logprobs: any | null;
    finish_reason: string | null;
  }
  
  export interface Delta {
    // Define properties of Delta if they are known
    [key: string]: any | null; // Generic property, adjust as needed
    content: string;
  }
  