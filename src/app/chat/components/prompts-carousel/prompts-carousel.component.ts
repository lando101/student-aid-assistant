import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild, inject } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { featherArrowLeft, featherArrowRight } from '@ng-icons/feather-icons';
// import { CarouselModule } from 'primeng/carousel';
import { CarouselComponent, CarouselModule } from 'ngx-owl-carousel-o';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { Subscription, debounceTime, fromEvent } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { LiveChatService } from '../../services/live-chat.service';
import { FilterByPipe, NgPipesModule } from 'ngx-pipes';


export interface Product {
  id?: string;
  code?: string;
  name?: string;
  description?: string;
  price?: number;
  quantity?: number;
  inventoryStatus?: string;
  category?: string;
  image?: string;
  rating?: number;
}

export interface Prompt {
  id?: string;
  title?: string;
  prompt?: string;
  description?: string;
  assistant?: string;
  width?: number;
}
@Component({
  selector: 'app-prompts-carousel',
  standalone: true,
  viewProviders: [
    provideIcons({
        featherArrowRight,
        featherArrowLeft
    }),
],
  providers: [FilterByPipe],
  imports: [CarouselModule, CommonModule, NgIconComponent, MatButtonModule, MatIconModule, NgPipesModule],
  templateUrl: './prompts-carousel.component.html',
  styleUrl: './prompts-carousel.component.sass'
})



export class PromptsCarouselComponent implements OnInit, AfterViewInit, OnDestroy{
@ViewChild('owlCar', { static: true }) owlCar!: CarouselComponent;
@ViewChild('container', { static: true }) container!: ElementRef;
@Output() hoverString = new EventEmitter<string>();
@Output() searchString = new EventEmitter<string>();


liveChatService = inject(LiveChatService);
category = this.liveChatService.category;

dragging: boolean = false;
private resizeSubscription!: Subscription;
width!: string;

init: boolean = false;
prompts: Prompt[]= [
  {
    id: '1',
    title: 'General Student Aid',
    prompt: 'How do I apply for student aid?',
    description: '',
    assistant: 'gen_stdnt_aid',
    width: 273
  },
  {
    id: '2',
    title: 'General Student Aid',
    prompt: 'How much financial aid can I get?',
    description: '',
    assistant: 'gen_stdnt_aid',
    width: 281
  },
  {
    id: '3',
    title: 'FAFSA',
    prompt: 'What is the FAFSA and why is it important?',
    description: '',
    assistant: 'fafsa'
  },
  {
    id: '4',
    title: 'Loans & Forgiveness',
    prompt: 'Do I need to repay student aid?',
    description: '',
    assistant: 'loan_forg'
  },
  {
    id: '5',
    title: 'General Student Aid',
    prompt: "How does my family's income affect my aid?",
    description: '',
    assistant: 'gen_stdnt_aid'
  },
  {
    id: '6',
    title: 'General Student Aid',
    prompt: "How do I maintain eligibility for student aid?",
    description: '',
    assistant: 'gen_stdnt_aid'
  },
  {
    id: '7',
    title: 'College Explorer',
    prompt: "What schools can I get into?",
    description: '',
    assistant: 'college_explorer'
  },
  {
    id: '8',
    title: 'Loans & Forgiveness',
    prompt: "Am I eligible for forgiveness?",
    description: '',
    assistant: 'loan_forg'
  },
  {
    id: '9',
    title: 'General Student Aid',
    prompt: "When do I have to pay my loans back?",
    description: '',
    assistant: 'gen_stdnt_aid'
  },
  {
    id: '10',
    title: 'FAFSA',
    prompt: "When should I complete the FAFSA?",
    description: '',
    assistant: 'fafsa'
  },
  {
    id: '11',
    title: 'College Explorer',
    prompt: "What is dorm life like?",
    description: '',
    assistant: 'college_explorer'
  },
  {
    id: '12',
    title: 'College Explorer',
    prompt: "How should I prepare for the SAT?",
    description: '',
    assistant: 'college_explorer'
  },
]

customOptions: OwlOptions = {
  loop: false,
  mouseDrag: true,
  touchDrag: true,
  pullDrag: true,
  dots: false,
  animateOut: 'animate__animated animate__backInDown',
  animateIn: 'animate__animated animate__backInDown',
  autoWidth: true,
  nav: true,
  margin: 10,
  navSpeed: 500,
  navText: ['<', '>'],
}

  responsiveOptions: any[] | undefined;

  ngAfterViewInit() {
    setTimeout(() => {
    this.width = `${this.container.nativeElement.offsetWidth}px`;

    }, 500);
    setTimeout(() => {
      this.init = true;
    }, 500);
    this.setupResizeListener();
  }

  ngOnInit() {

    // this.productService.getProductsSmall().then((products) => {
    //     this.products = products;
    // });

    this.responsiveOptions = [
        {
            breakpoint: '1199px',
            numVisible: 2,
            numScroll: 2
        },
        {
            breakpoint: '991px',
            numVisible: 2,
            numScroll: 1
        },
        {
            breakpoint: '767px',
            numVisible: 2,
            numScroll: 1
        }
    ];
}

private setupResizeListener() {
  const element = this.container.nativeElement;

  this.resizeSubscription = fromEvent(window, 'resize')
    .pipe(debounceTime(300)) // Adjust debounceTime as needed to reduce unnecessary updates
    .subscribe(() => {
      const width = element.offsetWidth;
      this.width = `${width}px`
      // Handle the width change here or emit it to an observable/subject
    });
}

private unsubscribeFromResize() {
  if (this.resizeSubscription) {
    this.resizeSubscription.unsubscribe();
  }
}

promptHover(event: string){
  this.hoverString.emit(event);
  // // console.log('hover', event)
}

usePrompt(event: string){
  this.searchString.emit(event)
}

ngOnDestroy() {
  this.unsubscribeFromResize();
}
}
