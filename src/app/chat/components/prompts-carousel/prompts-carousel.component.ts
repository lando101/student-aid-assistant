import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { featherArrowLeft, featherArrowRight } from '@ng-icons/feather-icons';
// import { CarouselModule } from 'primeng/carousel';
import { CarouselComponent, CarouselModule } from 'ngx-owl-carousel-o';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { Subscription, debounceTime, fromEvent } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';


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
  imports: [CarouselModule, CommonModule, NgIconComponent, MatButtonModule, MatIconModule],
  templateUrl: './prompts-carousel.component.html',
  styleUrl: './prompts-carousel.component.sass'
})



export class PromptsCarouselComponent implements OnInit, AfterViewInit, OnDestroy{
@ViewChild('owlCar', { static: true }) owlCar!: CarouselComponent;
@ViewChild('container', { static: true }) container!: ElementRef;
@Output() hoverString = new EventEmitter<string>();
@Output() searchString = new EventEmitter<string>();


private resizeSubscription!: Subscription;
width!: string;

init: boolean = false;
prompts: Prompt[]= [
  {
    id: '1',
    title: 'Applying for aid',
    prompt: 'How do I apply for student aid?',
    description: ''
  },
  {
    id: '2',
    title: 'Aid amount',
    prompt: 'How much financial aid can I get?',
    description: ''
  },
  {
    id: '3',
    title: 'FAFSA',
    prompt: 'What is the FAFSA and why is it important?',
    description: ''
  },
  {
    id: '4',
    title: 'Repaying aid',
    prompt: 'Do I need to repay student aid?',
    description: ''
  },
  {
    id: '5',
    title: 'Aid amount',
    prompt: "How does my family's income affect my aid?",
    description: ''
  },
  {
    id: '6',
    title: 'Aid eligibility',
    prompt: "How do I maintain eligibility for student aid?",
    description: ''
  }
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
      console.log('Element width changed:', width);
    });
}

private unsubscribeFromResize() {
  if (this.resizeSubscription) {
    this.resizeSubscription.unsubscribe();
  }
}

promptHover(event: string){
  this.hoverString.emit(event);
  // console.log('hover', event)
}

usePrompt(event: string){
  this.searchString.emit(event)
}

ngOnDestroy() {
  this.unsubscribeFromResize();
}

print(event: any){
  console.log(event)
  // console.log(this.owlCar.slides)
  console.log(this.owlCar.slidesData)
  console.log(this.owlCar.navData)

  // console.log(this.owlCar.slidesOutputData)
}
}
