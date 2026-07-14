import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
  imports: [FormsModule, RouterLink],
})
export class LoginPage
{
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly username = signal('');
  readonly password = signal('');
  readonly showPassword = signal(false);
  readonly error = signal('');
  readonly loading = signal(false);

  constructor()
  {
    if (this.auth.isAuthenticated())
      this.router.navigate(['/dashboard']);
  }

  onSubmit(): void
  {
    this.error.set('');
    this.loading.set(true);
    this.auth.login(this.username().trim(), this.password()).subscribe({
      next: () =>
      {
        this.router.navigate(['/dashboard']);
      },
      error: (err: { error?: { error?: string } }) =>
      {
        this.error.set(this.cleanError(err?.error?.error) || 'Credenziali non valide');
        this.loading.set(false);
      },
    });
  }

  private cleanError(msg?: string): string | undefined
  {
    if(!msg)
      return undefined;
    return msg.replace(/^(username|password|email)\s*:\s*/i, '').trim();
  }
}
