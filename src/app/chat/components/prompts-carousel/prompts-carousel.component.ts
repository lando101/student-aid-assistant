import { Component, OnInit } from '@angular/core';
// import { CarouselModule } from 'primeng/carousel';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { OwlOptions } from 'ngx-owl-carousel-o';

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
  imports: [CarouselModule],
  templateUrl: './prompts-carousel.component.html',
  styleUrl: './prompts-carousel.component.sass'
})



export class PromptsCarouselComponent implements OnInit{
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
  loop: true,
  mouseDrag: false,
  touchDrag: false,
  pullDrag: false,
  dots: false,
  navSpeed: 700,
  navText: ['', ''],
  responsive: {
    0: {
      items: 1
    },
    400: {
      items: 2
    },
    740: {
      items: 3
    },
    940: {
      items: 4
    }
  },
  nav: true
}

  responsiveOptions: any[] | undefined;

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

}
