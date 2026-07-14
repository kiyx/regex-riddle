import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ToastComponent } from './components/toast/toast';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ToastComponent],
})
export class AppComponent
{
  private readonly authService = inject(AuthService);

  readonly mobileMenuOpen = signal(false);
  readonly currentYear = new Date().getFullYear();

  get auth(): AuthService
  {
    return this.authService;
  }

  toggleMobileMenu(): void
  {
    this.mobileMenuOpen.update((v) => !v);
  }

  closeMobileMenu(): void
  {
    this.mobileMenuOpen.set(false);
  }

  logout(): void
  {
    this.authService.logout();
    this.closeMobileMenu();
  }
}
