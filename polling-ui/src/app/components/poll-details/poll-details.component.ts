import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { PollService } from '../../service/poll.service';
import { WebsocketService } from '../../service/websocket.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Poll } from '../../model/poll';
import { Vote } from '../../model/vote';
import { WebSocketMessage } from '../../model/websocket-message';

@Component({
  selector: 'app-poll-details',
  templateUrl: './poll-details.component.html',
  styleUrl: './poll-details.component.scss'
})
export class PollDetailsComponent {
  @Input() poll = {} as Poll;
  routePollId: string | null = null;

  options: string[] = [];
  votePlaced: string | null = null;

  constructor(private route: ActivatedRoute, private pollService: PollService, private websocketService: WebsocketService) {
    this.routePollId = this.route.snapshot.paramMap.get('id');
    if (this.routePollId) {
      this.pollService.getPollById(this.routePollId).subscribe(poll => this.setPoll(poll));
    } else {
      this.pollService.getActivePoll().subscribe(poll => this.setPoll(poll));
    }
  };

  ngOnInit(): void {
    this.websocketService.messageReceived.subscribe((websocketMessage: WebSocketMessage) => {
      let votes: number | undefined = this.poll.options.get(websocketMessage.choice);

      let newVotes;
      if (votes !== undefined) {
        newVotes = votes + 1;
        this.poll.options.set(websocketMessage.choice, newVotes);
      } else {
        console.log("Invalid Vote received for Poll - " + JSON.stringify(websocketMessage));
      }
    });
  }

  private setPoll(poll: Poll): void {
    this.poll = new Poll(poll);
    this.votePlaced = this.poll.votePlaced;
    this.options = Array.from(this.poll.options.keys());
    if(this.poll.active) {
      this.websocketService.connect(this.poll.id);
    }
  }

  public vote(choice: string): void {
    if (this.votePlaced === null && this.poll.active) {
      this.pollService.vote(this.poll.id, choice).subscribe(poll => {
        this.votePlaced = choice;
      });
    }
  }

  public getVotesSum(): number {
    return Array.from(this.poll.options.values()).reduce((acc, val) => acc + val, 0);
  }

  public calculatePercentage(option: string): number {
    let totalVotes: number = this.getVotesSum();
    let thisVotes: number = this.poll.options.get(option)!;
    return Math.round((thisVotes! / totalVotes) * 100);
  }

  public getVotesLink(): string {
    if (this.routePollId) {
      return '/poll/' + this.routePollId + '/votes';
    } else {
      return '/votes';
    }
  }
}
