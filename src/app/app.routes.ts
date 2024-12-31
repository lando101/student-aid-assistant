import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { AuthGuard } from './core/auth.guard';
import { AboutComponent } from './pages/about/about.component';
import { AuthComponent } from './pages/auth/auth.component';
import { SignupComponent } from './pages/signup/signup.component';
import { AssistantPageComponent } from './pages/assistant-page/assistant-page.component';
import { ThreadContainerComponent } from './chat/components/thread-container/thread-container.component';
import { NoThreadComponent } from './chat/components/no-thread/no-thread.component';
import { SettingsComponent } from './pages/settings/settings.component';


export const routes: Routes = [
  { path: '', redirectTo: '/auth', pathMatch: 'full' },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'assistant', component: AssistantPageComponent, canActivate: [AuthGuard], children: [
    {path: ':threadId', component: ThreadContainerComponent, canActivate: [AuthGuard] },
    {path: '', component: NoThreadComponent, canActivate: [AuthGuard] }
  ] },
  { path: 'about', component: AboutComponent, canActivate: [AuthGuard] },
  { path: 'settings', component: SettingsComponent, canActivate: [AuthGuard] },
  { path: 'auth', component: AuthComponent },
  { path: 'sign-up', component: SignupComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }
