import { Injectable, inject } from '@angular/core';
import { User } from 'firebase/auth';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Firestore, doc, setDoc, onSnapshot, updateDoc, arrayUnion, arrayRemove, collection } from '@angular/fire/firestore';
import { Threads, UserProfile } from '../../chat/models/user_profile.model';
import { StringFormat } from 'firebase/storage';
import { addDoc, getDoc } from 'firebase/firestore';

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
  public userProfile: UserProfile | null | any = null;

  constructor() {
    this.$user.subscribe((user)=>{
      if(!!user && user != this.user){
        console.log('user service', user);
        this.user = user;
        // this.getUserProfile().then((data: any)=>{
        //   // console.log('user data', data)
        // });

        this.subUserProfile();
        this.subUserThreads();
      }
    })
   }


   subUserProfile() {
    const unsub = onSnapshot(doc(this.firestore, 'users', this.user.uid), (doc)=>{
      const source = doc.metadata.hasPendingWrites ? "Local" : "Server";
      console.log(source, " data: ", doc.data());
      if(doc.data()){
        this._userProfile.next(doc.data())
        this.userProfile = doc.data();
      } else {
        this._userProfile.next(this.createUserProfile())
      }
    });
   }

   subUserThreads() {
    const unsub = onSnapshot(collection(this.firestore, 'users', this.user.uid, 'threads'), (docs)=>{
      docs.forEach((doc)=>{
        // const source = doc.metadata.hasPendingWrites ? "Local" : "Server";
        console.log("threads data: ", doc.data());
      })

      // if(doc.docs){

      // } else {
      // }
    });
   }

   async createUserProfile(uid?: string, email?: string): Promise<any> {
    let threads: [{thread_id?: string, thread_name?: string, creation_date?: string | Date | null | undefined}] | null = null

    const userRef = await setDoc(doc(this.firestore, 'users', uid ? uid:this.user.uid), {
      email: email ? email:this.user.email,
      first_name: '',
      last_name: '',
      image: '',
      last_login: '',
      threads: [],
      uid: uid ? uid:this.user.uid
    });

    return {
      email: email ? email:this.user.email,
      first_name: '',
      last_name: '',
      image: '',
      last_login: '',
      threads: threads,
      uid: uid ? uid:this.user.uid
    };
   }

   // add threads to user profile
   async addThread(thread_id: string | null, thread_name: string | null) {
    const docRef = doc(this.firestore, 'users', this.user.uid, 'threads', thread_id!);

    // await updateDoc(docRef, {
    //   threads: arrayUnion({thread_id: thread_id, thread_name: thread_name, creation_date: new Date().toTimeString()})
    // })
    await setDoc(docRef,{
      thread_id: thread_id, thread_name: thread_name, creation_date: new Date().toTimeString()
    })
   }

    // add threads to user profile
    async updateThread(thread_id: string | null, thread_name: string | null) {
      const docRef = doc(this.firestore, 'users', this.user.uid);
      // await updateDoc(docRef, {
      //   threads: arrayUnion({thread_id: thread_id, thread_name: thread_name, creation_date: new Date().toTimeString()})
      // })

     const collectionRef = doc(this.firestore, `users/${this.user.uid}/threads`, 'thread_aeI2bIoXCvILNwLyo9OpFmHp');
     console.log((await getDoc(collectionRef)).data())
     }

   async removeThread(thread_id: string | null) {
    const docRef = doc(this.firestore, 'users', this.user.uid);

    const thread = this.userProfile.threads.find((refThread_id: Threads) => refThread_id.thread_id === thread_id);

    console.log('threads', this.userProfile.threads);
    console.log('thread id to delete', thread_id)

    await updateDoc(docRef, {
      threads: arrayRemove({thread_id: thread_id, thread_name: thread.thread_name, creation_date: thread.creation_date})
    })
   }

   async updateUser(user_id: string, key: string, value: string): Promise<any> {
    if(user_id){
      const docRef = doc(this.firestore, 'users', user_id);
      return await updateDoc(docRef, {
        [key]: value
      })
    } else {
      return 'error'
    }



   }

}
