import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { PollDetailsComponent } from "./poll-details.component";
import { PollService } from "../../service/poll.service";
import { HttpHeaders, HttpResponse } from "@angular/common/http";
import { of, Subject } from 'rxjs';
import { Vote } from "../../model/vote";
import { ActivatedRoute, ActivatedRouteSnapshot, convertToParamMap } from "@angular/router";
import { AppRoutingModule } from "../../app-routing.module";
import { BoxComponent } from "../box/box.component";
import { By } from "@angular/platform-browser";
import { WebsocketService } from "../../service/websocket.service";
import { Poll } from "../../model/poll";
import { WebSocketMessage } from "../../model/websocket-message";
import { ResultBarComponent } from "../result-bar/result-bar.component";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";

let component: PollDetailsComponent;
let fixture: ComponentFixture<PollDetailsComponent>;

let mockPollService: jasmine.SpyObj<PollService>;
let mockWebSocketService: jasmine.SpyObj<WebsocketService>;

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

let closedPollVote = JSON.parse(`{
        "id": "1234",
        "name": "Who's the best F1 Driver?",
        "active": false,
        "options": {
            "Lewis Hamilton": 1,
            "Fernando Alonso": 0,
            "Lance Stroll": 0,
            "Max Verstappen": 0
        },
        "votePlaced": "Lewis Hamilton",
        "dateCreated": "2024-10-31T15:14:43"
    }`);

let openPollVote = JSON.parse(`{
        "id": "1234",
        "name": "Who's the best F1 Driver?",
        "active": true,
        "options": {
            "Lewis Hamilton": 1,
            "Fernando Alonso": 0,
            "Lance Stroll": 0,
            "Max Verstappen": 0
        },
        "votePlaced": "Lewis Hamilton",
        "dateCreated": "2024-10-31T15:14:43"
    }`);

let newVote = JSON.parse(`{
        "id": "67236946945c065c52e10bba",
        "pollId": "1234",
        "choice": "Lewis Hamilton",
        "dateCreated": "2024-10-31T11:25:58.78906"
    }`)

let webSocketMessageReceived = new Subject<WebSocketMessage>();

describe('When Poll ID is Provided for Open Poll with no Vote', () => {

    beforeEach(waitForAsync(() => {
        mockPollService = jasmine.createSpyObj(PollService, ['getPollById', 'getActivePoll', 'vote']);
        mockWebSocketService = jasmine.createSpyObj(WebsocketService, ["connect", "closeConnection"]);

        mockPollService.getPollById.withArgs("1234").and.returnValue(of(openPollNoVote));
        mockPollService.vote.and.callFake((pollId, choice) => {
            webSocketMessageReceived.next(new WebSocketMessage({
                pollId: pollId,
                choice: choice,
                message: 'newvote'
            }));
            return of(newVote);
        });

        mockWebSocketService.messageReceived = webSocketMessageReceived;

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
                    },
                    {
                        provide: WebsocketService,
                        useValue: mockWebSocketService
                    }
                ],
                declarations: [PollDetailsComponent, ResultBarComponent],
                imports: [AppRoutingModule, MatProgressSpinnerModule]
            }
        ).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(PollDetailsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeDefined();
    });

    it('should display', () => {
        const nativeElement = fixture.nativeElement;
        const { debugElement } = fixture;

        expect(nativeElement.querySelector('.details-container')).toBeTruthy();
        expect(nativeElement.querySelector('.title-container').innerText).toBe("Who's the best F1 Driver?")
        expect(nativeElement.querySelector('.votes-count-container').innerText).toBe("0 Votes - ")
        expect(nativeElement.querySelector('.text-container')).toBeTruthy();
        expect(nativeElement.querySelector('.text-container').innerText).toBe("Cast your vote now!")
        expect(nativeElement.querySelector('.reload-button')).toBeNull();

        expect(nativeElement.querySelector('.result-bar')).toBeTruthy();
        const bars = debugElement.queryAll(By.css('.result-bar'));
        expect(bars.length).toBe(4)

        expect(nativeElement.querySelector('.votes-link')).toBeNull();
    });

    it('should be able to vote', () => {
        const nativeElement = fixture.nativeElement;
        const { debugElement } = fixture;

        expect(nativeElement.querySelector('.details-container')).toBeTruthy();
        expect(nativeElement.querySelector('.title-container').innerText).toBe("Who's the best F1 Driver?")
        expect(nativeElement.querySelector('.votes-count-container').innerText).toBe("0 Votes - ")
        expect(nativeElement.querySelector('.text-container')).toBeTruthy();
        expect(nativeElement.querySelector('.text-container').innerText).toBe("Cast your vote now!")
        expect(nativeElement.querySelector('.reload-button')).toBeNull();

        expect(nativeElement.querySelector('.result-bar')).toBeTruthy();
        let bars = debugElement.queryAll(By.css('.result-bar'));
        expect(bars.length).toBe(4)

        expect(nativeElement.querySelector('.votes-link')).toBeNull();

        bars[0].nativeElement.dispatchEvent(new Event('click'));
        expect(mockPollService.vote).toHaveBeenCalled();

        fixture.detectChanges();

        expect(nativeElement.querySelector('.votes-count-container').innerText).toBe("1 Votes - ")
        expect(nativeElement.querySelector('.text-container').innerText).toBe("Thanks for your Response.")
        expect(nativeElement.querySelector('.votes-link')).toBeTruthy();
    });
});

describe('When Poll ID is Provided for Closed Poll with no Vote', () => {

    beforeEach(waitForAsync(() => {
        mockPollService = jasmine.createSpyObj(PollService, ['getPollById', 'getActivePoll', 'vote']);
        mockWebSocketService = jasmine.createSpyObj(WebsocketService, ["connect", "closeConnection"]);

        mockPollService.getPollById.withArgs("1234").and.returnValue(of(closedPollNoVote));

        mockWebSocketService.messageReceived = webSocketMessageReceived;

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
                    },
                    {
                        provide: WebsocketService,
                        useValue: mockWebSocketService
                    }
                ],
                declarations: [PollDetailsComponent, ResultBarComponent],
                imports: [AppRoutingModule, MatProgressSpinnerModule]
            }
        ).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(PollDetailsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeDefined();
    });

    it('should display', () => {
        const nativeElement = fixture.nativeElement;
        const { debugElement } = fixture;

        expect(nativeElement.querySelector('.details-container')).toBeTruthy();
        expect(nativeElement.querySelector('.title-container').innerText).toBe("Who's the best F1 Driver?")
        expect(nativeElement.querySelector('.votes-count-container').innerText).toBe("0 Votes - ")
        expect(nativeElement.querySelector('.text-container')).toBeTruthy();
        expect(nativeElement.querySelector('.text-container').innerText).toBe("This Poll has now Closed.")
        expect(nativeElement.querySelector('.reload-button')).toBeTruthy();

        expect(nativeElement.querySelector('.result-bar')).toBeTruthy();
        const bars = debugElement.queryAll(By.css('.result-bar'));
        expect(bars.length).toBe(4)

        expect(nativeElement.querySelector('.votes-link')).toBeTruthy();
    });

    it('should NOT be able to vote', () => {
        const { debugElement } = fixture;

        let bars = debugElement.queryAll(By.css('.result-bar'));

        bars[0].nativeElement.dispatchEvent(new Event('click'));
        expect(mockPollService.vote).not.toHaveBeenCalled();
    });
});

describe('When Poll ID is Provided for Closed Poll with Vote', () => {

    beforeEach(waitForAsync(() => {
        mockPollService = jasmine.createSpyObj(PollService, ['getPollById', 'getActivePoll', 'vote']);
        mockWebSocketService = jasmine.createSpyObj(WebsocketService, ["connect", "closeConnection"]);

        mockPollService.getPollById.withArgs("1234").and.returnValue(of(closedPollVote));

        mockWebSocketService.messageReceived = webSocketMessageReceived;

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
                    },
                    {
                        provide: WebsocketService,
                        useValue: mockWebSocketService
                    }
                ],
                declarations: [PollDetailsComponent, ResultBarComponent],
                imports: [AppRoutingModule, MatProgressSpinnerModule]
            }
        ).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(PollDetailsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeDefined();
    });

    it('should display', () => {
        const nativeElement = fixture.nativeElement;
        const { debugElement } = fixture;

        expect(nativeElement.querySelector('.details-container')).toBeTruthy();
        expect(nativeElement.querySelector('.title-container').innerText).toBe("Who's the best F1 Driver?")
        expect(nativeElement.querySelector('.votes-count-container').innerText).toBe("1 Votes - ")
        expect(nativeElement.querySelector('.text-container')).toBeTruthy();
        expect(nativeElement.querySelector('.text-container').innerText).toBe("Thanks for your Response, this Poll has now Closed.")
        expect(nativeElement.querySelector('.reload-button')).toBeTruthy();

        expect(nativeElement.querySelector('.result-bar')).toBeTruthy();
        const bars = debugElement.queryAll(By.css('.result-bar'));
        expect(bars.length).toBe(4)

        expect(nativeElement.querySelector('.votes-link')).toBeTruthy();
    });

    it('should NOT be able to vote', () => {
        const { debugElement } = fixture;

        let bars = debugElement.queryAll(By.css('.result-bar'));

        bars[0].nativeElement.dispatchEvent(new Event('click'));
        expect(mockPollService.vote).not.toHaveBeenCalled();
    });
});

describe('When Poll ID is Provided for Open Poll with Vote', () => {

    beforeEach(waitForAsync(() => {
        mockPollService = jasmine.createSpyObj(PollService, ['getPollById', 'getActivePoll', 'vote']);
        mockWebSocketService = jasmine.createSpyObj(WebsocketService, ["connect", "closeConnection"]);

        mockPollService.getPollById.withArgs("1234").and.returnValue(of(openPollVote));

        mockWebSocketService.messageReceived = webSocketMessageReceived;

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
                    },
                    {
                        provide: WebsocketService,
                        useValue: mockWebSocketService
                    }
                ],
                declarations: [PollDetailsComponent, ResultBarComponent],
                imports: [AppRoutingModule, MatProgressSpinnerModule]
            }
        ).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(PollDetailsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeDefined();
    });

    it('should display', () => {
        const nativeElement = fixture.nativeElement;
        const { debugElement } = fixture;

        expect(nativeElement.querySelector('.details-container')).toBeTruthy();
        expect(nativeElement.querySelector('.title-container').innerText).toBe("Who's the best F1 Driver?")
        expect(nativeElement.querySelector('.votes-count-container').innerText).toBe("1 Votes - ")
        expect(nativeElement.querySelector('.text-container')).toBeTruthy();
        expect(nativeElement.querySelector('.text-container').innerText).toBe("Thanks for your Response.")
        expect(nativeElement.querySelector('.reload-button')).toBeNull();

        expect(nativeElement.querySelector('.result-bar')).toBeTruthy();
        const bars = debugElement.queryAll(By.css('.result-bar'));
        expect(bars.length).toBe(4)

        expect(nativeElement.querySelector('.votes-link')).toBeTruthy();
    });

    it('should NOT be able to vote', () => {
        const { debugElement } = fixture;

        let bars = debugElement.queryAll(By.css('.result-bar'));

        bars[0].nativeElement.dispatchEvent(new Event('click'));
        expect(mockPollService.vote).not.toHaveBeenCalled();
    });
});

describe('Getting Active Poll with no Vote', () => {

    beforeEach(waitForAsync(() => {
        mockPollService = jasmine.createSpyObj(PollService, ['getPollById', 'getActivePoll', 'vote']);
        mockWebSocketService = jasmine.createSpyObj(WebsocketService, ["connect", "closeConnection"]);

        mockPollService.getActivePoll.and.returnValue(of(openPollNoVote));
        mockPollService.vote.and.callFake((pollId, choice) => {
            webSocketMessageReceived.next(new WebSocketMessage({
                pollId: pollId,
                choice: choice,
                message: 'newvote'
            }));
            return of(newVote);
        });

        mockWebSocketService.messageReceived = webSocketMessageReceived;

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
                    },
                    {
                        provide: WebsocketService,
                        useValue: mockWebSocketService
                    }
                ],
                declarations: [PollDetailsComponent, ResultBarComponent],
                imports: [AppRoutingModule, MatProgressSpinnerModule]
            }
        ).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(PollDetailsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeDefined();
    });

    it('should display', () => {
        const nativeElement = fixture.nativeElement;
        const { debugElement } = fixture;

        expect(nativeElement.querySelector('.details-container')).toBeTruthy();
        expect(nativeElement.querySelector('.title-container').innerText).toBe("Who's the best F1 Driver?")
        expect(nativeElement.querySelector('.votes-count-container').innerText).toBe("0 Votes - ")
        expect(nativeElement.querySelector('.text-container')).toBeTruthy();
        expect(nativeElement.querySelector('.text-container').innerText).toBe("Cast your vote now!")
        expect(nativeElement.querySelector('.reload-button')).toBeNull();

        expect(nativeElement.querySelector('.result-bar')).toBeTruthy();
        const bars = debugElement.queryAll(By.css('.result-bar'));
        expect(bars.length).toBe(4)

        expect(nativeElement.querySelector('.votes-link')).toBeNull();
    });

    it('should be able to vote', () => {
        const nativeElement = fixture.nativeElement;
        const { debugElement } = fixture;

        expect(nativeElement.querySelector('.details-container')).toBeTruthy();
        expect(nativeElement.querySelector('.title-container').innerText).toBe("Who's the best F1 Driver?")
        expect(nativeElement.querySelector('.votes-count-container').innerText).toBe("0 Votes - ")
        expect(nativeElement.querySelector('.text-container')).toBeTruthy();
        expect(nativeElement.querySelector('.text-container').innerText).toBe("Cast your vote now!")
        expect(nativeElement.querySelector('.reload-button')).toBeNull();

        expect(nativeElement.querySelector('.result-bar')).toBeTruthy();
        let bars = debugElement.queryAll(By.css('.result-bar'));
        expect(bars.length).toBe(4)

        expect(nativeElement.querySelector('.votes-link')).toBeNull();

        bars[0].nativeElement.dispatchEvent(new Event('click'));
        expect(mockPollService.vote).toHaveBeenCalled();

        fixture.detectChanges();

        expect(nativeElement.querySelector('.votes-count-container').innerText).toBe("1 Votes - ")
        expect(nativeElement.querySelector('.text-container').innerText).toBe("Thanks for your Response.")
        expect(nativeElement.querySelector('.votes-link')).toBeTruthy();
    });
});

describe('Getting Active Poll with no Vote', () => {

    beforeEach(waitForAsync(() => {
        mockPollService = jasmine.createSpyObj(PollService, ['getPollById', 'getActivePoll', 'vote']);
        mockWebSocketService = jasmine.createSpyObj(WebsocketService, ["connect", "closeConnection"]);

        mockPollService.getActivePoll.and.returnValue(of(openPollVote));

        mockWebSocketService.messageReceived = webSocketMessageReceived;

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
                    },
                    {
                        provide: WebsocketService,
                        useValue: mockWebSocketService
                    }
                ],
                declarations: [PollDetailsComponent, ResultBarComponent],
                imports: [AppRoutingModule, MatProgressSpinnerModule]
            }
        ).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(PollDetailsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeDefined();
    });

    it('should display', () => {
        const nativeElement = fixture.nativeElement;
        const { debugElement } = fixture;

        expect(nativeElement.querySelector('.details-container')).toBeTruthy();
        expect(nativeElement.querySelector('.title-container').innerText).toBe("Who's the best F1 Driver?")
        expect(nativeElement.querySelector('.votes-count-container').innerText).toBe("1 Votes - ")
        expect(nativeElement.querySelector('.text-container')).toBeTruthy();
        expect(nativeElement.querySelector('.text-container').innerText).toBe("Thanks for your Response.")
        expect(nativeElement.querySelector('.reload-button')).toBeNull();

        expect(nativeElement.querySelector('.result-bar')).toBeTruthy();
        const bars = debugElement.queryAll(By.css('.result-bar'));
        expect(bars.length).toBe(4)

        expect(nativeElement.querySelector('.votes-link')).toBeTruthy();
    });

    it('should NOT be able to vote', () => {
        const { debugElement } = fixture;

        let bars = debugElement.queryAll(By.css('.result-bar'));

        bars[0].nativeElement.dispatchEvent(new Event('click'));
        expect(mockPollService.vote).not.toHaveBeenCalled();
    });
});

describe('New Poll is Created when looking at Open Poll with no Vote', () => {

    beforeEach(waitForAsync(() => {
        mockPollService = jasmine.createSpyObj(PollService, ['getPollById', 'getActivePoll', 'vote']);
        mockWebSocketService = jasmine.createSpyObj(WebsocketService, ["connect", "closeConnection"]);

        mockPollService.getPollById.withArgs("1234").and.returnValue(of(openPollNoVote));

        mockWebSocketService.messageReceived = webSocketMessageReceived;

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
                    },
                    {
                        provide: WebsocketService,
                        useValue: mockWebSocketService
                    }
                ],
                declarations: [PollDetailsComponent, ResultBarComponent],
                imports: [AppRoutingModule, MatProgressSpinnerModule]
            }
        ).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(PollDetailsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeDefined();
    });

    it('new poll created forces update', () => {
        const nativeElement = fixture.nativeElement;
        const { debugElement } = fixture;

        expect(nativeElement.querySelector('.details-container')).toBeTruthy();
        expect(nativeElement.querySelector('.title-container').innerText).toBe("Who's the best F1 Driver?")
        expect(nativeElement.querySelector('.votes-count-container').innerText).toBe("0 Votes - ")
        expect(nativeElement.querySelector('.text-container')).toBeTruthy();
        expect(nativeElement.querySelector('.text-container').innerText).toBe("Cast your vote now!")
        expect(nativeElement.querySelector('.reload-button')).toBeNull();

        expect(nativeElement.querySelector('.result-bar')).toBeTruthy();
        let bars = debugElement.queryAll(By.css('.result-bar'));
        expect(bars.length).toBe(4)

        expect(nativeElement.querySelector('.progress-bar')).toBeNull();

        expect(nativeElement.querySelector('.votes-link')).toBeNull();

        webSocketMessageReceived.next(new WebSocketMessage({
            pollId: '9876',
            message: 'newpoll'
        }));

        fixture.detectChanges();

        expect(nativeElement.querySelector('.text-container').innerText).toBe("This Poll has now Closed.")
        expect(nativeElement.querySelector('.progress-bar')).toBeTruthy();
        expect(nativeElement.querySelector('.reload-button')).toBeTruthy();
        expect(nativeElement.querySelector('.votes-link')).toBeTruthy();
    });
});

describe('New Poll is Created when looking at Open Poll with Vote', () => {

    beforeEach(waitForAsync(() => {
        mockPollService = jasmine.createSpyObj(PollService, ['getPollById', 'getActivePoll', 'vote']);
        mockWebSocketService = jasmine.createSpyObj(WebsocketService, ["connect", "closeConnection"]);

        mockPollService.getPollById.withArgs("1234").and.returnValue(of(openPollVote));

        mockWebSocketService.messageReceived = webSocketMessageReceived;

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
                    },
                    {
                        provide: WebsocketService,
                        useValue: mockWebSocketService
                    }
                ],
                declarations: [PollDetailsComponent, ResultBarComponent],
                imports: [AppRoutingModule, MatProgressSpinnerModule]
            }
        ).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(PollDetailsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeDefined();
    });

    it('new poll created forces update', () => {
        const nativeElement = fixture.nativeElement;
        const { debugElement } = fixture;

        expect(nativeElement.querySelector('.details-container')).toBeTruthy();
        expect(nativeElement.querySelector('.title-container').innerText).toBe("Who's the best F1 Driver?")
        expect(nativeElement.querySelector('.votes-count-container').innerText).toBe("1 Votes - ")
        expect(nativeElement.querySelector('.text-container')).toBeTruthy();
        expect(nativeElement.querySelector('.text-container').innerText).toBe("Thanks for your Response.")
        expect(nativeElement.querySelector('.reload-button')).toBeNull();

        expect(nativeElement.querySelector('.result-bar')).toBeTruthy();
        let bars = debugElement.queryAll(By.css('.result-bar'));
        expect(bars.length).toBe(4)

        expect(nativeElement.querySelector('.progress-bar')).toBeTruthy();

        expect(nativeElement.querySelector('.votes-link')).toBeTruthy();

        webSocketMessageReceived.next(new WebSocketMessage({
            pollId: '9876',
            message: 'newpoll'
        }));

        fixture.detectChanges();

        expect(nativeElement.querySelector('.text-container').innerText).toBe("Thanks for your Response, this Poll has now Closed.")
        expect(nativeElement.querySelector('.reload-button')).toBeTruthy();
    });
});