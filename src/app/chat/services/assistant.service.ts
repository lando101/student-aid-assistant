import { Injectable, WritableSignal, inject, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Thread } from '../models/thread.model';
import { Message } from '../models/message.model';
import { BehaviorSubject, Observable, firstValueFrom, interval, map, of, switchMap, takeWhile, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { StorageService } from './storage.service';
import { UserService } from '../../core/auth/user.service';
import { AssistantRun } from '../models/assistantrun.model';

@Injectable({
  providedIn: 'root'
})
export class AssistantService {
  assistantId: any = "asst_FdAZP7oZJczaj4FDcQGiK4pi" // fsa assistant id

  private apiUrl = environment.openaiApiUrl; // use environment variable

  thread: Thread = {}; // thread id

  //assistant instructions
  instructions: string = 'you are a assistant that is an expert with student aid in the united states. only answer questions related to student aid.'

  // services
  http = inject(HttpClient);
  storage = inject(StorageService);
  userService = inject(UserService)

  // observables
  public _messages: BehaviorSubject<any> = new BehaviorSubject<Message[] | null>(null);
  public $messages: Observable<any> = this._messages.asObservable();

  public _thread: BehaviorSubject<any> = new BehaviorSubject<Thread | null>(null);
  public $thread: Observable<any> = this._thread.asObservable();

  public _threadLoading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public $threadLoading: Observable<boolean> = this._threadLoading.asObservable();

  threadLoading: WritableSignal<boolean> = signal(false)
  messageLoading: WritableSignal<boolean> = signal(false)

  public _messageLoading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public $messageLoading: Observable<boolean> = this._messageLoading.asObservable();
  public messages: WritableSignal<Message[] | null> = signal(null)

  constructor() { }



  // 1) create thread
  async createThread(): Promise<Thread> {
    try {
    this.threadLoading.set(true);
      const thread = await firstValueFrom(
        this.http.get<Thread>(`${this.apiUrl}/createthread`).pipe(
          tap(thread => {
            this.thread = thread;
            this._thread.next(thread);
            this.threadLoading.set(false);
            // this._threadLoading.next(false);
            this.userService.addThread(thread.id!, '');
          })
        )
      );
      return thread;
    } catch (error) {
      console.error('There was an error!', error);
      // this._threadLoading.next(false);
      this.threadLoading.set(false);

      throw error;
    }
  }


  // 2) get thread
  async getThread(threadId: string): Promise<any> {
    try {
      // this._threadLoading.next(true);
      this.threadLoading.set(true);
      const thread = await firstValueFrom(
        this.http.get<Thread>(`${this.apiUrl}/threads/${threadId}`).pipe(
          tap(thread => {
            // this.storage.setItem('thread', JSON.stringify(thread));
            this.thread = thread;
            // this._threadLoading.next(false);
            this.threadLoading.set(false);
            // this.userService.addThread(thread.id!, '');
          })
        )
      );
      if(thread.id){
        this.listMessages(thread.id!);
        return thread;
      }
    } catch (error) {
      console.error('There was an error!', error);
      // this._threadLoading.next(false);
      this.threadLoading.set(false);

      throw error;
    }
  }

  // 3) add messages to thread
  async createMessage(thread_id: string, content: string): Promise<any> {
    let url = `${this.apiUrl}/createmessage/${thread_id}`;
    try {
      // this._messageLoading.next(true);
      this.messageLoading.set(true);

      const messages = await firstValueFrom(
        this.http.post<Message[]>(url, {content}).pipe(
          tap((messages)=>{
            this._messages.next(messages);
            if(messages){
              this.runAssistant(thread_id, this.instructions)
            }
          })
        )
      )
      // if(messages){
      //   this.runAssistant(thread_id, this.instructions)
      // }
      return messages
    } catch (error) {
      this.messageLoading.set(false);
      throw error;
    }
  }
  // 4) run assistant
  async runAssistant(thread_id: string, instructions?: string): Promise<any> {
    try {
      const url = `${this.apiUrl}/runassistant/${thread_id}`;
      const run = await firstValueFrom(this.http.post<AssistantRun>(url, {instructions}));

      console.log('run', run);

      if (run) {
        // Call the new polling function and wait for it to complete
        await this.pollRunStatusUntilCompleted(run);

        // Once polling is complete, list messages
        console.log('Polling complete, listing messages.');
        await this.listMessages(thread_id);
      }

      return run;
    } catch (error) {
      throw error;
    }
  }

  // 5) check run status
  async checkRunStatus(run: AssistantRun): Promise<any>{
    console.log('checking run status')
    const url = `${this.apiUrl}/retrieve-run/${run.thread_id}/${run.id}`;
    try {
      const runStatus = await firstValueFrom(
        this.http.get(url)
      )
      return runStatus

    } catch (error) {
      throw error;
    }
  }
  // 6) poll status :: will run status check api
  async pollRunStatusUntilCompleted(run: AssistantRun): Promise<void> {
    return new Promise((resolve, reject) => {
      const intervalId = setInterval(async () => {
        try {
          const runStatus = await this.checkRunStatus(run);
          console.log('Polling status:', runStatus.status);

          if (runStatus.status === 'completed') {
            clearInterval(intervalId);
            resolve();
          }
        } catch (error) {
          clearInterval(intervalId);
          reject(error);
        }
      }, 500); // Poll every half second
    });
  }

  // get messages after status completed
   async listMessages(thread_id: string): Promise<Message[]> {
    // this._messageLoading.next(true);
    const url = `${this.apiUrl}/list-messages/${thread_id}`
    try {
      const messages = await firstValueFrom(
        this.http.get<Message[]>(url)
      )
      this._messages.next(messages);
      this.messages.set(messages);
      // this.updateMessages(messages)
      this.messageLoading.set(false);
      return messages
    } catch (error) {
      this.messageLoading.set(false);
      throw error;
    }
  }



    // update message list
    // updateMessages(newMessages: Message[]): void {
    //   if (this.messages.length === 0) {
    //     this.messages.set(newMessages);
    //     this._messages.next(this.messages);
    //   } else {
    //     // Assuming newMessages are sorted with the newest first
    //     this.messages()![this.messages.length - 1].id = newMessages[1].id; // replacing locally created message with open ai message
    //     this.messages()!.push(newMessages[0]);
    //     try {
    //       this.userService.updateThread(newMessages[0].thread_id!, 'last_message_content', newMessages[0].content[0].text.value)
    //       this.userService.addMessages(newMessages[0].thread_id!, newMessages[0]).then(()=>{ // adding messages to user in firestore
    //         this.userService.addMessages(newMessages[1].thread_id!, newMessages[1]);
    //       });
    //     } catch (error) {

    //     }

    //     this.chatService._messages.next(this.messages);
    //   }

}
