import { Component, inject } from '@angular/core';
import { PollService } from '../../service/poll.service';
import { ActivatedRoute } from '@angular/router';
import { Vote } from '../../model/vote';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-poll-votes',
  templateUrl: './poll-votes.component.html',
  styleUrl: './poll-votes.component.scss',
})
export class PollVotesComponent {
  private _snackBar = inject(MatSnackBar);

  votes: Vote[] | null = null;
  pollId: string | null = null;

  totalElements: number = 0;
  totalPages: number = 0;
  votesPageSize: number = 7;
  currentVotesPageNumber: number = 0;

  errorMessage: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private pollService: PollService,
  ) {
    this.pollId = this.route.snapshot.paramMap.get('id');
    if (this.pollId !== null) {
      this.getVotes(this.pollId);
    } else {
      this.getVotes('active');
    }
  }

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

  public handlePageEvent(event: any): void {
    this.currentVotesPageNumber = event.pageIndex;
    if (this.pollId !== null) {
      this.getVotes(this.pollId);
    } else {
      this.getVotes('active');
    }
  }

  public getBackLink(): string {
    if (this.pollId) {
      return '/poll/' + this.pollId;
    } else {
      return '/';
    }
  }

  public getVotes(pollId: string): void {
    this.pollService
      .getVotesForPoll(pollId, this.currentVotesPageNumber, this.votesPageSize)
      .subscribe({
        next: (response) => {
          this.totalPages = +response.headers.get('pages')!;
          this.totalElements = +response.headers.get('total')!;
          this.votes = response.body!;
        },
        error: (error) => {
          if (error.status === 404) {
            if (pollId === 'active') {
              this.errorMessage =
                "We don't have an Active Poll right now. Please try again later.";
            } else {
              this.errorMessage = 'Poll Not Found';
            }
          } else {
            if (this.votes !== null) {
              this._snackBar.open(
                'An Error has Occurred. Please try again later.',
                'Ok',
              );
            } else {
              this.errorMessage =
                'An Error has Occurred. Please try again later.';
            }
          }
        },
      });
  }
}
