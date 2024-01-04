import { Component } from '@angular/core';
import { LoginFormComponent } from '../../chat/components/login-form/login-form.component';
import { CarouselModule } from 'primeng/carousel';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [LoginFormComponent, CarouselModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.sass'
})

export class AuthComponent {
  slides = [
    {header: "Your AI Guide to Student Aid.", content: 'Let AI help you plan your higher education journey.', img: 'https://firebasestorage.googleapis.com/v0/b/federal-student-aid-assistant.appspot.com/o/site_images%2Fhuman_with_robot.svg?alt=media&token=51b401b2-9d15-441a-8265-0dafc69c1ba0'},
    {header: "Simplify Your Aid Journey.", content: 'Your student aid expert is right here to help streamline your education journey.', img: 'https://firebasestorage.googleapis.com/v0/b/federal-student-aid-assistant.appspot.com/o/site_images%2Fhuman_journey_camp.svg?alt=media&token=a33bba9e-44e0-4f01-997b-06a36df70a9a'},
    {header: "Unlock the Mystery of Student Aid.", content: "It shouldn't take an AI to understand student aid. But sometimes it does.", img: 'https://firebasestorage.googleapis.com/v0/b/federal-student-aid-assistant.appspot.com/o/site_images%2Fhuman_confused.svg?alt=media&token=6120350e-4804-4e9f-84bd-39fd226c4b14'},
  ]
}
