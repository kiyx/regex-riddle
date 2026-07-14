import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.html',
  styleUrls: ['../login/login.css'],
  imports: [FormsModule, RouterLink],
})
export class SignupPage
{
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly username = signal('');
  readonly email = signal('');
  readonly password = signal('');
  readonly confirmPassword = signal('');
  readonly showPassword = signal(false);
  readonly showConfirmPassword = signal(false);
  readonly error = signal('');
  readonly loading = signal(false);

  constructor()
  {
    if (this.auth.isAuthenticated())
      this.router.navigate(['/dashboard']);
  }

  onSubmit(): void
  {
    const username = this.username().trim().toLowerCase();
    const email = this.email().trim().toLowerCase();
    const password = this.password();
    const confirmPassword = this.confirmPassword();

    if (username.length < 4)
    {
      this.error.set('Lo username deve avere almeno 4 caratteri');
      return;
    }
    if (username.length > 20)
    {
      this.error.set('Lo username non può superare i 20 caratteri');
      return;
    }
    if (!email)
    {
      this.error.set('Email obbligatoria');
      return;
    }
    if (password.length < 8)
    {
      this.error.set('La password deve essere di almeno 8 caratteri');
      return;
    }
    if (password !== confirmPassword)
    {
      this.error.set('Le password non coincidono');
      return;
    }

    this.error.set('');
    this.loading.set(true);
    this.auth.signup(username, email, password, confirmPassword).subscribe({
      next: () =>
      {
        this.router.navigate(['/dashboard']);
      },
      error: (err: { error?: { error?: string } }) =>
      {
        this.error.set(this.cleanError(err?.error?.error) || 'Registrazione fallita');
        this.loading.set(false);
      },
    });
  }

  private cleanError(msg?: string): string | undefined
  {
    if (!msg) return undefined;
    return msg.replace(/^(username|password|email|confirmPassword)\s*:\s*/i, '').trim();
  }
}
