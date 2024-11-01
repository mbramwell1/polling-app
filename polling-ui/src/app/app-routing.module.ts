import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PollDetailsComponent } from './components/poll-details/poll-details.component';
import { PollVotesComponent } from './components/poll-votes/poll-votes.component';

const routes: Routes = [
  {
    path: 'poll',
    children: [
      {
        path: ':id/votes',
        component: PollVotesComponent,
      },
      {
        path: ':id',
        component: PollDetailsComponent,
      },
    ],
  },
  {
    path: 'votes',
    component: PollVotesComponent,
  },
  {
    path: '',
    component: PollDetailsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
