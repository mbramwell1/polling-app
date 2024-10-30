import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-result-bar',
  templateUrl: './result-bar.component.html',
  styleUrl: './result-bar.component.scss'
})
export class ResultBarComponent {
  @Input() option: string = "";
  @Input() votePlaced: string | null = null;
  @Input() votePercentage: number = 0;
  @Input() pollActive: boolean = false;
  @Output() voteClicked = new EventEmitter<string>();

  public vote() {
    this.voteClicked.emit(this.option);
  }
}
