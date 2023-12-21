import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
// import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
// import { getAuth, provideAuth } from '@angular/fire/auth';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { AngularFireDatabaseModule } from '@angular/fire/compat/database';
import { AuthService } from './core/auth/auth.service';
import { AngularFireModule } from '@angular/fire/compat';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/components/header/header.component';
import { HomeComponent } from './pages/home/home.component';
import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';
import { environment } from '../environments/environment'


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    // RouterOutlet,
    RouterModule.forRoot([]),
    // HomeComponent,
    HeaderComponent,
    AngularFireAuthModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFirestoreModule,
    AngularFireStorageModule,
    AngularFireDatabaseModule,
    AppComponent
  ],
  providers: [AuthService],
  bootstrap: [],
})
export class AppModule {
  // const auth = getAuth(app);
 }
