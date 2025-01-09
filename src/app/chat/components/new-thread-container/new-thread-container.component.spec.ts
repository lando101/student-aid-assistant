import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewThreadContainerComponent } from './new-thread-container.component';

describe('NoThreadComponent', () => {
  let component: NewThreadContainerComponent;
  let fixture: ComponentFixture<NewThreadContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewThreadContainerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewThreadContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
