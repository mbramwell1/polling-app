import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { provideHttpClient } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PollDetailsComponent } from './components/poll-details/poll-details.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { MatButtonModule } from '@angular/material/button';
import { PollService } from './service/poll.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ResultBarComponent } from './components/result-bar/result-bar.component';
import { PollVotesComponent } from './components/poll-votes/poll-votes.component';
import { VoteBoxComponent } from './components/vote-box/vote-box.component';


@NgModule({
  declarations: [
    AppComponent,
    PollDetailsComponent,
    PollVotesComponent,
    ResultBarComponent,
    VoteBoxComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  providers: [
    provideHttpClient(), 
    provideAnimationsAsync(), 
    PollService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
