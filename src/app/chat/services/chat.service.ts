import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable, catchError, interval, of, switchMap, takeWhile, tap, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Thread } from '../models/thread.model';
import { StorageService } from './storage.service';
import { AssistantRun } from '../models/assistantrun.model';
import { Message } from '../models/message.model';
import { response } from 'express';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private apiUrl = environment.openaiApiUrl; // use environment variable
  assistantId: any = "asst_FdAZP7oZJczaj4FDcQGiK4pi" // fsa assistant id
  thread: Thread = {}; // thread id

  constructor(private http: HttpClient, private storage: StorageService) { }


  // create thread
  createThread(): Observable<Thread> {
    const existingThread = this.storage.getItem('thread');
    if (existingThread) {
      this.thread = JSON.parse(existingThread) as Thread;
       // Deserialize the thread JSON string to an object
       console.log('saved thread', JSON.stringify(existingThread))
       return of(JSON.parse(existingThread) as Thread);
    } else {
      return this.http.get<Thread>(`${this.apiUrl}/createthread`).pipe(
        tap(thread => {this.storage.setItem('thread', JSON.stringify(thread)), this.thread = thread}),
        catchError(error => {
          console.error('There was an error!', error);
          return throwError(error);
        })
      );
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

  // add messages
  createMessage(content?: string): Observable<any> {
    let url = '';
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
    console.log('running polling')
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
    return this.http.get<Message[]>(url);
  }

  // delete thread
  deleteThread(){
    let url = '';
    if(this.thread){
      url = `${this.apiUrl}/delete-thread/${this.thread.id}`;
    }
    return this.http.get(url)
  }
}
