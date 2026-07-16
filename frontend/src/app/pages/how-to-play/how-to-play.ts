import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-how-to-play',
  templateUrl: './how-to-play.html',
  styleUrls: ['./how-to-play.css'],
})
export class HowToPlayPage
{
  readonly activeTab = signal(0);

  setTab(i: number): void
  {
    this.activeTab.set(i);
  }
}
