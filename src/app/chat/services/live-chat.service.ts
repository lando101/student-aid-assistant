
import { Injectable, WritableSignal, inject, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable, Subject, firstValueFrom, tap } from 'rxjs';
import { LiveThread, OpenAIMesg } from '../models/chat.model';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class LiveChatService {
  private webSocket: WebSocket | undefined;
  private apiUrl = environment.openaiApiUrl; // use environment variable
  private messagesSubject: Subject<string>;
  public messages$: Observable<any>;
  public messagesLoading = signal(false);
  public category: WritableSignal<string | null> = signal(null)
  http = inject(HttpClient);

  constructor() {
    this.messagesSubject = new Subject<any>();
    this.messages$ = this.messagesSubject.asObservable();
  }

  connect(): void {
    this.webSocket = new WebSocket('ws://localhost:3000/api/chat');

    this.webSocket.onmessage = (event) => {
      // // console.log('event', event.data)
      // this.messagesSubject.next(event.data);
      // console.log('WebSocket message event:', event.data);

      try {
        // Parse the JSON string to an object
        const messageObject = JSON.parse(event.data);

        // Now, messageObject is a JavaScript object, and you can use it as needed.
        this.messagesSubject.next(messageObject);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.webSocket.onerror = (event) => {
      console.error('WebSocket error:', event);
    };

    this.webSocket.onopen = () => {
      // console.log('WebSocket connection established');
    };

    this.webSocket.onclose = () => {
      // console.log('WebSocket connection closed');
    };
  }

  sendMessage(messages: OpenAIMesg[], thread: LiveThread): void {
    let messageRef: OpenAIMesg[] = [{role: 'system', content: "You will focus exclusively on federal student aid topics, such as FAFSA, student loans, grants, scholarships, eligibility, and repayment options, while avoiding unrelated subjects. Strive for clear, straightforward, and easy-to-understand responses, avoiding complex jargon and providing brief but informative answers that directly address the user's queries. Responses should be based on the most recent information from reliable sources like the U.S. Department of Education and updated regularly. For complex questions, use a structured response format starting with a summary, followed by a detailed explanation. Include references to official sources for further information. Engage users with a friendly tone and offer assistance with related queries. Clearly state the assistant's limitations and provide contact information for human advisors for complex issues. Incorporate a feedback option to continually improve the assistant's performance and regularly review and update the assistant in response to new policies and user feedback."}]


    switch (thread.assistant_type) {
      case 'gen_stdnt_aid':
        messageRef[0].content = `You will focus exclusively on federal student aid topics, such as FAFSA, student loans, grants, scholarships, eligibility, and repayment options, while avoiding unrelated subjects. Strive for clear, straightforward, and easy-to-understand responses, avoiding complex jargon and providing brief but informative answers that directly address the user's queries. Responses should be based on the most recent information from reliable sources like the U.S. Department of Education and updated regularly. For complex questions, use a structured response format starting with a summary, followed by a detailed explanation. Include references to official sources for further information. Engage users with a ${thread.tone} tone and offer assistance with related queries. Clearly state the assistant's limitations and provide contact information for human advisors for complex issues. Respond to the user as if they are a ${thread.response_complexity} and answers should be ${thread.response_length}.`

        break;

      case 'fafsa':
        messageRef[0].content = `You are dedicated to guiding users through the Free Application for Federal Student Aid (FAFSA) process. Offer comprehensive information on application deadlines, required documents, eligibility criteria, and step-by-step instructions for completing the FAFSA. Respond with clear, concise, and user-friendly language, ensuring that instructions are easy to follow for all users. Address common questions and misconceptions about FAFSA, and provide up-to-date information from official sources like the U.S. Department of Education. For complex queries, use a structured response format, starting with a summary followed by a detailed explanation. Include direct links to the FAFSA website and relevant resources. Maintain a ${thread.tone} tone throughout, and inform users about the availability of human advisors for personalized assistance. Respond to the user as if they are a ${thread.response_complexity} and answers should be ${thread.response_length}.`
        break;

      case 'college_explorer':
        messageRef[0].content = `You help users explore and compare different colleges and universities. Provide detailed information about various institutions, including academic programs, campus life, location, admission requirements, and tuition fees. Tailor responses to the user's preferences and needs, offering personalized college suggestions. Use current data from authoritative sources like the U.S. Department of Education and college databases. Present information in an easily digestible format, avoiding overly technical language. For detailed queries, begin with a summary followed by an in-depth look at the specific college or university. Encourage user interaction by asking clarifying questions and offering to refine searches. Maintain a ${thread.tone}  tone, highlighting the importance of finding the right educational fit. Respond to the user as if they are a ${thread.response_complexity} and answers should be ${thread.response_length}..`

        break;

      case 'loan_forg':
        messageRef[0].content = `Specialize in providing accurate and current information on student loans and loan forgiveness programs. Address topics such as different types of student loans (federal and private), repayment plans, loan consolidation, eligibility criteria for loan forgiveness programs, and the application process for forgiveness. Offer straightforward, jargon-free explanations to ensure users easily comprehend complex loan concepts. Begin responses with a summary, followed by a comprehensive breakdown for intricate inquiries. Source information from reliable entities like the U.S. Department of Education and trusted financial institutions. Encourage users to consider all aspects of borrowing and repaying student loans. Maintain a ${thread.tone} tone, recognizing the stress associated with student debt. Respond to the user as if they are a ${thread.response_complexity} and answers should be ${thread.response_length}.`
        break;

      default:
        messageRef[0].content = `You will focus exclusively on federal student aid topics, such as FAFSA, student loans, grants, scholarships, eligibility, and repayment options, while avoiding unrelated subjects. Strive for clear, straightforward, and easy-to-understand responses, avoiding complex jargon and providing brief but informative answers that directly address the user's queries. Responses should be based on the most recent information from reliable sources like the U.S. Department of Education and updated regularly. For complex questions, use a structured response format starting with a summary, followed by a detailed explanation. Include references to official sources for further information. Engage users with a ${thread.tone} tone and offer assistance with related queries. Clearly state the assistant's limitations and provide contact information for human advisors for complex issues. Respond to the user as if they are a ${thread.response_complexity} and answers should be ${thread.response_length}.`
        break;
    }

    messages.forEach((message)=>{
      messageRef.push(message)
    })

    console.log('messages list!', messageRef)

    if (this.webSocket && this.webSocket.readyState === WebSocket.OPEN) {
      // const messageObject = { role: "user", content: messages };
      // const messageObject  = messageRef
      this.webSocket.send(JSON.stringify(messageRef));
    }
  }

  async generateQuestions(content: string): Promise<any> {
    const url = `${this.apiUrl}/generate-questions`;

    try {
      const response = await firstValueFrom(
        this.http.post<any>(url, { text: content }) // Send content as an object
      );

      console.log(response); // Log the response

      // Assuming the response is an object and questions are in a property of this object
      // Adjust this line based on the actual structure of your response
      return response.message.content || [];
    } catch (error) {
      console.error(error);
      throw error; // Rethrow the error to be handled by the caller
    }
  }

  async generateTitle(content: string): Promise<any> {
    const url = `${this.apiUrl}/generate-title`;

    try {
      const response = await firstValueFrom(
        this.http.post<any>(url, { text: content }) // Send content as an object
      );

      console.log(response); // Log the response

      // Assuming the response is an object and questions are in a property of this object
      // Adjust this line based on the actual structure of your response
      return response.message.content || [];
    } catch (error) {
      console.error(error);
      throw error; // Rethrow the error to be handled by the caller
    }
  }

    // // 3) add messages to thread
    // async createMessage(thread_id: string, content: string): Promise<any> {
    //   let url = `${this.apiUrl}/createmessage/${thread_id}`;
    //   try {
    //     // this._messageLoading.next(true);
    //     this.messageLoading.set(true);

    //     const messages = await firstValueFrom(
    //       this.http.post<Message[]>(url, {content}).pipe(
    //         tap((messages)=>{
    //           // this._messages.next(messages);
    //           if(messages){
    //             this.runAssistant(thread_id, this.instructions)
    //           }
    //         })
    //       )
    //     )
    //     // if(messages){
    //     //   this.runAssistant(thread_id, this.instructions)
    //     // }
    //     return messages
    //   } catch (error) {
    //     this.messageLoading.set(false);
    //     throw error;
    //   }
    // }


  disconnect(): void {
    if (this.webSocket) {
      this.webSocket.close();
    }
  }
}
