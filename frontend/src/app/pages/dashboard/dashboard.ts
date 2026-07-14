import { Component, inject, type OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService, type Challenge, type PaginatedResult } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
  imports: [RouterLink],
})
export class DashboardPage implements OnInit
{
  readonly auth = inject(AuthService);
  readonly api = inject(ApiService);
  readonly challenges = signal<Challenge[]>([]);
  readonly solvedIds = signal<string[]>([]);
  readonly loading = signal(true);
  readonly filter = signal<'all' | 'unsolved' | 'mine'>('all');
  readonly page = signal(1);
  readonly totalPages = signal(1);
  readonly total = signal(0);

  ngOnInit(): void
  {
    this.loadData();
    this.api.getSolvedIds().subscribe({
      next: (ids) => this.solvedIds.set(ids),
    });
  }

  loadData(): void
  {
    this.loading.set(true);
    const currentPage = this.page();
    const f = this.filter();

    const handleResult = (res: PaginatedResult<Challenge>) => {
      this.challenges.set(res.data);
      this.totalPages.set(res.totalPages);
      this.total.set(res.total);
      this.loading.set(false);
    };

    const handleError = () => this.loading.set(false);

    if (f === 'mine')
    {
      this.api.getMyChallenges({ page: currentPage, limit: 12 }).subscribe({
        next: handleResult,
        error: handleError,
      });
    }
    else if (f === 'unsolved')
    {
      this.api.getUnsolvedChallenges({ page: currentPage, limit: 12 }).subscribe({
        next: handleResult,
        error: handleError,
      });
    }
    else
    {
      this.api.getChallenges({ page: currentPage, limit: 12 }).subscribe({
        next: handleResult,
        error: handleError,
      });
    }
  }

  getAvatarUrl(avatar: string | null): string | null
  {
    return this.api.getAvatarUrl(avatar);
  }

  solvedCount(): number
  {
    return this.solvedIds().length;
  }

  setFilter(f: 'all' | 'unsolved' | 'mine'): void
  {
    this.filter.set(f);
    this.page.set(1);
    this.loadData();
  }

  goToPage(p: number): void
  {
    if (p < 1 || p > this.totalPages()) return;
    this.page.set(p);
    this.loadData();
  }
}
