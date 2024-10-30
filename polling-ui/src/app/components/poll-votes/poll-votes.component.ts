import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { PollService } from '../../service/poll.service';
import { WebsocketService } from '../../service/websocket.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Poll } from '../../model/poll';
import { Vote } from '../../model/vote';
import { WebSocketMessage } from '../../model/websocket-message';

@Component({
  selector: 'app-poll-votes',
  templateUrl: './poll-votes.component.html',
  styleUrl: './poll-votes.component.scss'
})
export class PollVotesComponent {
  votes: Vote[] = [];
  pollId: string | null = null;

  constructor(private route: ActivatedRoute, private pollService: PollService) {
    this.pollId = this.route.snapshot.paramMap.get('id');
    if (this.pollId !== null) {
      this.pollService.getVotesForPoll(this.pollId).subscribe(votes => {
        this.votes = votes;
      });
    } else {
      this.pollService.getVotesForPoll('active').subscribe(votes => {
        this.votes = votes;
      });
    }
  };

  public getBackLink(): string {
    if(this.pollId) {
      return '/poll/' + this.pollId;
    } else {
      return '/';
    }
  }
}
