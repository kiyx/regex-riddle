import { computed, Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { switchMap, tap } from 'rxjs';
import { ApiService } from './api.service';

export interface User
{
  username: string;
  email: string;
  avatar: string | null;
}

interface AuthState
{
  token: string | null;
  user: User | null;
}

const STORAGE_KEY = 'regexriddle_auth';

@Injectable({ providedIn: 'root' })
export class AuthService
{
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private readonly state = signal<AuthState>(this.loadState());

  readonly token = computed(() => this.state().token);
  readonly user = computed(() => this.state().user);
  readonly isAuthenticated = computed(() => !!this.state().token);

  private loadState(): AuthState
  {
    try
    {
      const raw = localStorage.getItem(STORAGE_KEY);
      if(!raw)
        return { token: null, user: null };
      const parsed = JSON.parse(raw);
      if(!parsed?.token)
        return { token: null, user: null };
      return { token: parsed.token, user: parsed.user ?? null };
    }
    catch
    {
      return { token: null, user: null };
    }
  }

  private persist(): void
  {
    const { token, user } = this.state();
    if(token)
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user }));
    else
      localStorage.removeItem(STORAGE_KEY);
  }

  login(username: string, password: string)
  {
    return this.api.login({ username, password }).pipe(
      tap((res) =>
      {
        this.state.set({
          token: res.token,
          user: { ...res.user, avatar: null },
        });
        this.persist();
      }),
    );
  }

  signup(username: string, email: string, password: string, confirmPassword: string)
  {
    return this.api.signup({ username, email, password, confirmPassword }).pipe(
      switchMap(() => this.api.login({ username, password })),
      tap((res) =>
      {
        this.state.set
        ({
          token: res.token,
          user: { ...res.user, avatar: null },
        });
        this.persist();
      }),
    );
  }

  setUser(user: User): void
  {
    this.state.update((s) => ({ ...s, user }));
    this.persist();
  }

  refreshUser()
  {
    return this.api.getProfile().pipe(
      tap((profile) =>
      {
        this.setUser
        ({
          username: profile.username,
          email: profile.email,
          avatar: this.api.getAvatarUrl(profile.avatar),
        });
      }),
    );
  }

  logout(): void
  {
    this.state.set({ token: null, user: null });
    this.persist();
    this.router.navigate(['/']);
  }
}
