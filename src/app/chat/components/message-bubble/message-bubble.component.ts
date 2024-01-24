import { Component, ElementRef, Inject, Input, OnChanges, OnInit, SimpleChanges, ViewChild, inject } from '@angular/core';
import { Message } from '../../models/message.model';
import { CommonModule } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { MarkdownPipe } from "../../../shared/pipes/markdown.pipe";
import { UserService } from '../../../core/auth/user.service';
import { AssistantService } from '../../services/assistant.service';
import { LiveMessage, LiveThread } from '../../models/chat.model';
import { FormsModule } from '@angular/forms';
import { featherCheckCircle } from '@ng-icons/feather-icons';

@Component({
    selector: 'app-message-bubble',
    standalone: true,
    viewProviders: [
      provideIcons({
          featherCheckCircle
      }),
  ],
    templateUrl: './message-bubble.component.html',
    styleUrl: './message-bubble.component.sass',
    imports: [CommonModule, NgIconComponent, MarkdownPipe, FormsModule, NgIconComponent]
})
export class MessageBubbleComponent implements OnInit, OnChanges {
  @Input() message!: Message;
  @Input() liveMessage!: LiveMessage | null;
  @Input() thread: LiveThread | null = null;
  @ViewChild('textArea') textArea: ElementRef | null = null

  isPanelOpen: boolean = false;
  feedbackText: string = '';
  showThankYouMessage: boolean = false;
  aniamte: boolean = false;
  aniamteThanks: boolean = false;


  chatService = inject(AssistantService)

  constructor(private userService: UserService) {

  }

  ngOnInit(): void {

  }

  ngOnChanges(changes: SimpleChanges): void {

  }

  likeMessage(liked: 1 | 2) {
    try {
      const likedRef = this.liveMessage!.liked === liked ? 0:liked;
      this.liveMessage!.liked = likedRef;
      if(likedRef !== 0){
        setTimeout(() => {
          this.openPanel()
         }, 80);
      } else {
        this.closePanel()
      }

      this.userService.updateLiveMessage(this.liveMessage!.thread_id!, this.liveMessage!.id!, 'liked', likedRef)
    } catch (error) {
      throw error
    }
  }

  togglePanel() {
    if(this.isPanelOpen){
      this.isPanelOpen = false;
      this.showThankYouMessage = false;
    } else if(!this.isPanelOpen) {
      this.isPanelOpen = true;
    }
  }

  openPanel(){
    this.isPanelOpen = true;
  }

  closePanel(){
    this.aniamte = true;
    setTimeout(() => {
      this.isPanelOpen = false;
      this.aniamte = false;
      this.feedbackText = ''; // Clear the textarea
    }, 600);
  }

  submitFeedback() {
    console.log('Feedback:', this.feedbackText); // Handle the feedback submission logic here
    this.feedbackText = ''; // Clear the textarea
    this.closePanel();
    setTimeout(() => {
    this.showThankYouMessage = true;
    }, 1000);
    // setTimeout(() => this.showThankYouMessage = false, 3000); // Hide the thank you message after 3 seconds
    setTimeout(() => {
      this.aniamteThanks = true;
    }, 5000);
    setTimeout(() => {
      this.aniamteThanks = false
      this.showThankYouMessage = false
    }, 6000);
  }
}
