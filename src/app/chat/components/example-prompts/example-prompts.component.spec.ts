import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExamplePromptsComponent } from './example-prompts.component';

describe('ExamplePromptsComponent', () => {
  let component: ExamplePromptsComponent;
  let fixture: ComponentFixture<ExamplePromptsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExamplePromptsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ExamplePromptsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
