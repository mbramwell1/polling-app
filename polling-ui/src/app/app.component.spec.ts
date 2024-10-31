import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { AppComponent } from "./app.component";
import { PollService } from "./service/poll.service";
import { of } from "rxjs";
import { HttpHeaders, HttpResponse } from "@angular/common/http";
import { Poll } from "./model/poll";
import { MatSidenavModule } from "@angular/material/sidenav";
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from "@angular/router";

let closedPollNoVote = JSON.parse(`{
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

const headers: HttpHeaders = new HttpHeaders({ pages: 2 });

describe('ResultBarTests', () => {

    let component: AppComponent;
    let fixture: ComponentFixture<AppComponent>;

    let mockPollService: jasmine.SpyObj<PollService>;

    beforeEach(waitForAsync(() => {
        mockPollService = jasmine.createSpyObj(PollService, ['getPollsByPage']);
        
        const httpResponse1: HttpResponse<Poll[]> = new HttpResponse<Poll[]>({ status: 200, body: [openPollNoVote], headers: headers })
        const httpResponse2: HttpResponse<Poll[]> = new HttpResponse<Poll[]>({ status: 200, body: [closedPollNoVote], headers: headers })
        mockPollService.getPollsByPage.withArgs(0, 7).and.returnValue(of(httpResponse1));
        mockPollService.getPollsByPage.withArgs(1, 7).and.returnValue(of(httpResponse2));


        TestBed.configureTestingModule(
            {
                imports: [NoopAnimationsModule, MatSidenavModule, RouterModule],
                declarations: [AppComponent],
                providers: [
                    {
                        provide: PollService,
                        useValue: mockPollService
                    }
                ],
            }
        ).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AppComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeDefined();
    });

    it('open polls list opens', () => {
        const nativeElement = fixture.nativeElement;

        expect(nativeElement.querySelector('.sidenav')).toBeTruthy();
        expect(nativeElement.querySelector('.sidenav')).toBe('false');

        const openButton = nativeElement.querySelector('.open-button');
        openButton.dispatchEvent(new Event('click'));


    });
});