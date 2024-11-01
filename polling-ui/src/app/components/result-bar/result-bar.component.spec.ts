import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ResultBarComponent } from './result-bar.component';

describe('ResultBarTests', () => {
  let component: ResultBarComponent;
  let fixture: ComponentFixture<ResultBarComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [],
      declarations: [ResultBarComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResultBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });

  it('bar for active poll and no vote placed displays correctly', () => {
    component.option = 'Test Option';
    component.votePlaced = null;
    component.votePercentage = 10;
    component.pollActive = true;
    fixture.detectChanges();

    const nativeElement = fixture.nativeElement;

    expect(nativeElement.querySelector('.result-bar')).toBeTruthy();
    expect(nativeElement.querySelector('.poll-open')).toBeTruthy();
    expect(nativeElement.querySelector('.text-lower')).toBeTruthy();
    expect(nativeElement.querySelector('.selected')).toBeNull();

    expect(nativeElement.querySelector('.progress-bar')).toBeNull();

    const optionContainer = nativeElement.querySelector('.optionContainer');
    expect(optionContainer).toBeTruthy();
    expect(optionContainer.innerText).toBe('Test Option');

    const percentageContainer = nativeElement.querySelector(
      '.percentageContainer',
    );
    expect(percentageContainer).toBeNull();
  });

  it('bar for inactive poll and no vote placed displays correctly', () => {
    component.option = 'Test Option';
    component.votePlaced = null;
    component.votePercentage = 10;
    component.pollActive = false;
    fixture.detectChanges();

    const nativeElement = fixture.nativeElement;

    expect(nativeElement.querySelector('.result-bar')).toBeTruthy();
    expect(nativeElement.querySelector('.poll-open')).toBeNull();
    expect(nativeElement.querySelector('.text-lower')).toBeNull();
    expect(nativeElement.querySelector('.selected')).toBeNull();

    const progressBar = nativeElement.querySelector('.progress-bar');
    expect(progressBar).toBeTruthy();
    expect(progressBar.style.width).toBe('10%');
    expect(progressBar.style['max-width']).toBe('10%');
    expect(progressBar.style['min-width']).toBe('10%');

    const optionContainer = nativeElement.querySelector('.optionContainer');
    expect(optionContainer).toBeTruthy();
    expect(optionContainer.innerText).toBe('Test Option');

    const percentageContainer = nativeElement.querySelector(
      '.percentageContainer',
    );
    expect(percentageContainer.innerText).toBe('10%');
    expect(percentageContainer).toBeTruthy();
  });

  it('bar for active poll and vote placed displays correctly', () => {
    component.option = 'Test Option';
    component.votePlaced = 'Test Option';
    component.votePercentage = 10;
    component.pollActive = true;
    fixture.detectChanges();

    const nativeElement = fixture.nativeElement;

    expect(nativeElement.querySelector('.result-bar')).toBeTruthy();
    expect(nativeElement.querySelector('.poll-open')).toBeTruthy();
    expect(nativeElement.querySelector('.text-lower')).toBeNull();
    expect(nativeElement.querySelector('.selected')).toBeTruthy();

    const progressBar = nativeElement.querySelector('.progress-bar');
    expect(progressBar).toBeTruthy();
    expect(progressBar.style.width).toBe('10%');
    expect(progressBar.style['max-width']).toBe('10%');
    expect(progressBar.style['min-width']).toBe('10%');

    const optionContainer = nativeElement.querySelector('.optionContainer');
    expect(optionContainer).toBeTruthy();
    expect(optionContainer.innerText).toBe('Test Option');

    const percentageContainer = nativeElement.querySelector(
      '.percentageContainer',
    );
    expect(percentageContainer.innerText).toBe('10%');
    expect(percentageContainer).toBeTruthy();
  });

  it('bar for inactive poll and vote placed displays correctly', () => {
    component.option = 'Test Option';
    component.votePlaced = 'Test Option';
    component.votePercentage = 10;
    component.pollActive = false;
    fixture.detectChanges();

    const nativeElement = fixture.nativeElement;

    expect(nativeElement.querySelector('.result-bar')).toBeTruthy();
    expect(nativeElement.querySelector('.poll-open')).toBeNull();
    expect(nativeElement.querySelector('.text-lower')).toBeNull();
    expect(nativeElement.querySelector('.selected')).toBeTruthy();

    const progressBar = nativeElement.querySelector('.progress-bar');
    expect(progressBar).toBeTruthy();
    expect(progressBar.style.width).toBe('10%');
    expect(progressBar.style['max-width']).toBe('10%');
    expect(progressBar.style['min-width']).toBe('10%');

    const optionContainer = nativeElement.querySelector('.optionContainer');
    expect(optionContainer).toBeTruthy();
    expect(optionContainer.innerText).toBe('Test Option');

    const percentageContainer = nativeElement.querySelector(
      '.percentageContainer',
    );
    expect(percentageContainer.innerText).toBe('10%');
    expect(percentageContainer).toBeTruthy();
  });

  it('clicked event when clicked', () => {
    component.option = 'Test Option';
    component.votePlaced = null;
    component.votePercentage = 10;
    component.pollActive = true;
    spyOn(component.voteClicked, 'emit');
    fixture.detectChanges();

    const nativeElement = fixture.nativeElement;
    const bar = nativeElement.querySelector('.result-bar');
    bar.dispatchEvent(new Event('click'));

    fixture.detectChanges();

    expect(component.voteClicked.emit).toHaveBeenCalledWith('Test Option');
  });
});
