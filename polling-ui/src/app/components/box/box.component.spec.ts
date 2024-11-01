import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { BoxComponent } from './box.component';

describe('BoxTests', () => {
  let component: BoxComponent;
  let fixture: ComponentFixture<BoxComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [],
      declarations: [BoxComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });

  it('not selected with only line 1', () => {
    component.selected = false;
    component.line1 = 'Test 1';
    component.line2 = null;
    component.line3 = null;
    fixture.detectChanges();

    const nativeElement = fixture.nativeElement;

    expect(nativeElement.querySelector('.selected')).toBeNull();

    const line1 = nativeElement.querySelector('.line1');
    expect(line1).toBeTruthy();
    expect(line1.innerText).toBe('Test 1');
    expect(nativeElement.querySelector('.line2')).toBeNull();
    expect(nativeElement.querySelector('.line3')).toBeNull();
  });

  it('not selected with line 1 and 2', () => {
    component.selected = false;
    component.line1 = 'Test 1';
    component.line2 = 'Test 2';
    component.line3 = null;
    fixture.detectChanges();

    const nativeElement = fixture.nativeElement;

    expect(nativeElement.querySelector('.selected')).toBeNull();

    const line1 = nativeElement.querySelector('.line1');
    expect(line1).toBeTruthy();
    expect(line1.innerText).toBe('Test 1');

    const line2 = nativeElement.querySelector('.line2');
    expect(line2).toBeTruthy();
    expect(line2.innerText).toBe('Test 2');

    expect(nativeElement.querySelector('.line3')).toBeNull();
  });

  it('not selected with line 1, 2 and 3', () => {
    component.selected = false;
    component.line1 = 'Test 1';
    component.line2 = 'Test 2';
    component.line3 = 'Test 3';
    fixture.detectChanges();

    const nativeElement = fixture.nativeElement;

    expect(nativeElement.querySelector('.selected')).toBeNull();
    const line1 = nativeElement.querySelector('.line1');
    expect(line1).toBeTruthy();
    expect(line1.innerText).toBe('Test 1');

    const line2 = nativeElement.querySelector('.line2');
    expect(line2).toBeTruthy();
    expect(line2.innerText).toBe('Test 2');

    const line3 = nativeElement.querySelector('.line3');
    expect(line3).toBeTruthy();
    expect(line3.innerText).toBe('Test 3');
  });

  it('selected has class applied', () => {
    component.selected = true;
    component.line1 = 'Test 1';
    component.line2 = null;
    component.line3 = null;
    fixture.detectChanges();

    const nativeElement = fixture.nativeElement;

    expect(nativeElement.querySelector('.selected')).toBeTruthy();
    expect(nativeElement.querySelector('.line1')).toBeTruthy();
  });
});
