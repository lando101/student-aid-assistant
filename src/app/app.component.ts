import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/components/header/header.component';
import {} from '@angular/common/http';
import { HomeComponent } from './pages/home/home.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { CredentialsService } from './core/auth/credentials.service';
import { AuthService } from './core/auth/auth.service';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, HomeComponent, FooterComponent],
  providers: [CredentialsService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.sass'
})
export class AppComponent implements OnInit {
  title = 'chatbot-app';
  // authenticated: boolean = false;

  constructor(private credentialService: CredentialsService) {

  }

  ngOnInit(){
    // this.credentialService.$credState.subscribe((state)=>{
    //   this.authenticated = state;

    //   // console.log('state app', state)
    //  })
  }
}
