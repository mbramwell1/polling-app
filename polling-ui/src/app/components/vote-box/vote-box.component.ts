import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Vote } from '../../model/vote';

@Component({
  selector: 'app-vote-box',
  templateUrl: './vote-box.component.html',
  styleUrl: './vote-box.component.scss'
})
export class VoteBoxComponent {
  @Input() vote: Vote = {} as Vote;
}
