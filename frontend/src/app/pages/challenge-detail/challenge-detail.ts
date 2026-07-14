import { DatePipe } from '@angular/common';
import { Component, inject, type OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastService } from '../../components/toast/toast.service';
import { ApiService, type AttemptHistory, type AttemptResult, type Challenge } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-challenge-detail',
  templateUrl: './challenge-detail.html',
  styleUrls: ['./challenge-detail.css'],
  imports: [RouterLink, FormsModule, DatePipe],
})
export class ChallengeDetailPage implements OnInit
{
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly api = inject(ApiService);
  readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);

  readonly challenge = signal<Challenge | null>(null);
  readonly loading = signal(true);
  readonly error = signal('');

  readonly regexInput = signal('');
  readonly guessing = signal(false);
  readonly result = signal<AttemptResult | null>(null);
  readonly guessError = signal('');

  readonly attempts = signal<AttemptHistory[]>([]);
  readonly loadingHistory = signal(false);

  ngOnInit(): void
  {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id)
    {
      this.error.set('ID sfida mancante');
      this.loading.set(false);
      return;
    }
    this.api.getChallenge(id).subscribe({
      next: (data) =>
      {
        this.challenge.set(data);
        this.loading.set(false);
        if (this.auth.isAuthenticated())
        {
          this.loadAttempts(id);
        }
      },
      error: () =>
      {
        this.error.set('Sfida non trovata');
        this.loading.set(false);
      },
    });
  }

  private loadAttempts(challengeId: string): void
  {
    this.loadingHistory.set(true);
    this.api.getAttempts(challengeId).subscribe({
      next: (history) =>
      {
        this.attempts.set(history);
        this.loadingHistory.set(false);
      },
      error: () =>
      {
        this.loadingHistory.set(false);
      },
    });
  }

  isOwner(): boolean
  {
    const c = this.challenge();
    const user = this.auth.user();
    return !!(c && user && c.author.username === user.username);
  }

  isSolved(): boolean
  {
    return this.attempts().some((a) => a.isCorrect);
  }

  private validateGuessRegex(): string | null
  {
    const input = this.regexInput().trim();
    if (!input) return 'Inserisci una regex';
    try { new RegExp(input); }
    catch { return 'La regex inserita non è valida'; }
    return null;
  }

  submitGuess(): void
  {
    const c = this.challenge();
    if (!c)
    {
      this.guessError.set('Sfida non trovata');
      return;
    }
    if (this.isOwner())
    {
      this.guessError.set('Non puoi risolvere la tua stessa sfida!');
      return;
    }
    const validation = this.validateGuessRegex();
    if (validation)
    {
      this.guessError.set(validation);
      return;
    }
    this.guessing.set(true);
    this.result.set(null);
    this.guessError.set('');
    this.api.attemptChallenge(c.id, { proposedRegex: this.regexInput() }).subscribe({
      next: (r) =>
      {
        this.result.set(r);
        this.guessing.set(false);
        this.regexInput.set('');
        if (r.isCorrect)
        {
          this.toast.show('Complimenti! Hai risolto la sfida!', 'success', 5000);
        }
        this.loadAttempts(c.id);
        this.api.getChallenge(c.id).subscribe((data) => this.challenge.set(data));
      },
      error: (err: { error?: { message?: string } }) =>
      {
        this.guessError.set(err.error?.message || 'Errore nella validazione della regex');
        this.guessing.set(false);
      },
    });
  }

  deleteChallenge(): void
  {
    const c = this.challenge();
    if (!c) return;
    if (!confirm('Sei sicuro di voler eliminare questa sfida?')) return;
    this.api.deleteChallenge(c.id).subscribe({
      next: () =>
      {
        this.router.navigate(['/dashboard']);
      },
      error: () =>
      {
        this.error.set('Errore nell\'eliminazione della sfida');
      },
    });
  }
}
