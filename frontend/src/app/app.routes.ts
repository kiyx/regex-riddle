import type { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then(m => m.HomePage),
  },
  {
    path: 'how-to-play',
    loadComponent: () => import('./pages/how-to-play/how-to-play').then(m => m.HowToPlayPage),
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/login/login').then(m => m.LoginPage),
  },
  {
    path: 'signup',
    loadComponent: () => import('./pages/auth/signup/signup').then(m => m.SignupPage),
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.DashboardPage),
    canActivate: [authGuard],
  },
  {
    path: 'challenges/create',
    loadComponent: () => import('./pages/challenge-create/challenge-create').then(m => m.ChallengeCreatePage),
    canActivate: [authGuard],
  },
  {
    path: 'challenges/:id',
    loadComponent: () => import('./pages/challenge-detail/challenge-detail').then(m => m.ChallengeDetailPage),
  },
  {
    path: 'leaderboard',
    loadComponent: () => import('./pages/leaderboard/leaderboard').then(m => m.LeaderboardPage),
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile').then(m => m.ProfilePage),
    canActivate: [authGuard],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
