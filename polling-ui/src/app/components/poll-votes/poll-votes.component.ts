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

  totalPages: number = 0;
  votesPageSize: number = 7;
  currentVotesPageNumber: number = 0;

  constructor(private route: ActivatedRoute, private pollService: PollService) {
    this.pollId = this.route.snapshot.paramMap.get('id');
    if (this.pollId !== null) {
      this.getVotes(this.pollId);
    } else {
      this.getVotes('active');
    }
  };

  public nextPage(): void {
    if (this.currentVotesPageNumber < this.totalPages - 1) {
      this.currentVotesPageNumber = this.currentVotesPageNumber + 1;
      if (this.pollId !== null) {
        this.getVotes(this.pollId);
      } else {
        this.getVotes('active');
      }
    }
  }

  public previousPage(): void {
    if (this.currentVotesPageNumber !== 0) {
      this.currentVotesPageNumber = this.currentVotesPageNumber - 1;
      if (this.pollId !== null) {
        this.getVotes(this.pollId);
      } else {
        this.getVotes('active');
      }
    }
  }

  public getBackLink(): string {
    if(this.pollId) {
      return '/poll/' + this.pollId;
    } else {
      return '/';
    }
  }

  public getVotes(pollId: string): void {
    this.votes = [];
    this.pollService.getVotesForPoll(pollId, this.currentVotesPageNumber, this.votesPageSize).subscribe(response => {
      this.totalPages = +response.headers.get("pages")!;
      this.votes = response.body!;
    });
  }
}
