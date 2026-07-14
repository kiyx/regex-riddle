import type { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    title: 'Regex Riddle — L\'arte dell\'enigma testuale',
    loadComponent: () => import('./pages/home/home').then(m => m.HomePage),
  },
  {
    path: 'how-to-play',
    title: 'Come si gioca — Regex Riddle',
    loadComponent: () => import('./pages/how-to-play/how-to-play').then(m => m.HowToPlayPage),
  },
  {
    path: 'login',
    title: 'Accedi — Regex Riddle',
    loadComponent: () => import('./pages/auth/login/login').then(m => m.LoginPage),
  },
  {
    path: 'signup',
    title: 'Registrati — Regex Riddle',
    loadComponent: () => import('./pages/auth/signup/signup').then(m => m.SignupPage),
  },
  {
    path: 'dashboard',
    title: 'Bacheca — Regex Riddle',
    loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.DashboardPage),
    canActivate: [authGuard],
  },
  {
    path: 'challenges/create',
    title: 'Nuova Sfida — Regex Riddle',
    loadComponent: () => import('./pages/challenge-create/challenge-create').then(m => m.ChallengeCreatePage),
    canActivate: [authGuard],
  },
  {
    path: 'challenges/:id',
    title: 'Sfida — Regex Riddle',
    loadComponent: () => import('./pages/challenge-detail/challenge-detail').then(m => m.ChallengeDetailPage),
  },
  {
    path: 'leaderboard',
    title: 'Classifica — Regex Riddle',
    loadComponent: () => import('./pages/leaderboard/leaderboard').then(m => m.LeaderboardPage),
  },
  {
    path: 'profile',
    title: 'Profilo — Regex Riddle',
    loadComponent: () => import('./pages/profile/profile').then(m => m.ProfilePage),
    canActivate: [authGuard],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
