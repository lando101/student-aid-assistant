import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { featherArrowLeft, featherArrowRight } from '@ng-icons/feather-icons';
// import { CarouselModule } from 'primeng/carousel';
import { CarouselComponent, CarouselModule } from 'ngx-owl-carousel-o';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { Subscription, debounceTime, fromEvent } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-questions-carousel',
  standalone: true,
  viewProviders: [
    provideIcons({
        featherArrowRight,
        featherArrowLeft
    }),
],
  imports: [CarouselModule, CommonModule, NgIconComponent, MatButtonModule, MatIconModule],
  templateUrl: './questions-carousel.component.html',
  styleUrl: './questions-carousel.component.sass'
})
export class QuestionsCarouselComponent implements OnInit, AfterViewInit {
  @ViewChild('owlCar', { static: true }) owlCar!: CarouselComponent;
  @ViewChild('container', { static: true }) container!: ElementRef;
  @Input() questions: string[] | null = null;
  @Output() hoverString = new EventEmitter<string>();
  @Output() searchString = new EventEmitter<string>();

  questionss = [
    "What are the different types of Income-Driven Repayment plans available?",
    "How is income and family size used to determine monthly payments?",
    "Are there any eligibility requirements to qualify for an Income-Driven Repayment plan?"]
  dragging: boolean = false;
  private resizeSubscription!: Subscription;
  width!: string;

  // questions: string[] | null = null;

  init: boolean = false;

  customOptions: OwlOptions = {
    loop: false,
    mouseDrag: false,
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
