import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-box',
  templateUrl: './box.component.html',
  styleUrl: './box.component.scss',
})
export class BoxComponent {
  @Input() selected: boolean = false;
  @Input() line1: string = '';
  @Input() line2: string | null = null;
  @Input() line3: string | null = null;
}
