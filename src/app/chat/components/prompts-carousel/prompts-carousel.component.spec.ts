import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PromptsCarouselComponent } from './prompts-carousel.component';

describe('PromptsCarouselComponent', () => {
  let component: PromptsCarouselComponent;
  let fixture: ComponentFixture<PromptsCarouselComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PromptsCarouselComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PromptsCarouselComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
