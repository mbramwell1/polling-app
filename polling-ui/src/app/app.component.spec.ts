import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { PollService } from './service/poll.service';
import { of } from 'rxjs';
import { HttpHeaders, HttpResponse } from '@angular/common/http';
import { Poll } from './model/poll';
import { MatSidenavModule } from '@angular/material/sidenav';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { By } from '@angular/platform-browser';
import { BoxComponent } from './components/box/box.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatPaginatorHarness } from '@angular/material/paginator/testing';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';

let closedPollVote = JSON.parse(`{
    "id": "1234",
    "name": "Who's going to win the Premier League?",
    "active": false,
    "options": {
        "Fulham": 1,
        "Chelsea": 0,
        "Bolton Wanderers": 0,
        "Preston North End": 0
    },
    "votePlaced": "Fulham",
    "dateCreated": "2024-10-31T15:14:43"
}`);

let openPollNoVote = JSON.parse(`{
    "id": "9876",
    "name": "Who's the best F1 Driver?",
    "active": true,
    "options": {
        "Lewis Hamilton": 1,
        "Fernando Alonso": 1,
        "Lance Stroll": 2,
        "Max Verstappen": 2
    },
    "votePlaced": null,
    "dateCreated": "2024-10-31T15:14:43"
}`);

const headers: HttpHeaders = new HttpHeaders({ pages: 2, total: 16 });

let loader: HarnessLoader;

describe('App Component Tests', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  let mockPollService: jasmine.SpyObj<PollService>;

  beforeEach(waitForAsync(() => {
    mockPollService = jasmine.createSpyObj(PollService, ['getPollsByPage']);

    const httpResponse1: HttpResponse<Poll[]> = new HttpResponse<Poll[]>({
      status: 200,
      body: [
        openPollNoVote,
        closedPollVote,
        closedPollVote,
        closedPollVote,
        closedPollVote,
        closedPollVote,
        closedPollVote,
        closedPollVote,
      ],
      headers: headers,
    });
    const httpResponse2: HttpResponse<Poll[]> = new HttpResponse<Poll[]>({
      status: 200,
      body: [
        closedPollVote,
        closedPollVote,
        closedPollVote,
        closedPollVote,
        closedPollVote,
        closedPollVote,
        closedPollVote,
        closedPollVote,
      ],
      headers: headers,
    });
    mockPollService.getPollsByPage
      .withArgs(0, 8)
      .and.returnValue(of(httpResponse1));
    mockPollService.getPollsByPage
      .withArgs(1, 8)
      .and.returnValue(of(httpResponse2));

    TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        MatSidenavModule,
        MatPaginatorModule,
        RouterModule,
      ],
      declarations: [AppComponent, BoxComponent],
      providers: [
        {
          provide: PollService,
          useValue: mockPollService,
        },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });

  it('open polls list opens', () => {
    const nativeElement = fixture.nativeElement;
    const component = fixture.componentInstance;
    const { debugElement } = fixture;

    expect(nativeElement.querySelector('.sidenav')).toBeTruthy();
    expect(component.sideNavOpen).toBe(false);

    const openButton = nativeElement.querySelector('.open-button');
    openButton.dispatchEvent(new Event('click'));

    fixture.detectChanges();

    expect(component.sideNavOpen).toBe(true);

    expect(nativeElement.querySelector('.box')).toBeTruthy();

    const polls = debugElement.queryAll(By.css('.box'));
    expect(polls.length).toBe(8);
    expect(polls[0].children[0].children[0].nativeElement.innerText).toBe(
      "Who's the best F1 Driver?",
    );
    expect(polls[0].children[0].children[1].nativeElement.innerText).toBe(
      '6 Votes',
    );
    expect(polls[0].children[0].children[0].children[2]).toBeUndefined();
  });

  it('paging should load new polls', async () => {
    loader = TestbedHarnessEnvironment.loader(fixture);
    const nativeElement = fixture.nativeElement;
    const component = fixture.componentInstance;
    const { debugElement } = fixture;

    expect(nativeElement.querySelector('.sidenav')).toBeTruthy();
    expect(component.sideNavOpen).toBe(false);

    const openButton = nativeElement.querySelector('.open-button');
    openButton.dispatchEvent(new Event('click'));

    fixture.detectChanges();

    expect(mockPollService.getPollsByPage).toHaveBeenCalledTimes(1);

    expect(component.sideNavOpen).toBe(true);

    expect(nativeElement.querySelector('.box')).toBeTruthy();

    let polls = debugElement.queryAll(By.css('.box'));
    expect(polls.length).toBe(8);
    expect(polls[0].children[0].children[0].nativeElement.innerText).toBe(
      "Who's the best F1 Driver?",
    );
    expect(polls[0].children[0].children[1].nativeElement.innerText).toBe(
      '6 Votes',
    );
    expect(polls[0].children[0].children[0].children[2]).toBeUndefined();

    const paginator = await loader.getHarness(MatPaginatorHarness);

    await paginator.goToNextPage();

    fixture.detectChanges();

    expect(mockPollService.getPollsByPage).toHaveBeenCalledTimes(2);

    await paginator.goToNextPage();

    fixture.detectChanges();

    expect(mockPollService.getPollsByPage).toHaveBeenCalledTimes(2);

    polls = debugElement.queryAll(By.css('.box'));
    expect(polls.length).toBe(8);
    expect(polls[0].children[0].children[0].nativeElement.innerText).toBe(
      "Who's going to win the Premier League?",
    );
    expect(polls[0].children[0].children[1].nativeElement.innerText).toBe(
      '1 Votes',
    );
    expect(polls[0].children[0].children[2].nativeElement.innerText).toBe(
      'Your Vote: Fulham',
    );

    await paginator.goToPreviousPage();

    fixture.detectChanges();

    expect(mockPollService.getPollsByPage).toHaveBeenCalledTimes(3);

    await paginator.goToPreviousPage();

    fixture.detectChanges();

    expect(mockPollService.getPollsByPage).toHaveBeenCalledTimes(3);

    polls = debugElement.queryAll(By.css('.box'));
    expect(polls.length).toBe(8);
    expect(polls[0].children[0].children[0].nativeElement.innerText).toBe(
      "Who's the best F1 Driver?",
    );
    expect(polls[0].children[0].children[1].nativeElement.innerText).toBe(
      '6 Votes',
    );
    expect(polls[0].children[0].children[0].children[2]).toBeUndefined();
  });
});
