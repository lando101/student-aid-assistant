import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Assistant } from '../../models/assistant.model';
import { NgOptimizedImage } from '@angular/common'

@Component({
  selector: 'app-assistant-card',
  standalone: true,
  imports: [CommonModule, FormsModule, NgOptimizedImage],
  templateUrl: './assistant-card.component.html',
  styleUrl: './assistant-card.component.sass'
})
export class AssistantCardComponent implements OnInit, OnChanges {
@Output() hoverString = new EventEmitter<string>();
@Output() assistantRef = new EventEmitter<Assistant>();

@Input() assistant: Assistant | null = null;
@Input() activeAssistant: string | null  = null

  ngOnInit(): void {

  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log(changes)
  }

  select(){
    if(this.assistant) {
      this.assistantRef.emit(this.assistant);
      console.log(this.assistant)
    }
  }
}
