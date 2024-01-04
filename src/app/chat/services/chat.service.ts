import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { BehaviorSubject, Observable, catchError, firstValueFrom, interval, map, of, switchMap, takeWhile, tap, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Thread } from '../models/thread.model';
import { StorageService } from './storage.service';
import { AssistantRun } from '../models/assistantrun.model';
import { Message } from '../models/message.model';
import { response } from 'express';
import { UserService } from '../../core/auth/user.service';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private apiUrl = environment.openaiApiUrl; // use environment variable
  assistantId: any = "asst_FdAZP7oZJczaj4FDcQGiK4pi" // fsa assistant id
  thread: Thread = {}; // thread id

  public _messages: BehaviorSubject<any> = new BehaviorSubject<Message[]>([]);
  public $messages: Observable<any> = this._messages.asObservable();

  public _threadLoading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public $threadLoading: Observable<boolean> = this._threadLoading.asObservable();

  public _messageLoading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public $messageLoading: Observable<boolean> = this._messageLoading.asObservable();


  constructor(private http: HttpClient, private storage: StorageService, private userService: UserService) { }


  // create thread
  // createThread(): Observable<Thread> {
  //   const existingThread = this.storage.getItem('thread');
  //   this._threadLoading.next(true);
  //   if (existingThread) {
  //     this.thread = JSON.parse(existingThread) as Thread;
  //      // Deserialize the thread JSON string to an object
  //      // console.log('saved thread', existingThread)
  //     this._threadLoading.next(false);
  //      return of(JSON.parse(existingThread) as Thread);
  //   } else {
  //     return this.http.get<Thread>(`${this.apiUrl}/createthread`).pipe(

  //     tap(thread => {
  //       this.storage.setItem('thread', JSON.stringify(thread)), this.thread = thread, this._threadLoading.next(false),
  //       this.userService.addThread(thread.id!, '')
  //     }),
  //       catchError(error => {
  //         console.error('There was an error!', error);
  //         return throwError(error);
  //       })
  //     );
  //   }
  // }

  async createThread(): Promise<Thread> {
    const existingThread = this.storage.getItem('thread');
    this._threadLoading.next(true);

    if (existingThread) {
      // Deserialize the thread JSON string to an object
      this.thread = JSON.parse(existingThread) as Thread;
      // console.log('saved thread', existingThread);
      this._threadLoading.next(false);
      return JSON.parse(existingThread) as Thread;
    } else {
      try {
        const thread = await firstValueFrom(
          this.http.get<Thread>(`${this.apiUrl}/createthread`).pipe(
            tap(thread => {
              this.storage.setItem('thread', JSON.stringify(thread));
              this.thread = thread;
              this._threadLoading.next(false);
              this.userService.addThread(thread.id!, '');
            })
          )
        );
        return thread;
      } catch (error) {
        console.error('There was an error!', error);
        this._threadLoading.next(false);

        throw error;
      }
    }
  }

  async createNewThread(): Promise<Thread>{
    this.storage.removeItem('thread'); // removing old thread from cache
    this._threadLoading.next(true);

    try {
      const thread = await firstValueFrom(
        this.http.get<Thread>(`${this.apiUrl}/createthread`).pipe(
          tap(thread => {
            this.storage.setItem('thread', JSON.stringify(thread));
            this.thread = thread;
            this._threadLoading.next(false);
            this.userService.addThread(thread.id!, '');
          })
        )
      );
      return thread;
    } catch (error) {
      console.error('There was an error!', error);
      this._threadLoading.next(false);

      throw error;
    }
  }

  // check if thread is already created
  // checkThread(threadId: string): Observable<any> {
  //   let url = '';
  //   url = `${this.apiUrl}/threads/${this.thread.id}`

  //   this.http.get(url).subscribe(
  //     response => {
  //       return of(true)
  //     },
  //     error=>{

  //     }
  //   )
  //   return this.http.get(url);
  // }

  async getThread(threadId: string): Promise<any> {
    try {
      const thread = await firstValueFrom(
        this.http.get<Thread>(`${this.apiUrl}/threads/${threadId}`).pipe(
          tap(thread => {
            this.storage.setItem('thread', JSON.stringify(thread));
            this.thread = thread;
            this._threadLoading.next(false);
            // this.userService.addThread(thread.id!, '');
          })
        )
      );
      return thread;
    } catch (error) {
      console.error('There was an error!', error);
      this._threadLoading.next(false);

      throw error;
    }
  }

  // add messages
  createMessage(content?: string): Observable<any> {
    let url = '';
    this._messageLoading.next(true);
    if(this.thread){
      url = `${this.apiUrl}/createmessage/${this.thread.id}`;
      return this.http.post(url, { content });
    } else {
      return of()
    }
  }

  // run assistant
  runAssistant(instructions?: string): Observable<AssistantRun> {
    let url = '';
    if(this.thread){
      url = `${this.apiUrl}/runassistant/${this.thread.id}`;
    }
    return this.http.post<AssistantRun>(url, { instructions });
  }

  // check run status
  checkRunStatus(runId: string): Observable<any>{
    let url = '';
    if(this.thread){
        url = `${this.apiUrl}/retrieve-run/${this.thread.id}/${runId}`
    }
    return this.http.get(url);
  }

  // poll status
  pollStatus(runId: string): Observable<AssistantRun> {
    // console.log('running polling')
    return interval(500).pipe(
      switchMap(() => this.checkRunStatus(runId)),
      takeWhile((response: AssistantRun) => response.status !== 'completed', true)
    );
  }

  // get messages (response)
   listMessages(): Observable<Message[]> {
    let url = '';
    if(this.thread){
      url = `${this.apiUrl}/list-messages/${this.thread.id}`;
    }
    this._messageLoading.next(false);
    return this.http.get<Message[]>(url);
  }

  async deleteThread(threadId: string): Promise<any> {
    // if (!this.thread) {
    //   throw new Error('No thread to delete');
    // }

    const url = `${this.apiUrl}/delete-thread/${threadId}`;
    // this.userService.removeThread(threadId!);

    try {
      // Wrap the Observable in a Promise
      const response = await firstValueFrom(this.http.get(url)).then(()=>{
        this.userService.removeThread(threadId)
      })

      return response;
    } catch (error) {
      console.error('Error deleting thread:', error);
      throw error;
    }
  }
}
