import { Injectable, inject } from '@angular/core';
import { User } from 'firebase/auth';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Firestore, doc, setDoc, onSnapshot, updateDoc, arrayUnion, arrayRemove, collection } from '@angular/fire/firestore';
import { Threads, UserProfile } from '../../chat/models/user_profile.model';
import { StringFormat } from 'firebase/storage';
import { Timestamp, addDoc, deleteDoc, getDoc, getDocs } from 'firebase/firestore';
import { StorageService } from '../../chat/services/storage.service';
import { AuthenticationService } from '../authentication/authentication.service';
import { Message } from '../../chat/models/message.model';

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

  public userProfile!: UserProfile | null | any;

  userProfileKey: string = "userProfile";


  constructor(private storageService: StorageService, private authService: AuthenticationService) {
    console.log('user service')
    this.authService.$currentUser.subscribe((user) => {
      console.log('Received user in UserService:', user);
      if (user) {
        this.user = user;
        try {
          const userProfile = this.storageService.getItem(this.userProfileKey);
          console.log('Retrieved userProfile from storage:', userProfile);
          if (userProfile) {
            this.userProfile = JSON.parse(userProfile);
            this._userProfile.next(this.userProfile);
          } else {
            this.userProfile = null;
            this._userProfile.next(null);
          }
          this.subUserProfile();
          this.subUserThreads();
        } catch (error) {
          console.error('Error parsing userProfile:', error);
          this.userProfile = null;
          this._userProfile.next(null);
        }
      } else {
        console.log('User object is falsy in UserService.');
      }
    });
  }


   subUserProfile() {
    const unsub = onSnapshot(doc(this.firestore, 'users', this.user.uid), (doc)=>{
      const source = doc.metadata.hasPendingWrites ? "Local" : "Server";
      console.log(source, " data: ", doc.data());
      if(doc.data()){
        this._userProfile.next(doc.data())
        this.userProfile = doc.data();
      } else {
        // this._userProfile.next(this.createUserProfile())
      }
    });
   }

   subUserThreads() {
    const unsub = onSnapshot(collection(this.firestore, 'users', this.user.uid, 'threads'), (docs)=>{
      this.userProfile.threads = []; // might need to fix for animations
      docs.forEach((doc)=>{
        // console.log("threads data: ", doc.data());
        this.userProfile.threads.push(doc.data())
      });
      this.storageService.setItem(this.userProfileKey, JSON.stringify(this.userProfile));
      this._userProfile.next(this.userProfile);
      // console.log('user profile with trheads', this.userProfile)
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
        uid: uid || this.user.uid
      });

      // Fetch the newly created/updated document
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        console.log('Document data:', docSnap.data());
        this.userProfile = docSnap.data();
        this.storageService.setItem(this.userProfileKey, JSON.stringify(docSnap.data()));
        return docSnap.data();
      } else {
        console.log('No such document!');
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
    // console.log('trying to get messages from firebase')
    const querySnapshot = await getDocs(collection(this.firestore, 'users', this.user.uid, 'threads', thread_id, 'messages'));
    let messages:any[] = []
    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      messages.push(doc.data() as any)
      console.log(doc.id, " => ", doc.data());
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

    await deleteDoc(docRef)
   }

  //  async getMessages()

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
