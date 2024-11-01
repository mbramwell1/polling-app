import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { PollService } from '../../service/poll.service';
import { WebsocketService } from '../../service/websocket.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Poll } from '../../model/poll';
import { WebSocketMessage } from '../../model/websocket-message';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-poll-details',
  templateUrl: './poll-details.component.html',
  styleUrl: './poll-details.component.scss',
})
export class PollDetailsComponent {
  private _snackBar = inject(MatSnackBar);

  @Input() poll = {} as Poll;
  routePollId: string | null = null;

  options: string[] = [];

  errorMessage: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private pollService: PollService,
    private websocketService: WebsocketService,
  ) {
    this.routePollId = this.route.snapshot.paramMap.get('id');
    if (this.routePollId) {
      this.pollService.getPollById(this.routePollId).subscribe({
        next: (response) => this.setPoll(response.body!),
        error: (error) => {
          if (error.status === 404) {
            this.errorMessage = 'Poll Not Found';
          } else {
            this.errorMessage =
              'An Error has Occurred. Please try again later.';
          }
        },
      });
    } else {
      this.pollService.getActivePoll().subscribe({
        next: (response) => this.setPoll(response.body!),
        error: (error) => {
          if (error.status === 404) {
            this.errorMessage =
              "We don't have an Active Poll right now. Please try again later.";
          } else {
            this.errorMessage =
              'An Error has Occurred. Please try again later.';
          }
        },
      });
    }
  }

  ngOnInit(): void {
    this.websocketService.messageReceived.subscribe(
      (websocketMessage: WebSocketMessage) => {
        if (websocketMessage.message === 'newvote' && this.poll.active) {
          let votes: number | undefined = this.poll.options.get(
            websocketMessage.choice,
          );

          let newVotes;
          if (votes !== undefined) {
            newVotes = votes + 1;
            this.poll.options.set(websocketMessage.choice, newVotes);
          } else {
            console.log(
              'Invalid Vote received for Poll - ' +
                JSON.stringify(websocketMessage),
            );
          }
        } else if (websocketMessage.message === 'newpoll' && this.poll.active) {
          this.poll.active = false;
          this.websocketService.closeConnection();
        }
      },
    );
  }

  private setPoll(poll: Poll): void {
    this.poll = new Poll(poll);
    this.options = Array.from(this.poll.options.keys());
    if (this.poll.active) {
      this.websocketService.connect();
    }
  }

  public vote(choice: string): void {
    if (this.poll.votePlaced === null && this.poll.active) {
      this.pollService.vote(this.poll.id, choice).subscribe({
        next: (response) => {
          this.poll.votePlaced = response.body!.choice;
        },
        error: () => {
          this.poll.votePlaced = null;
          this._snackBar.open(
            "We couldn't save your Vote. Please try again Later.",
            'Ok',
          );
        },
      });
    }
  }

  public calculatePercentage(option: string): number {
    let totalVotes: number = this.poll.getVotesSum();
    let thisVotes: number = this.poll.options.get(option)!;
    return Math.round((thisVotes! / totalVotes) * 100);
  }

  public getVotesLink(): string {
    if (this.routePollId || !this.poll.active) {
      return '/poll/' + this.poll.id + '/votes';
    } else {
      return '/votes';
    }
  }

  public loadLatestPoll(): void {
    window.location.href = '/';
  }
}
