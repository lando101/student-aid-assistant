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

      const run = await firstValueFrom(
        this.http.post<AssistantRun>(url, {instructions})
      ).then((run)=>{
        if(run) {
          this.pollStatus(run.id!).pipe(
            map(
              (response)=>{
                if (response.status === 'completed'){
                  this.listMessages(thread_id)
                }
              },
              (error: any) =>{
                  throw error;
              }
            )
          )
        }
      })


      return run
    } catch (error) {
      throw error;
    }

  }

  // 5) check run status
  async checkRunStatus(runId: string): Promise<any>{
    const url = `${this.apiUrl}/retrieve-run/${this.thread.id}/${runId}`;
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
  pollStatus(runId: string): Observable<AssistantRun> {
    // console.log('running polling')
    return interval(500).pipe(
      switchMap(() => this.checkRunStatus(runId)),
      takeWhile((response: AssistantRun) => response.status !== 'completed', true)
    );
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
      this.messages.set(messages)
      this.messageLoading.set(false);
      return messages
    } catch (error) {
      this.messageLoading.set(false);
      throw error;
    }
  }

}
