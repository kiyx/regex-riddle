import { DecimalPipe } from '@angular/common';
import { Component, inject, type OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService, type LeaderboardEntry, type PaginatedResult } from '../../services/api.service';

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.html',
  styleUrls: ['./leaderboard.css'],
  imports: [RouterLink, DecimalPipe],
})
export class LeaderboardPage implements OnInit
{
  private readonly api = inject(ApiService);
  readonly entries = signal<LeaderboardEntry[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly page = signal(1);
  readonly limit = signal(20);
  readonly totalPages = signal(1);
  readonly total = signal(0);

  ngOnInit(): void
  {
    this.loadData();
  }

  loadData(): void
  {
    this.loading.set(true);
    this.api.getLeaderboard({ page: this.page(), limit: this.limit() }).subscribe({
      next: (res: PaginatedResult<LeaderboardEntry>) =>
      {
        this.entries.set(res.data);
        this.totalPages.set(res.totalPages);
        this.total.set(res.total);
        this.loading.set(false);
      },
      error: () =>
      {
        this.error.set('Impossibile caricare la classifica');
        this.loading.set(false);
      },
    });
  }

  goToPage(p: number): void
  {
    if (p < 1 || p > this.totalPages()) return;
    this.page.set(p);
    this.loadData();
  }

  globalRank(index: number): number
  {
    return (this.page() - 1) * this.limit() + index + 1;
  }

  getAvatarUrl(avatar: string | null): string | null
  {
    return this.api.getAvatarUrl(avatar);
  }
}
