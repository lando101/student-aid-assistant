import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute } from '@angular/router';
import { NgIconComponent } from '@ng-icons/core';
import { Router } from 'express';
import { Subscription, map } from 'rxjs';

@Component({
  selector: 'app-thread-window',
  standalone: true,
  imports: [
    CommonModule,
    NgIconComponent,
    MatIconModule,
  ],
  templateUrl: './thread-window.component.html',
  styleUrl: './thread-window.component.sass'
})

export class ThreadWindowComponent implements OnInit, AfterViewInit, OnDestroy {
  threadId: string | null  = null;
  $route!: Subscription

  constructor(private route: ActivatedRoute){
    this.$route = this.route.params.subscribe(params =>{
      console.log('params', params)
      this.threadId = params['threadId'];
    })
  }

  ngOnInit(): void {

  }

  ngAfterViewInit(): void {

  }

  ngOnDestroy(): void {
    this.$route.unsubscribe();
  }
}
