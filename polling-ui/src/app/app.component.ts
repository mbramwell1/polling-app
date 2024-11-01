import { Component, ViewChild } from '@angular/core';
import { Poll } from './model/poll';
import { PollService } from './service/poll.service';
import { MatSidenav } from '@angular/material/sidenav';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'polling-ui';

  @ViewChild('sideNav') sideNav: MatSidenav | undefined;

  sideNavOpen: boolean = false;
  pastPolls: Poll[] = [];

  totalElements: number = 0;
  totalPages: number = 0;
  pastPollPageSize: number = 8;
  currentPastPollPage: number = 0;

  constructor(private pollService: PollService) {}

  public toggleSideNav(): void {
    this.totalPages = 0;
    this.currentPastPollPage = 0;
    if (this.sideNavOpen) {
      this.sideNavOpen = false;
    } else {
      this.getPolls(true);
    }
  }

  public handlePageEvent(event: any): void {
    this.currentPastPollPage = event.pageIndex;
    this.getPolls(false);
  }

  public getPolls(openNav: boolean): void {
    this.pastPolls = [];
    this.pollService
      .getPollsByPage(this.currentPastPollPage, this.pastPollPageSize)
      .subscribe((response) => {
        this.totalPages = +response.headers.get('pages')!;
        this.totalElements = +response.headers.get('total')!;
        response.body!.forEach((poll) => {
          this.pastPolls.push(new Poll(poll));
        });
        if (openNav) {
          this.sideNavOpen = true;
        }
      });
  }

  public getVotePlaced(votePlaced: string | null): string | null {
    if (votePlaced !== null) {
      return `Your Vote: ${votePlaced}`;
    } else {
      return null;
    }
  }

  public loadPoll(poll: Poll): void {
    if (poll.active) {
      window.location.href = `/`;
    } else {
      window.location.href = `/poll/${poll.id}`;
    }
  }
}
