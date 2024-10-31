import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { PollVotesComponent } from "./poll-votes.component";
import { PollService } from "../../service/poll.service";
import { HttpHeaders, HttpResponse } from "@angular/common/http";
import { of } from 'rxjs';
import { Vote } from "../../model/vote";
import { ActivatedRoute, ActivatedRouteSnapshot, convertToParamMap } from "@angular/router";
import { AppRoutingModule } from "../../app-routing.module";
import { BoxComponent } from "../box/box.component";
import { By } from "@angular/platform-browser";

let component: PollVotesComponent;
let fixture: ComponentFixture<PollVotesComponent>;

let mockPollService: jasmine.SpyObj<PollService>;

const voteArray1: Vote[] = [
    new Vote("1212", "Test Choice 1", "AnId1", "2024-11-01T15:14:43"),
    new Vote("2323", "Test Choice 2", "AnId2", "2024-11-01T15:14:43"),
    new Vote("3434", "Test Choice 3", "AnId3", "2024-11-01T15:14:43"),
    new Vote("4545", "Test Choice 4", "AnId4", "2024-11-01T15:14:43"),
    new Vote("5656", "Test Choice 5", "AnId5", "2024-11-01T15:14:43"),
    new Vote("6767", "Test Choice 6", "AnId6", "2024-11-01T15:14:43"),
    new Vote("7878", "Test Choice 7", "AnId7", "2024-11-01T15:14:43"),
];

const voteArray2: Vote[] = [
    new Vote("2121", "Test Choice 8", "AnId8", "2024-10-31T15:14:43"),
    new Vote("3232", "Test Choice 9", "AnId9", "2024-10-31T15:14:43"),
    new Vote("4343", "Test Choice 10", "AnId10", "2024-10-31T15:14:43"),
    new Vote("5454", "Test Choice 11", "AnId11", "2024-10-31T15:14:43"),
    new Vote("6565", "Test Choice 12", "AnId12", "2024-10-31T15:14:43"),
    new Vote("7676", "Test Choice 13", "AnId13", "2024-10-31T15:14:43"),
    new Vote("8787", "Test Choice 14", "AnId14", "2024-10-31T15:14:43"),
];

const voteArray3: Vote[] = [
    new Vote("1212", "Test Choice 15", "AnId15", "2024-10-30T15:14:43"),
    new Vote("2323", "Test Choice 16", "AnId16", "2024-10-30T15:14:43"),
    new Vote("3434", "Test Choice 17", "AnId17", "2024-10-30T15:14:43"),
    new Vote("4545", "Test Choice 18", "AnId18", "2024-10-30T15:14:43"),
    new Vote("5656", "Test Choice 19", "AnId19", "2024-10-30T15:14:43"),
    new Vote("6767", "Test Choice 20", "AnId20", "2024-10-30T15:14:43"),
    new Vote("7878", "Test Choice 21", "AnId21", "2024-10-30T15:14:43"),
];

const voteArray4: Vote[] = [
    new Vote("2121", "Test Choice 22", "AnId22", "2024-10-29T15:14:43"),
    new Vote("3232", "Test Choice 23", "AnId23", "2024-10-29T15:14:43"),
    new Vote("4343", "Test Choice 24", "AnId24", "2024-10-29T15:14:43"),
    new Vote("5454", "Test Choice 25", "AnId25", "2024-10-29T15:14:43"),
    new Vote("6565", "Test Choice 26", "AnId26", "2024-10-29T15:14:43"),
    new Vote("7676", "Test Choice 27", "AnId27", "2024-10-29T15:14:43"),
    new Vote("8787", "Test Choice 28", "AnId28", "2024-10-29T15:14:43"),
];

const headers: HttpHeaders = new HttpHeaders({ pages: 2 });

describe('When Poll ID is Provided', () => {

    beforeEach(waitForAsync(() => {
        mockPollService = jasmine.createSpyObj(PollService, ['getVotesForPoll']);

        const httpResponse1: HttpResponse<Vote[]> = new HttpResponse<Vote[]>({ status: 200, body: voteArray1, headers: headers })
        const httpResponse2: HttpResponse<Vote[]> = new HttpResponse<Vote[]>({ status: 200, body: voteArray2, headers: headers })
        mockPollService.getVotesForPoll.withArgs("1234", 0, 7).and.returnValue(of(httpResponse1));
        mockPollService.getVotesForPoll.withArgs("1234", 1, 7).and.returnValue(of(httpResponse2));

        TestBed.configureTestingModule(
            {
                providers: [
                    {
                        provide: ActivatedRoute,
                        useValue: { snapshot: { paramMap: convertToParamMap({ id: '1234' }) } }
                    },
                    {
                        provide: PollService,
                        useValue: mockPollService
                    }
                ],
                declarations: [PollVotesComponent, BoxComponent],
                imports: [AppRoutingModule]
            }
        ).compileComponents();
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

        const votes = debugElement.queryAll(By.css('.vote'));
        expect(votes.length).toBe(7)
        expect(votes[0].children[0].children[0].children[0].nativeNode.innerText).toBe("Test Choice 1");
        expect(votes[0].children[0].children[0].children[1].nativeNode.innerText).toBe("01/11/2024 15:14:43");
        expect(votes[0].children[0].children[0].children[2]).toBeUndefined();

        expect(votes[6].children[0].children[0].children[0].nativeNode.innerText).toBe("Test Choice 7");
        expect(votes[6].children[0].children[0].children[1].nativeNode.innerText).toBe("01/11/2024 15:14:43");
        expect(votes[6].children[0].children[0].children[2]).toBeUndefined();
    });

    it('paging should load new votes', () => {
        const nativeElement = fixture.nativeElement;
        const { debugElement } = fixture;

        expect(fixture.componentInstance.totalPages).toBe(2);
        expect(fixture.componentInstance.currentVotesPageNumber).toBe(0);

        expect(nativeElement.querySelector('.votes-container')).toBeTruthy();

        let votes = debugElement.queryAll(By.css('.vote'));
        expect(votes.length).toBe(7)
        expect(votes[0].children[0].children[0].children[0].nativeNode.innerText).toBe("Test Choice 1");
        expect(votes[0].children[0].children[0].children[1].nativeNode.innerText).toBe("01/11/2024 15:14:43");
        expect(votes[0].children[0].children[0].children[2]).toBeUndefined();

        expect(votes[6].children[0].children[0].children[0].nativeNode.innerText).toBe("Test Choice 7");
        expect(votes[6].children[0].children[0].children[1].nativeNode.innerText).toBe("01/11/2024 15:14:43");
        expect(votes[6].children[0].children[0].children[2]).toBeUndefined();

        const next = nativeElement.querySelector('.next');
        next.dispatchEvent(new Event('click'));

        fixture.detectChanges();

        expect(fixture.componentInstance.totalPages).toBe(2);
        expect(fixture.componentInstance.currentVotesPageNumber).toBe(1);

        expect(nativeElement.querySelector('.votes-container')).toBeTruthy();

        votes = debugElement.queryAll(By.css('.vote'));
        expect(votes.length).toBe(7)
        expect(votes[0].children[0].children[0].children[0].nativeNode.innerText).toBe("Test Choice 8");
        expect(votes[0].children[0].children[0].children[1].nativeNode.innerText).toBe("31/10/2024 15:14:43");
        expect(votes[0].children[0].children[0].children[2]).toBeUndefined();

        expect(votes[6].children[0].children[0].children[0].nativeNode.innerText).toBe("Test Choice 14");
        expect(votes[6].children[0].children[0].children[1].nativeNode.innerText).toBe("31/10/2024 15:14:43");
        expect(votes[6].children[0].children[0].children[2]).toBeUndefined();
    });
});

describe('When Poll ID is NOT Provided', () => {

    beforeEach(waitForAsync(() => {
        mockPollService = jasmine.createSpyObj(PollService, ['getVotesForPoll']);
        const httpResponse1: HttpResponse<Vote[]> = new HttpResponse<Vote[]>({ status: 200, body: voteArray3, headers: headers })
        const httpResponse2: HttpResponse<Vote[]> = new HttpResponse<Vote[]>({ status: 200, body: voteArray4, headers: headers })
        mockPollService.getVotesForPoll.withArgs("active", 0, 7).and.returnValue(of(httpResponse1));
        mockPollService.getVotesForPoll.withArgs("active", 1, 7).and.returnValue(of(httpResponse2));

        TestBed.configureTestingModule(
            {
                providers: [
                    {
                        provide: ActivatedRoute,
                        useValue: { snapshot: { paramMap: convertToParamMap({}) } }
                    },
                    {
                        provide: PollService,
                        useValue: mockPollService
                    }
                ],
                declarations: [PollVotesComponent, BoxComponent],
                imports: [AppRoutingModule]
            }
        ).compileComponents();
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

        const votes = debugElement.queryAll(By.css('.vote'));
        expect(votes.length).toBe(7)
        expect(votes[0].children[0].children[0].children[0].nativeNode.innerText).toBe("Test Choice 15");
        expect(votes[0].children[0].children[0].children[1].nativeNode.innerText).toBe("30/10/2024 15:14:43");
        expect(votes[0].children[0].children[0].children[2]).toBeUndefined();

        expect(votes[6].children[0].children[0].children[0].nativeNode.innerText).toBe("Test Choice 21");
        expect(votes[6].children[0].children[0].children[1].nativeNode.innerText).toBe("30/10/2024 15:14:43");
        expect(votes[6].children[0].children[0].children[2]).toBeUndefined();
    });

    it('paging should load new votes', () => {
        const nativeElement = fixture.nativeElement;
        const { debugElement } = fixture;

        expect(fixture.componentInstance.totalPages).toBe(2);
        expect(fixture.componentInstance.currentVotesPageNumber).toBe(0);


        expect(nativeElement.querySelector('.votes-container')).toBeTruthy();

        let votes = debugElement.queryAll(By.css('.vote'));
        expect(votes.length).toBe(7)
        expect(votes[0].children[0].children[0].children[0].nativeNode.innerText).toBe("Test Choice 15");
        expect(votes[0].children[0].children[0].children[1].nativeNode.innerText).toBe("30/10/2024 15:14:43");
        expect(votes[0].children[0].children[0].children[2]).toBeUndefined();

        expect(votes[6].children[0].children[0].children[0].nativeNode.innerText).toBe("Test Choice 21");
        expect(votes[6].children[0].children[0].children[1].nativeNode.innerText).toBe("30/10/2024 15:14:43");
        expect(votes[6].children[0].children[0].children[2]).toBeUndefined();

        const next = nativeElement.querySelector('.next');
        next.dispatchEvent(new Event('click'));

        fixture.detectChanges();

        expect(fixture.componentInstance.totalPages).toBe(2);
        expect(fixture.componentInstance.currentVotesPageNumber).toBe(1);

        expect(nativeElement.querySelector('.votes-container')).toBeTruthy();

        votes = debugElement.queryAll(By.css('.vote'));
        expect(votes.length).toBe(7)
        expect(votes[0].children[0].children[0].children[0].nativeNode.innerText).toBe("Test Choice 22");
        expect(votes[0].children[0].children[0].children[1].nativeNode.innerText).toBe("29/10/2024 15:14:43");
        expect(votes[0].children[0].children[0].children[2]).toBeUndefined();

        expect(votes[6].children[0].children[0].children[0].nativeNode.innerText).toBe("Test Choice 28");
        expect(votes[6].children[0].children[0].children[1].nativeNode.innerText).toBe("29/10/2024 15:14:43");
        expect(votes[6].children[0].children[0].children[2]).toBeUndefined();
    });
});