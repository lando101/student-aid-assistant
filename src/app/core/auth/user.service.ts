import { Injectable, WritableSignal, inject, signal } from '@angular/core';
import { User } from 'firebase/auth';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Firestore, doc, setDoc, onSnapshot, updateDoc, arrayUnion, arrayRemove, collection } from '@angular/fire/firestore';
import { Threads, UserProfile } from '../../chat/models/user_profile.model';
import { StringFormat } from 'firebase/storage';
import { Timestamp, addDoc, deleteDoc, getDoc, getDocs } from 'firebase/firestore';
import { StorageService } from '../../chat/services/storage.service';
import { AuthenticationService } from '../authentication/authentication.service';
import { Message } from '../../chat/models/message.model';
import { LiveMessage, LiveThread } from '../../chat/models/chat.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  public userSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  public $user: Observable<User> = this.userSubject.asObservable();

  private user!: User;

  private firestore: Firestore = inject(Firestore); // inject Cloud Firestore

  public _userProfile: BehaviorSubject<any> = new BehaviorSubject<UserProfile | null | any>(null);
  public $userProfile: Observable<UserProfile | null | any> = this._userProfile.asObservable();
  public userThreads: WritableSignal<Threads[] | null> = signal(null)
  public userLiveThreads: WritableSignal<LiveThread[] | null> = signal(null)

  public userProfile!: UserProfile | null;

  userProfileKey: string = "userProfile";


  constructor(private storageService: StorageService, private authService: AuthenticationService) {
    // console.log('user service')
    this.authService.$currentUser.subscribe((user) => {
      // console.log('Received user in UserService:', user);
      if (user) {
        this.user = user;
        try {
          const userProfile = this.storageService.getItem(this.userProfileKey);
          // console.log('Retrieved userProfile from storage:', userProfile);
          if (userProfile) {
            this.userProfile = JSON.parse(userProfile);
            this._userProfile.next(this.userProfile);
          } else {
            this.userProfile = null;
            this._userProfile.next(null);
          }
          this.subUserProfile();
          // this.subUserThreads();
          this.subUserLiveThreads();
        } catch (error) {
          console.error('Error parsing userProfile:', error);
          this.userProfile = null;
          this._userProfile.next(null);
        }
      } else {
        // console.log('User object is falsy in UserService.');
      }
    });
  }


   subUserProfile() {
    const unsub = onSnapshot(doc(this.firestore, 'users', this.user.uid), (doc)=>{
      const source = doc.metadata.hasPendingWrites ? "Local" : "Server";
      // console.log(source, " data: ", doc.data());
      if(doc.data()){
        let profile: UserProfile = doc.data() as UserProfile;
        if(this.userProfile?.live_threads){
          profile.live_threads = this.userProfile.live_threads
        } else {
          profile.live_threads = [];
        }

        this.userProfile = profile;
        this._userProfile.next(profile)
        this.storageService.setItem(this.userProfileKey, JSON.stringify(this.userProfile));
      } else {
        // this._userProfile.next(this.createUserProfile())
      }
    });
   }

   subUserThreads() {
    const unsub = onSnapshot(collection(this.firestore, 'users', this.user.uid, 'threads'), (docs)=>{
      this.userProfile!.threads = []; // might need to fix for animations
      docs.forEach((doc)=>{
        // // console.log("threads data: ", doc.data());
        this.userProfile!.threads!.push(doc.data() as Threads)
      });
      this.userThreads.set(this.userProfile!.threads as Threads[])
      this.storageService.setItem(this.userProfileKey, JSON.stringify(this.userProfile));
      this._userProfile.next(this.userProfile);
      // // console.log('user profile with trheads', this.userProfile)
    });
   }

   subUserLiveThreads() {
    const unsub = onSnapshot(collection(this.firestore, 'users', this.user.uid, 'live_threads'), (docs)=>{
      this.userProfile!.live_threads = []; // might need to fix for animations
      docs.forEach((doc)=>{
        console.log("live threads data: ", doc.data());
        let thread = doc.data() as LiveThread
        if(thread.thread_id){
          this.userProfile!.live_threads!.push(doc.data() as LiveThread)
        }
      });
      this.userLiveThreads.set(this.userProfile!.live_threads as LiveThread[])
      // this.storageService.setItem(this.userProfileKey, JSON.stringify(this.userProfile));
      this._userProfile.next(this.userProfile);
      // // console.log('user profile with trheads', this.userProfile)
    });
   }

   async createUserProfile(profile: {email: string, password: string, firstName: string, lastName: string}, uid: string): Promise<any> {
    const { email, firstName, lastName } = profile;

    const docRef = doc(this.firestore, 'users', uid);

    try {
      // Set the document
      await setDoc(docRef, {
        email: email,
        first_name: firstName,
        last_name: lastName,
        image: '',
        last_login: '',
        role: '',
        uid: uid || this.user.uid
      });

      // Fetch the newly created/updated document
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        // console.log('Document data:', docSnap.data());
        this.userProfile = docSnap.data() as UserProfile;
        this.storageService.setItem(this.userProfileKey, JSON.stringify(docSnap.data()));
        return docSnap.data();
      } else {
        // console.log('No such document!');
        try {
          this.storageService.removeItem(this.userProfileKey);
        } catch (error) {

        }
        this.userProfile = null;

        return null;
      }
    } catch (error) {
      console.error('Error writing document: ', error);
      try {
        this.storageService.removeItem(this.userProfileKey);
      } catch (error) {

      }

      this.userProfile = null;
    }
   }




// EVERYTHING BELOW IS FOR OPENAI CHAT

  // add threads to user profile
  async addLiveThread(thread: LiveThread | null, assistant_type?: string | null) {
    const docRef = await addDoc(collection(this.firestore, 'users', this.user.uid, 'live_threads'), {
      thread_name: 'new thread',
      creation_date: new Date().toISOString(),
      last_updated: new Date().toISOString(),
      uid: this.user.uid,
      thread_length: 0,
      response_length: 'medium',
      response_complexity: 'adult',
      tone: 'neutral',
      last_message: null,
      model: null,
      user_feedback: null,
      assistant_type: assistant_type ? assistant_type : null
    })

    const id = docRef.id;

    await updateDoc(docRef, {
      thread_id: id
    })

    return id;
  }

   // add threads to user profile
   async updateLiveThread(thread_id: string, key: string, value: string | Timestamp | number | null) {
    const docRef = doc(this.firestore, 'users', this.user.uid, 'live_threads', thread_id!);

    await updateDoc(docRef, {
      [key]: value,
      last_updated: new Date().toISOString()
    })
  }

  // add threads to user profile
  async updateLiveThreadTuning(thread: LiveThread) {
    const docRef = doc(this.firestore, 'users', this.user.uid, 'live_threads', thread.thread_id!);

    return await updateDoc(docRef, {
      response_complexity: thread.response_complexity,
      response_length: thread.response_length,
      tone: thread.tone,
      assistant_type: thread.assistant_type,
      last_updated: new Date().toISOString()
    })
  }

  async removeLiveThread(thread_id: string | null) {
    const docRef = doc(this.firestore, 'users', this.user.uid, 'live_threads', thread_id!);

    return await deleteDoc(docRef)
   }

  // add message to user profile
  async addLiveMessage(mesg: LiveMessage | null, user: boolean) {
    // const docRef = doc(this.firestore, 'users', this.user.uid, 'live_threads', mesg?.thread_id!, 'live_messages', mesg!.id!);
    // const docRef = doc(this.firestore, 'users', this.user.uid, 'live_threads', mesg?.thread_id!, 'live_messages', 'asdf')
    if(user){
        const docRef = await addDoc(collection(this.firestore, 'users', this.user.uid, 'live_threads', mesg!.thread_id!, 'live_messages'), mesg)

    const id = docRef.id;

    await updateDoc(docRef, {
      id: id
    })
    } else {
      const docRef = doc(this.firestore, 'users', this.user.uid, 'live_threads', mesg!.thread_id!, 'live_messages', mesg!.id!);
      await setDoc(docRef, mesg)
    }

   }

   // update message
   async updateLiveMessage(thread_id: string, message_id: string, key: string, value: any) {
      const docRef = doc(this.firestore, 'users', this.user.uid, 'live_threads', thread_id, 'live_messages', message_id)

      await updateDoc(docRef, {
        [key]: value,
      })
   }

   async getLiveMessages(thread_id: string){
    // // console.log('trying to get messages from firebase')
    const querySnapshot = await getDocs(collection(this.firestore, 'users', this.user.uid, 'live_threads', thread_id, 'live_messages'));
    let messages:LiveMessage[] = []
    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      messages.push(doc.data() as LiveMessage)
      // console.log(doc.id, " => ", doc.data());
    });
    return messages
   }

   // EVERYTHING BELOW IS FOR ASSISTANTS BETA

   // add threads to user profile
   async addThread(thread_id: string | null, thread_name: string | null) {
    const docRef = doc(this.firestore, 'users', this.user.uid, 'threads', thread_id!);
    await setDoc(docRef,{
      thread_id: thread_id, thread_name: thread_name, creation_date: new Date().toUTCString(), last_message_content: '', last_updated: new Date().toUTCString()
    })
   }

   // add message to user profile
   async addMessages(thread_id: string | null, mesg: Message | null) {
    const docRef = doc(this.firestore, 'users', this.user.uid, 'threads', thread_id!, 'messages', mesg!.id!);
    mesg!.liked = 0;

    await setDoc(docRef, mesg);
   }

   // update message
   async updateMessage(thread_id: string, message_id: string, key: string, value: any) {
      const docRef = doc(this.firestore, 'users', this.user.uid, 'threads', thread_id, 'messages', message_id)

      await updateDoc(docRef, {
        [key]: value,
      })
   }

   async getMessages(thread_id: string){
    // // console.log('trying to get messages from firebase')
    const querySnapshot = await getDocs(collection(this.firestore, 'users', this.user.uid, 'threads', thread_id, 'messages'));
    let messages:any[] = []
    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      messages.push(doc.data() as any)
      // console.log(doc.id, " => ", doc.data());
    });
    return messages
   }

  // add threads to user profile
  async updateThread(thread_id: string, key: string, value: string | Timestamp) {
    const docRef = doc(this.firestore, 'users', this.user.uid, 'threads', thread_id!);

    await updateDoc(docRef, {
      [key]: value,
      last_updated: new Date().toUTCString()
    })
  }

   async removeThread(thread_id: string | null) {
    const docRef = doc(this.firestore, 'users', this.user.uid, 'threads', thread_id!);

    return await deleteDoc(docRef)
   }

  //  async getMessages()

   async updateUser(user_id: string, value?: string | null, key?: string | null, user?: UserProfile ): Promise<any> {
    if(user_id){
      const docRef = doc(this.firestore, 'users', user_id);
      if(key){
        return await updateDoc(docRef, {
          [key]: value
        })
      } else if (user) {
        return await updateDoc(docRef, {
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          image: null,
          last_login: null,
          role: user.role
        })
      }

    } else {
      return 'error'
    }
   }

   createUnixTime(): number {
    // Get the current date and time
    const now = new Date();

    // Convert to Unix timestamp
    const unixTime = Math.floor(now.getTime() / 1000);

    return unixTime;
  }
}
