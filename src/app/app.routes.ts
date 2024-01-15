import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { AuthGuard } from './core/auth.guard';
import { AboutComponent } from './pages/about/about.component';
import { AuthComponent } from './pages/auth/auth.component';
import { SignupComponent } from './pages/signup/signup.component';
import { AssistantComponent } from './pages/assistant/assistant.component';
import { ThreadWindowComponent } from './chat/components/thread-window/thread-window.component';
import { NoThreadComponent } from './chat/components/no-thread/no-thread.component';


export const routes: Routes = [
  { path: '', redirectTo: '/auth', pathMatch: 'full' },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'assistant', component: AssistantComponent, canActivate: [AuthGuard], children: [
    {path: ':threadId', component: ThreadWindowComponent },
    {path: '', component: NoThreadComponent }
  ] },
  { path: 'about', component: AboutComponent, canActivate: [AuthGuard] },
  { path: 'auth', component: AuthComponent },
  { path: 'sign-up', component: SignupComponent }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }
