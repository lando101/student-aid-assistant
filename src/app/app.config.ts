import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideFirebaseApp } from '@angular/fire/app';
import { environment } from '../environments/environment';
import { initializeApp } from 'firebase/app';
import { getAuth, provideAuth } from '@angular/fire/auth';


import {
  ScreenTrackingService,
  UserTrackingService,
  getAnalytics,
  provideAnalytics,
} from '@angular/fire/analytics';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getFunctions, provideFunctions } from '@angular/fire/functions';
import { getMessaging, provideMessaging } from '@angular/fire/messaging';
import { getPerformance, providePerformance } from '@angular/fire/performance';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { provideAnimations } from '@angular/platform-browser/animations';

// import { Capacitor } from '@capacitor/core'

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), provideClientHydration(), provideHttpClient(withFetch()), provideAnimations(),
    [
        provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
        provideAnalytics(() => getAnalytics()),
        provideAuth(() => getAuth()),
        provideFirestore(() => getFirestore()),
        provideFunctions(() => getFunctions()),
        provideMessaging(() => getMessaging()),
        providePerformance(() => getPerformance()),
        provideStorage(() => getStorage()),
    ], provideAnimations(),
    // {
    //   provide: AutoAnimateModule
    // },
  ],
};


// import { ApplicationConfig, importProvidersFrom } from '@angular/core';
// import { provideHttpClient, withFetch } from '@angular/common/http';
// import { provideRouter } from '@angular/router';
// import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
// import { provideAnalytics, getAnalytics } from '@angular/fire/analytics';
// import { provideAuth, getAuth } from '@angular/fire/auth';
// import { provideFirestore, getFirestore } from '@angular/fire/firestore';
// import { provideFunctions, getFunctions } from '@angular/fire/functions';
// import { provideMessaging, getMessaging } from '@angular/fire/messaging';
// import { providePerformance, getPerformance } from '@angular/fire/performance';
// import { provideStorage, getStorage } from '@angular/fire/storage';
// import { environment } from '../environments/environment';

// export const appConfig: ApplicationConfig = {
//   providers: [
//     // importProvidersFrom(
//       provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
//       provideAnalytics(() => getAnalytics()),
//       provideAuth(() => getAuth()),
//       provideFirestore(() => getFirestore()),
//       provideFunctions(() => getFunctions()),
//       provideMessaging(() => getMessaging()),
//       providePerformance(() => getPerformance()),
//       provideStorage(() => getStorage()),
//     // ),
//     provideHttpClient(withFetch()),
//     provideRouter([]),
//   ]
// };
