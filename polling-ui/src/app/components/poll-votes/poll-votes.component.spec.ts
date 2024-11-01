import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { PollVotesComponent } from './poll-votes.component';
import { PollService } from '../../service/poll.service';
import {
  HttpHeaders,
  HttpResponse,
  provideHttpClient,
} from '@angular/common/http';
import { of } from 'rxjs';
import { Vote } from '../../model/vote';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  convertToParamMap,
} from '@angular/router';
import { AppRoutingModule } from '../../app-routing.module';
import { BoxComponent } from '../box/box.component';
import { By } from '@angular/platform-browser';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatPaginatorHarness } from '@angular/material/paginator/testing';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Poll } from '../../model/poll';

let component: PollVotesComponent;
let fixture: ComponentFixture<PollVotesComponent>;

let mockPollService: jasmine.SpyObj<PollService>;

let closedPoll = JSON.parse(`{
    "id": "1234",
    "name": "Who's the best F1 Driver?",
    "active": false,
    "options": {
        "Lewis Hamilton": 0,
        "Fernando Alonso": 0,
        "Lance Stroll": 0,
        "Max Verstappen": 0
    },
    "votePlaced": null,
    "dateCreated": "2024-10-31T15:14:43"
}`);

let openPollNoVote = JSON.parse(`{
    "id": "1234",
    "name": "Who's the best F1 Driver?",
    "active": true,
    "options": {
        "Lewis Hamilton": 0,
        "Fernando Alonso": 0,
        "Lance Stroll": 0,
        "Max Verstappen": 0
    },
    "votePlaced": null,
    "dateCreated": "2024-10-31T15:14:43"
}`);

let openPollVote = JSON.parse(`{
    "id": "1234",
    "name": "Who's the best F1 Driver?",
    "active": true,
    "options": {
        "Lewis Hamilton": 0,
        "Fernando Alonso": 0,
        "Lance Stroll": 0,
        "Max Verstappen": 0
    },
    "votePlaced": "Lewis Hamilton",
    "dateCreated": "2024-10-31T15:14:43"
}`);

const voteArray1: Vote[] = [
  new Vote('1212', 'Test Choice 1', 'AnId1', '2024-11-01T15:14:43'),
  new Vote('2323', 'Test Choice 2', 'AnId2', '2024-11-01T15:14:43'),
  new Vote('3434', 'Test Choice 3', 'AnId3', '2024-11-01T15:14:43'),
  new Vote('4545', 'Test Choice 4', 'AnId4', '2024-11-01T15:14:43'),
  new Vote('5656', 'Test Choice 5', 'AnId5', '2024-11-01T15:14:43'),
  new Vote('6767', 'Test Choice 6', 'AnId6', '2024-11-01T15:14:43'),
  new Vote('7878', 'Test Choice 7', 'AnId7', '2024-11-01T15:14:43'),
];

const voteArray2: Vote[] = [
  new Vote('2121', 'Test Choice 8', 'AnId8', '2024-10-31T15:14:43'),
  new Vote('3232', 'Test Choice 9', 'AnId9', '2024-10-31T15:14:43'),
  new Vote('4343', 'Test Choice 10', 'AnId10', '2024-10-31T15:14:43'),
  new Vote('5454', 'Test Choice 11', 'AnId11', '2024-10-31T15:14:43'),
  new Vote('6565', 'Test Choice 12', 'AnId12', '2024-10-31T15:14:43'),
  new Vote('7676', 'Test Choice 13', 'AnId13', '2024-10-31T15:14:43'),
  new Vote('8787', 'Test Choice 14', 'AnId14', '2024-10-31T15:14:43'),
];

const voteArray3: Vote[] = [
  new Vote('1212', 'Test Choice 15', 'AnId15', '2024-10-30T15:14:43'),
  new Vote('2323', 'Test Choice 16', 'AnId16', '2024-10-30T15:14:43'),
  new Vote('3434', 'Test Choice 17', 'AnId17', '2024-10-30T15:14:43'),
  new Vote('4545', 'Test Choice 18', 'AnId18', '2024-10-30T15:14:43'),
  new Vote('5656', 'Test Choice 19', 'AnId19', '2024-10-30T15:14:43'),
  new Vote('6767', 'Test Choice 20', 'AnId20', '2024-10-30T15:14:43'),
  new Vote('7878', 'Test Choice 21', 'AnId21', '2024-10-30T15:14:43'),
];

const voteArray4: Vote[] = [
  new Vote('2121', 'Test Choice 22', 'AnId22', '2024-10-29T15:14:43'),
  new Vote('3232', 'Test Choice 23', 'AnId23', '2024-10-29T15:14:43'),
  new Vote('4343', 'Test Choice 24', 'AnId24', '2024-10-29T15:14:43'),
  new Vote('5454', 'Test Choice 25', 'AnId25', '2024-10-29T15:14:43'),
  new Vote('6565', 'Test Choice 26', 'AnId26', '2024-10-29T15:14:43'),
  new Vote('7676', 'Test Choice 27', 'AnId27', '2024-10-29T15:14:43'),
  new Vote('8787', 'Test Choice 28', 'AnId28', '2024-10-29T15:14:43'),
];

const headers: HttpHeaders = new HttpHeaders({ pages: 2, total: 14 });

let loader: HarnessLoader;

describe('When Poll ID is Provided and poll is open with vote', () => {
  beforeEach(waitForAsync(() => {
    mockPollService = jasmine.createSpyObj(PollService, [
      'getPollById',
      'getActivePoll',
      'getVotesForPoll',
    ]);

    const httpResponse1: HttpResponse<Vote[]> = new HttpResponse<Vote[]>({
      status: 200,
      body: voteArray1,
      headers: headers,
    });
    const httpResponse2: HttpResponse<Vote[]> = new HttpResponse<Vote[]>({
      status: 200,
      body: voteArray2,
      headers: headers,
    });

    const pollResponse: HttpResponse<Poll> = new HttpResponse<Poll>({
      status: 200,
      body: openPollVote,
    });

    mockPollService.getPollById
      .withArgs('1234')
      .and.returnValue(of(pollResponse));

    mockPollService.getVotesForPoll
      .withArgs('1234', 0, 7)
      .and.returnValue(of(httpResponse1));
    mockPollService.getVotesForPoll
      .withArgs('1234', 1, 7)
      .and.returnValue(of(httpResponse2));

    TestBed.configureTestingModule({
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: convertToParamMap({ id: '1234' }) },
          },
        },
        {
          provide: PollService,
          useValue: mockPollService,
        },
      ],
      declarations: [PollVotesComponent, BoxComponent],
      imports: [AppRoutingModule, MatPaginatorModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PollVotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });

  it('should get votes for poll id', () => {
    const nativeElement = fixture.nativeElement;
    const { debugElement } = fixture;

    expect(fixture.componentInstance.totalPages).toBe(2);
    expect(fixture.componentInstance.currentVotesPageNumber).toBe(0);

    expect(nativeElement.querySelector('.votes-container')).toBeTruthy();

    const votes = debugElement.queryAll(By.css('.box'));
    expect(votes.length).toBe(7);
    expect(votes[0].children[0].children[0].nativeNode.innerText).toBe(
      'Test Choice 1',
    );
    expect(votes[0].children[0].children[1].nativeNode.innerText).toBe(
      '01/11/2024 15:14:43',
    );
    expect(votes[0].children[0].children[2]).toBeUndefined();

    expect(votes[6].children[0].children[0].nativeNode.innerText).toBe(
      'Test Choice 7',
    );
    expect(votes[6].children[0].children[1].nativeNode.innerText).toBe(
      '01/11/2024 15:14:43',
    );
    expect(votes[6].children[0].children[2]).toBeUndefined();
  });

  it('paging should load new votes', async () => {
    loader = TestbedHarnessEnvironment.loader(fixture);
    const nativeElement = fixture.nativeElement;
    const { debugElement } = fixture;

    expect(mockPollService.getVotesForPoll).toHaveBeenCalledTimes(1);

    expect(fixture.componentInstance.totalPages).toBe(2);
    expect(fixture.componentInstance.currentVotesPageNumber).toBe(0);

    expect(nativeElement.querySelector('.votes-container')).toBeTruthy();

    let votes = debugElement.queryAll(By.css('.box'));
    expect(votes.length).toBe(7);
    expect(votes[0].children[0].children[0].nativeNode.innerText).toBe(
      'Test Choice 1',
    );
    expect(votes[0].children[0].children[1].nativeNode.innerText).toBe(
      '01/11/2024 15:14:43',
    );
    expect(votes[0].children[0].children[2]).toBeUndefined();

    expect(votes[6].children[0].children[0].nativeNode.innerText).toBe(
      'Test Choice 7',
    );
    expect(votes[6].children[0].children[1].nativeNode.innerText).toBe(
      '01/11/2024 15:14:43',
    );
    expect(votes[6].children[0].children[2]).toBeUndefined();

    const paginator = await loader.getHarness(MatPaginatorHarness);
    await paginator.goToNextPage();

    fixture.detectChanges();

    expect(mockPollService.getVotesForPoll).toHaveBeenCalledTimes(2);

    expect(fixture.componentInstance.totalPages).toBe(2);
    expect(fixture.componentInstance.currentVotesPageNumber).toBe(1);

    expect(nativeElement.querySelector('.votes-container')).toBeTruthy();

    votes = debugElement.queryAll(By.css('.box'));
    expect(votes.length).toBe(7);
    expect(votes[0].children[0].children[0].nativeNode.innerText).toBe(
      'Test Choice 8',
    );
    expect(votes[0].children[0].children[1].nativeNode.innerText).toBe(
      '31/10/2024 15:14:43',
    );
    expect(votes[0].children[0].children[2]).toBeUndefined();

    expect(votes[6].children[0].children[0].nativeNode.innerText).toBe(
      'Test Choice 14',
    );
    expect(votes[6].children[0].children[1].nativeNode.innerText).toBe(
      '31/10/2024 15:14:43',
    );
    expect(votes[6].children[0].children[2]).toBeUndefined();

    await paginator.goToNextPage();

    fixture.detectChanges();

    expect(mockPollService.getVotesForPoll).toHaveBeenCalledTimes(2);

    await paginator.goToPreviousPage();

    fixture.detectChanges();

    expect(mockPollService.getVotesForPoll).toHaveBeenCalledTimes(3);

    expect(fixture.componentInstance.totalPages).toBe(2);
    expect(fixture.componentInstance.currentVotesPageNumber).toBe(0);

    expect(nativeElement.querySelector('.votes-container')).toBeTruthy();

    votes = debugElement.queryAll(By.css('.box'));
    expect(votes.length).toBe(7);
    expect(votes[0].children[0].children[0].nativeNode.innerText).toBe(
      'Test Choice 1',
    );
    expect(votes[0].children[0].children[1].nativeNode.innerText).toBe(
      '01/11/2024 15:14:43',
    );
    expect(votes[0].children[0].children[2]).toBeUndefined();

    expect(votes[6].children[0].children[0].nativeNode.innerText).toBe(
      'Test Choice 7',
    );
    expect(votes[6].children[0].children[1].nativeNode.innerText).toBe(
      '01/11/2024 15:14:43',
    );
    expect(votes[6].children[0].children[2]).toBeUndefined();

    await paginator.goToPreviousPage();

    fixture.detectChanges();

    expect(mockPollService.getVotesForPoll).toHaveBeenCalledTimes(3);
  });
});

describe('When Poll ID is NOT Provided and poll is active with vote', () => {
  beforeEach(waitForAsync(() => {
    mockPollService = jasmine.createSpyObj(PollService, [
      'getPollById',
      'getActivePoll',
      'getVotesForPoll',
    ]);
    const httpResponse1: HttpResponse<Vote[]> = new HttpResponse<Vote[]>({
      status: 200,
      body: voteArray3,
      headers: headers,
    });
    const httpResponse2: HttpResponse<Vote[]> = new HttpResponse<Vote[]>({
      status: 200,
      body: voteArray4,
      headers: headers,
    });

    const pollResponse: HttpResponse<Poll> = new HttpResponse<Poll>({
      status: 200,
      body: openPollVote,
    });

    mockPollService.getActivePoll.and.returnValue(of(pollResponse));

    mockPollService.getVotesForPoll
      .withArgs('1234', 0, 7)
      .and.returnValue(of(httpResponse1));
    mockPollService.getVotesForPoll
      .withArgs('1234', 1, 7)
      .and.returnValue(of(httpResponse2));

    TestBed.configureTestingModule({
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({}) } },
        },
        {
          provide: PollService,
          useValue: mockPollService,
        },
      ],
      declarations: [PollVotesComponent, BoxComponent],
      imports: [AppRoutingModule, MatPaginatorModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PollVotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });

  it('should get votes for poll id', () => {
    const nativeElement = fixture.nativeElement;
    const { debugElement } = fixture;

    expect(fixture.componentInstance.totalPages).toBe(2);
    expect(fixture.componentInstance.currentVotesPageNumber).toBe(0);

    expect(nativeElement.querySelector('.votes-container')).toBeTruthy();

    const votes = debugElement.queryAll(By.css('.box'));
    expect(votes.length).toBe(7);
    expect(votes[0].children[0].children[0].nativeNode.innerText).toBe(
      'Test Choice 15',
    );
    expect(votes[0].children[0].children[1].nativeNode.innerText).toBe(
      '30/10/2024 15:14:43',
    );
    expect(votes[0].children[0].children[2]).toBeUndefined();

    expect(votes[6].children[0].children[0].nativeNode.innerText).toBe(
      'Test Choice 21',
    );
    expect(votes[6].children[0].children[1].nativeNode.innerText).toBe(
      '30/10/2024 15:14:43',
    );
    expect(votes[6].children[0].children[2]).toBeUndefined();
  });

  it('paging should load new votes', async () => {
    loader = TestbedHarnessEnvironment.loader(fixture);
    const nativeElement = fixture.nativeElement;
    const { debugElement } = fixture;

    expect(mockPollService.getVotesForPoll).toHaveBeenCalledTimes(1);

    expect(fixture.componentInstance.totalPages).toBe(2);
    expect(fixture.componentInstance.currentVotesPageNumber).toBe(0);

    expect(nativeElement.querySelector('.votes-container')).toBeTruthy();

    let votes = debugElement.queryAll(By.css('.box'));
    expect(votes.length).toBe(7);
    expect(votes[0].children[0].children[0].nativeNode.innerText).toBe(
      'Test Choice 15',
    );
    expect(votes[0].children[0].children[1].nativeNode.innerText).toBe(
      '30/10/2024 15:14:43',
    );
    expect(votes[0].children[0].children[2]).toBeUndefined();

    expect(votes[6].children[0].children[0].nativeNode.innerText).toBe(
      'Test Choice 21',
    );
    expect(votes[6].children[0].children[1].nativeNode.innerText).toBe(
      '30/10/2024 15:14:43',
    );
    expect(votes[6].children[0].children[2]).toBeUndefined();

    const paginator = await loader.getHarness(MatPaginatorHarness);
    await paginator.goToNextPage();

    fixture.detectChanges();

    expect(mockPollService.getVotesForPoll).toHaveBeenCalledTimes(2);

    expect(fixture.componentInstance.totalPages).toBe(2);
    expect(fixture.componentInstance.currentVotesPageNumber).toBe(1);

    expect(nativeElement.querySelector('.votes-container')).toBeTruthy();

    votes = debugElement.queryAll(By.css('.box'));
    expect(votes.length).toBe(7);
    expect(votes[0].children[0].children[0].nativeNode.innerText).toBe(
      'Test Choice 22',
    );
    expect(votes[0].children[0].children[1].nativeNode.innerText).toBe(
      '29/10/2024 15:14:43',
    );
    expect(votes[0].children[0].children[2]).toBeUndefined();

    expect(votes[6].children[0].children[0].nativeNode.innerText).toBe(
      'Test Choice 28',
    );
    expect(votes[6].children[0].children[1].nativeNode.innerText).toBe(
      '29/10/2024 15:14:43',
    );
    expect(votes[6].children[0].children[2]).toBeUndefined();

    await paginator.goToNextPage();

    fixture.detectChanges();

    expect(mockPollService.getVotesForPoll).toHaveBeenCalledTimes(2);

    await paginator.goToPreviousPage();

    fixture.detectChanges();

    expect(mockPollService.getVotesForPoll).toHaveBeenCalledTimes(3);

    expect(fixture.componentInstance.totalPages).toBe(2);
    expect(fixture.componentInstance.currentVotesPageNumber).toBe(0);

    expect(nativeElement.querySelector('.votes-container')).toBeTruthy();

    votes = debugElement.queryAll(By.css('.box'));
    expect(votes.length).toBe(7);
    expect(votes[0].children[0].children[0].nativeNode.innerText).toBe(
      'Test Choice 15',
    );
    expect(votes[0].children[0].children[1].nativeNode.innerText).toBe(
      '30/10/2024 15:14:43',
    );
    expect(votes[0].children[0].children[2]).toBeUndefined();

    expect(votes[6].children[0].children[0].nativeNode.innerText).toBe(
      'Test Choice 21',
    );
    expect(votes[6].children[0].children[1].nativeNode.innerText).toBe(
      '30/10/2024 15:14:43',
    );
    expect(votes[6].children[0].children[2]).toBeUndefined();

    await paginator.goToPreviousPage;

    fixture.detectChanges();

    expect(mockPollService.getVotesForPoll).toHaveBeenCalledTimes(3);
  });
});

describe('When Poll is closed with no vote still displays data', () => {
  beforeEach(waitForAsync(() => {
    mockPollService = jasmine.createSpyObj(PollService, [
      'getPollById',
      'getActivePoll',
      'getVotesForPoll',
    ]);
    const httpResponse1: HttpResponse<Vote[]> = new HttpResponse<Vote[]>({
      status: 200,
      body: voteArray3,
      headers: headers,
    });
    const httpResponse2: HttpResponse<Vote[]> = new HttpResponse<Vote[]>({
      status: 200,
      body: voteArray4,
      headers: headers,
    });

    const pollResponse: HttpResponse<Poll> = new HttpResponse<Poll>({
      status: 200,
      body: closedPoll,
    });

    mockPollService.getActivePoll.and.returnValue(of(pollResponse));

    mockPollService.getVotesForPoll
      .withArgs('1234', 0, 7)
      .and.returnValue(of(httpResponse1));
    mockPollService.getVotesForPoll
      .withArgs('1234', 1, 7)
      .and.returnValue(of(httpResponse2));

    TestBed.configureTestingModule({
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({}) } },
        },
        {
          provide: PollService,
          useValue: mockPollService,
        },
      ],
      declarations: [PollVotesComponent, BoxComponent],
      imports: [AppRoutingModule, MatPaginatorModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PollVotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });

  it('should get votes for poll id', () => {
    const nativeElement = fixture.nativeElement;
    const { debugElement } = fixture;

    expect(fixture.componentInstance.totalPages).toBe(2);
    expect(fixture.componentInstance.currentVotesPageNumber).toBe(0);

    expect(nativeElement.querySelector('.votes-container')).toBeTruthy();

    const votes = debugElement.queryAll(By.css('.box'));
    expect(votes.length).toBe(7);
    expect(votes[0].children[0].children[0].nativeNode.innerText).toBe(
      'Test Choice 15',
    );
    expect(votes[0].children[0].children[1].nativeNode.innerText).toBe(
      '30/10/2024 15:14:43',
    );
    expect(votes[0].children[0].children[2]).toBeUndefined();

    expect(votes[6].children[0].children[0].nativeNode.innerText).toBe(
      'Test Choice 21',
    );
    expect(votes[6].children[0].children[1].nativeNode.innerText).toBe(
      '30/10/2024 15:14:43',
    );
    expect(votes[6].children[0].children[2]).toBeUndefined();
  });

  it('paging should load new votes', async () => {
    loader = TestbedHarnessEnvironment.loader(fixture);
    const nativeElement = fixture.nativeElement;
    const { debugElement } = fixture;

    expect(mockPollService.getVotesForPoll).toHaveBeenCalledTimes(1);

    expect(fixture.componentInstance.totalPages).toBe(2);
    expect(fixture.componentInstance.currentVotesPageNumber).toBe(0);

    expect(nativeElement.querySelector('.votes-container')).toBeTruthy();

    let votes = debugElement.queryAll(By.css('.box'));
    expect(votes.length).toBe(7);
    expect(votes[0].children[0].children[0].nativeNode.innerText).toBe(
      'Test Choice 15',
    );
    expect(votes[0].children[0].children[1].nativeNode.innerText).toBe(
      '30/10/2024 15:14:43',
    );
    expect(votes[0].children[0].children[2]).toBeUndefined();

    expect(votes[6].children[0].children[0].nativeNode.innerText).toBe(
      'Test Choice 21',
    );
    expect(votes[6].children[0].children[1].nativeNode.innerText).toBe(
      '30/10/2024 15:14:43',
    );
    expect(votes[6].children[0].children[2]).toBeUndefined();

    const paginator = await loader.getHarness(MatPaginatorHarness);
    await paginator.goToNextPage();

    fixture.detectChanges();

    expect(mockPollService.getVotesForPoll).toHaveBeenCalledTimes(2);

    expect(fixture.componentInstance.totalPages).toBe(2);
    expect(fixture.componentInstance.currentVotesPageNumber).toBe(1);

    expect(nativeElement.querySelector('.votes-container')).toBeTruthy();

    votes = debugElement.queryAll(By.css('.box'));
    expect(votes.length).toBe(7);
    expect(votes[0].children[0].children[0].nativeNode.innerText).toBe(
      'Test Choice 22',
    );
    expect(votes[0].children[0].children[1].nativeNode.innerText).toBe(
      '29/10/2024 15:14:43',
    );
    expect(votes[0].children[0].children[2]).toBeUndefined();

    expect(votes[6].children[0].children[0].nativeNode.innerText).toBe(
      'Test Choice 28',
    );
    expect(votes[6].children[0].children[1].nativeNode.innerText).toBe(
      '29/10/2024 15:14:43',
    );
    expect(votes[6].children[0].children[2]).toBeUndefined();

    await paginator.goToNextPage();

    fixture.detectChanges();

    expect(mockPollService.getVotesForPoll).toHaveBeenCalledTimes(2);

    await paginator.goToPreviousPage();

    fixture.detectChanges();

    expect(mockPollService.getVotesForPoll).toHaveBeenCalledTimes(3);

    expect(fixture.componentInstance.totalPages).toBe(2);
    expect(fixture.componentInstance.currentVotesPageNumber).toBe(0);

    expect(nativeElement.querySelector('.votes-container')).toBeTruthy();

    votes = debugElement.queryAll(By.css('.box'));
    expect(votes.length).toBe(7);
    expect(votes[0].children[0].children[0].nativeNode.innerText).toBe(
      'Test Choice 15',
    );
    expect(votes[0].children[0].children[1].nativeNode.innerText).toBe(
      '30/10/2024 15:14:43',
    );
    expect(votes[0].children[0].children[2]).toBeUndefined();

    expect(votes[6].children[0].children[0].nativeNode.innerText).toBe(
      'Test Choice 21',
    );
    expect(votes[6].children[0].children[1].nativeNode.innerText).toBe(
      '30/10/2024 15:14:43',
    );
    expect(votes[6].children[0].children[2]).toBeUndefined();

    await paginator.goToPreviousPage;

    fixture.detectChanges();

    expect(mockPollService.getVotesForPoll).toHaveBeenCalledTimes(3);
  });
});

describe('votes By ID Error Handling', () => {
  let httpTesting: HttpTestingController;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: convertToParamMap({ id: '1234' }) },
          },
        },
        {
          provide: PollService,
        },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
      declarations: [PollVotesComponent, BoxComponent],
      imports: [
        AppRoutingModule,
        MatProgressSpinnerModule,
        NoopAnimationsModule,
        MatPaginatorModule,
      ],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PollVotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });

  it('should display cant see votes for poll not voted', () => {
    const nativeElement = fixture.nativeElement;

    const req = httpTesting.expectOne(
      {
        method: 'GET',
        url: 'http://localhost:8080/poll/1234',
      },
      'Request for Votes by ID',
    );
    req.flush(openPollNoVote, {
      headers: headers,
    });

    fixture.detectChanges();

    expect(nativeElement.querySelector('.votes-parent-container')).toBeTruthy();
    expect(nativeElement.querySelector('.error-container')).toBeTruthy();
    expect(nativeElement.querySelector('.error-container').innerText).toBe(
      "You can't see Votes for an Active Poll you have not voted in.",
    );
  });

  it('should display poll not found error', () => {
    const nativeElement = fixture.nativeElement;

    const req = httpTesting.expectOne(
      {
        method: 'GET',
        url: 'http://localhost:8080/poll/1234',
      },
      'Request for Votes by ID',
    );
    req.flush('Not Found', { status: 404, statusText: 'Not Found' });

    fixture.detectChanges();

    expect(nativeElement.querySelector('.votes-parent-container')).toBeTruthy();
    expect(nativeElement.querySelector('.error-container')).toBeTruthy();
    expect(nativeElement.querySelector('.error-container').innerText).toBe(
      'Poll Not Found',
    );
  });

  it('should display generic error', () => {
    const nativeElement = fixture.nativeElement;

    const req = httpTesting.expectOne(
      {
        method: 'GET',
        url: 'http://localhost:8080/poll/1234',
      },
      'Request for Votes by ID',
    );
    req.flush('Not Found', { status: 500, statusText: 'Server Error' });

    fixture.detectChanges();

    expect(nativeElement.querySelector('.votes-parent-container')).toBeTruthy();
    expect(nativeElement.querySelector('.error-container')).toBeTruthy();
    expect(nativeElement.querySelector('.error-container').innerText).toBe(
      'An Error has Occurred. Please try again later.',
    );
  });

  it('should handle error on paging', async () => {
    loader = TestbedHarnessEnvironment.loader(fixture);
    const nativeElement = fixture.nativeElement;
    const { debugElement } = fixture;

    const pollReq = httpTesting.expectOne(
      {
        method: 'GET',
        url: 'http://localhost:8080/poll/1234',
      },
      'Request for poll by ID',
    );
    pollReq.flush(openPollVote, {
      headers: headers,
    });

    const req = httpTesting.expectOne(
      {
        method: 'GET',
        url: 'http://localhost:8080/poll/1234/vote?page=0&number=7',
      },
      'Request for Votes by ID',
    );
    req.flush(voteArray1, {
      headers: headers,
    });

    fixture.detectChanges();

    expect(nativeElement.querySelector('.votes-parent-container')).toBeTruthy();
    expect(nativeElement.querySelector('.error-container')).toBeNull();

    expect(fixture.componentInstance.totalPages).toBe(2);

    const paginator = await loader.getHarness(MatPaginatorHarness);
    await paginator.goToNextPage();

    const pageReq = httpTesting.expectOne(
      {
        method: 'GET',
        url: 'http://localhost:8080/poll/1234/vote?page=1&number=7',
      },
      'Request Page by ID',
    );
    pageReq.flush('Not Found', { status: 500, statusText: 'Server Error' });

    fixture.detectChanges();

    expect(nativeElement.querySelector('.error-container')).toBeNull;
    const votes = debugElement.queryAll(By.css('.box'));
    expect(votes.length).toBe(7);
    expect(votes[0].children[0].children[0].nativeNode.innerText).toBe(
      'Test Choice 1',
    );
    expect(votes[0].children[0].children[1].nativeNode.innerText).toBe(
      '01/11/2024 15:14:43',
    );
  });
});

describe('votes for Active Poll Error Handling', () => {
  let httpTesting: HttpTestingController;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({}) } },
        },
        {
          provide: PollService,
        },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
      declarations: [PollVotesComponent, BoxComponent],
      imports: [
        AppRoutingModule,
        MatProgressSpinnerModule,
        NoopAnimationsModule,
        MatPaginatorModule,
      ],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PollVotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });

  it('should display cant see votes for poll not voted', () => {
    const nativeElement = fixture.nativeElement;

    const req = httpTesting.expectOne(
      {
        method: 'GET',
        url: 'http://localhost:8080/poll/active',
      },
      'Request for Votes by ID',
    );
    req.flush(openPollNoVote, {
      headers: headers,
    });

    fixture.detectChanges();

    expect(nativeElement.querySelector('.votes-parent-container')).toBeTruthy();
    expect(nativeElement.querySelector('.error-container')).toBeTruthy();
    expect(nativeElement.querySelector('.error-container').innerText).toBe(
      "You can't see Votes for an Active Poll you have not voted in.",
    );
  });

  it('should display poll not found error', () => {
    const nativeElement = fixture.nativeElement;

    const req = httpTesting.expectOne(
      {
        method: 'GET',
        url: 'http://localhost:8080/poll/active',
      },
      'Request for Votes by Active',
    );
    req.flush('Not Found', { status: 404, statusText: 'Not Found' });

    fixture.detectChanges();

    expect(nativeElement.querySelector('.votes-parent-container')).toBeTruthy();
    expect(nativeElement.querySelector('.error-container')).toBeTruthy();
    expect(nativeElement.querySelector('.error-container').innerText).toBe(
      "We don't have an Active Poll right now. Please try again later.",
    );
  });

  it('should display generic error', () => {
    const nativeElement = fixture.nativeElement;

    const req = httpTesting.expectOne(
      {
        method: 'GET',
        url: 'http://localhost:8080/poll/active',
      },
      'Request for Votes by Active',
    );
    req.flush('Not Found', { status: 500, statusText: 'Server Error' });

    fixture.detectChanges();

    expect(nativeElement.querySelector('.votes-parent-container')).toBeTruthy();
    expect(nativeElement.querySelector('.error-container')).toBeTruthy();
    expect(nativeElement.querySelector('.error-container').innerText).toBe(
      'An Error has Occurred. Please try again later.',
    );
  });

  it('should handle error on paging', async () => {
    loader = TestbedHarnessEnvironment.loader(fixture);
    const nativeElement = fixture.nativeElement;
    const { debugElement } = fixture;

    const pollReq = httpTesting.expectOne(
      {
        method: 'GET',
        url: 'http://localhost:8080/poll/active',
      },
      'Request for poll by active',
    );
    pollReq.flush(openPollVote, {
      headers: headers,
    });

    const req = httpTesting.expectOne(
      {
        method: 'GET',
        url: 'http://localhost:8080/poll/1234/vote?page=0&number=7',
      },
      'Request for Votes by Active',
    );
    req.flush(voteArray1, {
      headers: headers,
    });

    fixture.detectChanges();

    expect(nativeElement.querySelector('.votes-parent-container')).toBeTruthy();
    expect(nativeElement.querySelector('.error-container')).toBeNull();

    expect(fixture.componentInstance.totalPages).toBe(2);

    const paginator = await loader.getHarness(MatPaginatorHarness);
    await paginator.goToNextPage();

    const pageReq = httpTesting.expectOne(
      {
        method: 'GET',
        url: 'http://localhost:8080/poll/1234/vote?page=1&number=7',
      },
      'Request Page by Active',
    );
    pageReq.flush('Not Found', { status: 500, statusText: 'Server Error' });

    fixture.detectChanges();

    expect(nativeElement.querySelector('.error-container')).toBeNull;
    const votes = debugElement.queryAll(By.css('.box'));
    expect(votes.length).toBe(7);
    expect(votes[0].children[0].children[0].nativeNode.innerText).toBe(
      'Test Choice 1',
    );
    expect(votes[0].children[0].children[1].nativeNode.innerText).toBe(
      '01/11/2024 15:14:43',
    );
  });
});
