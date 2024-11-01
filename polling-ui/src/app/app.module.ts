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
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatPaginatorModule } from '@angular/material/paginator';
import { ResultBarComponent } from './components/result-bar/result-bar.component';
import { PollVotesComponent } from './components/poll-votes/poll-votes.component';
import { BoxComponent } from './components/box/box.component';

@NgModule({
  declarations: [
    AppComponent,
    PollDetailsComponent,
    PollVotesComponent,
    ResultBarComponent,
    BoxComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSidenavModule,
    MatPaginatorModule,
  ],
  providers: [provideHttpClient(), provideAnimationsAsync(), PollService],
  bootstrap: [AppComponent],
})
export class AppModule {}
