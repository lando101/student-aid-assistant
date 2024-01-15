import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoThreadComponent } from './no-thread.component';

describe('NoThreadComponent', () => {
  let component: NoThreadComponent;
  let fixture: ComponentFixture<NoThreadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoThreadComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NoThreadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
