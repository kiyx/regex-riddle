import { DatePipe } from '@angular/common';
import { Component, inject, type OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../components/toast/toast.service';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.html',
  styleUrls: ['./profile.css'],
  imports: [RouterLink, FormsModule, DatePipe],
})
export class ProfilePage implements OnInit
{
  private readonly api = inject(ApiService);
  readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly username = signal('');
  readonly email = signal('');
  readonly avatar = signal<string | null>(null);
  readonly createdAt = signal('');
  readonly error = signal('');
  readonly success = signal('');
  readonly uploading = signal(false);

  readonly showPassword = signal(false);
  readonly oldPassword = signal('');
  readonly newPassword = signal('');
  readonly confirmPassword = signal('');
  readonly showOldPassword = signal(false);
  readonly showNewPassword = signal(false);
  readonly showConfirmPassword = signal(false);
  readonly passwordError = signal('');
  readonly passwordSuccess = signal('');
  readonly savingPassword = signal(false);

  ngOnInit(): void
  {
    this.api.getProfile().subscribe({
      next: (profile) =>
      {
        this.username.set(profile.username);
        this.email.set(profile.email);
        this.avatar.set(this.api.getAvatarUrl(profile.avatar));
        this.createdAt.set(profile.createdAt);
        this.auth.setUser({
          username: profile.username,
          email: profile.email,
          avatar: this.api.getAvatarUrl(profile.avatar),
        });
        this.loading.set(false);
      },
      error: () =>
      {
        this.error.set('Impossibile caricare il profilo');
        this.loading.set(false);
      },
    });
  }

  getInitial(): string
  {
    return this.username().charAt(0).toUpperCase() || '?';
  }

  saveProfile(): void
  {
    if (!this.username().trim())
    {
      this.error.set('Username obbligatorio');
      return;
    }
    this.saving.set(true);
    this.error.set('');
    this.success.set('');

    this.api.updateProfile({ username: this.username().trim(), email: this.email().trim() || undefined }).subscribe({
      next: (profile) =>
      {
        this.auth.setUser({
          username: profile.username,
          email: profile.email,
          avatar: this.api.getAvatarUrl(profile.avatar),
        });
        this.username.set(profile.username);
        this.email.set(profile.email);
        this.success.set('Profilo aggiornato con successo!');
        this.toast.show('Profilo aggiornato!', 'success');
        this.saving.set(false);
        setTimeout(() => this.success.set(''), 3000);
      },
      error: (err: { error?: { error?: string } }) =>
      {
        const msg = err.error?.error || 'Errore nel salvataggio del profilo';
        this.error.set(msg);
        this.toast.show(msg, 'error');
        this.saving.set(false);
      },
    });
  }

  onAvatarSelected(event: Event): void
  {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.uploading.set(true);
    this.error.set('');
    this.success.set('');

    this.api.uploadAvatar(file).subscribe({
      next: (res) =>
      {
        this.avatar.set(this.api.getAvatarUrl(res.avatar));
        const u = this.auth.user();
        if (u)
        {
          this.auth.setUser({ ...u, avatar: this.api.getAvatarUrl(res.avatar) });
        }
        this.uploading.set(false);
        this.success.set('Avatar aggiornato!');
        this.toast.show('Avatar aggiornato!', 'success');
        setTimeout(() => this.success.set(''), 3000);
      },
      error: (err: { error?: { message?: string } }) =>
      {
        const msg = err.error?.message || 'Errore nel caricamento dell\'avatar';
        this.error.set(msg);
        this.toast.show(msg, 'error');
        this.uploading.set(false);
      },
    });
  }

  changePassword(): void
  {
    if (!this.oldPassword() || !this.newPassword() || !this.confirmPassword())
    {
      this.passwordError.set('Tutti i campi sono obbligatori');
      return;
    }
    if (this.newPassword().length < 8)
    {
      this.passwordError.set('La nuova password deve essere di almeno 8 caratteri');
      return;
    }
    if (this.newPassword() !== this.confirmPassword())
    {
      this.passwordError.set('Le nuove password non coincidono');
      return;
    }
    this.savingPassword.set(true);
    this.passwordError.set('');
    this.passwordSuccess.set('');

    this.api.changePassword({
      oldPassword: this.oldPassword(),
      newPassword: this.newPassword(),
      confirmPassword: this.confirmPassword(),
    }).subscribe({
      next: () =>
      {
        this.passwordSuccess.set('Password aggiornata con successo!');
        this.toast.show('Password aggiornata!', 'success');
        this.oldPassword.set('');
        this.newPassword.set('');
        this.confirmPassword.set('');
        this.savingPassword.set(false);
        setTimeout(() => this.passwordSuccess.set(''), 3000);
      },
      error: (err: { error?: { message?: string } }) =>
      {
        const msg = err.error?.message || 'Errore nel cambio password';
        this.passwordError.set(msg);
        this.toast.show(msg, 'error');
        this.savingPassword.set(false);
      },
    });
  }
}
