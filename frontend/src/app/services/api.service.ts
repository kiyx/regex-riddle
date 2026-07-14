import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

const BASE = environment.apiUrl;

// ---- Auth ----

export interface AuthUser
{
  username: string;
  email: string;
}

export interface LoginPayload
{
  username: string;
  password: string;
}

export interface LoginResponse
{
  token: string;
  user: AuthUser;
}

export interface RegisterPayload
{
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface RegisterResponse
{
  username: string;
  email: string;
}

export interface ChangePasswordPayload
{
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// ---- User / Profile ----

export interface UserProfile
{
  username: string;
  email: string;
  avatar: string | null;
  createdAt: string;
}

export interface UpdateProfilePayload
{
  username?: string;
  email?: string | undefined;
}

export interface AvatarResponse
{
  avatar: string;
}

// ---- Challenges ----

export interface ChallengeAuthor
{
  username: string;
  avatar: string | null;
}

export interface Challenge
{
  id: string;
  title: string;
  description: string | null;
  positiveExample: string;
  negativeExample: string;
  author: ChallengeAuthor;
  createdAt: string;
  updatedAt: string;
  solved?: boolean;
  canEdit?: boolean;
}

export interface CreateChallengePayload
{
  title: string;
  description?: string;
  secretRegex: string;
  positiveExample: string;
  negativeExample: string;
  positiveControls: string[];
  negativeControls: string[];
}

export interface AttemptPayload
{
  proposedRegex: string;
}

export interface AttemptResult
{
  positiveMatches: number;
  negativeMatches: number;
  totalPositive: number;
  totalNegative: number;
  isCorrect: boolean;
}

export interface AttemptHistory
{
  id: string;
  proposedRegex: string;
  positiveMatches: number;
  negativeMatches: number;
  totalPositive: number;
  totalNegative: number;
  isCorrect: boolean;
  attemptedAt: string;
}

// ---- Leaderboard ----

export interface LeaderboardEntry
{
  username: string;
  avatar: string | null;
  solvedCount: number;
  avgAttempts: number;
}

// ---- Pagination ----

export interface PaginatedResult<T>
{
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginationParams
{
  page?: number;
  limit?: number;
}

// ---- Service ----

@Injectable({ providedIn: 'root' })
export class ApiService
{
  private readonly http = inject(HttpClient);

  // --- Auth ---

  login(payload: LoginPayload): Observable<LoginResponse>
  {
    return this.http.post<LoginResponse>(`${BASE}/auth/login`, payload);
  }

  signup(payload: RegisterPayload): Observable<RegisterResponse>
  {
    return this.http.post<RegisterResponse>(`${BASE}/auth/signup`, payload);
  }

  changePassword(payload: ChangePasswordPayload): Observable<{ message: string }>
  {
    return this.http.put<{ message: string }>(`${BASE}/users/change-password`, payload);
  }

  // --- Profile ---

  getProfile(): Observable<UserProfile>
  {
    return this.http.get<UserProfile>(`${BASE}/users/me`);
  }

  updateProfile(payload: UpdateProfilePayload): Observable<UserProfile>
  {
    return this.http.patch<UserProfile>(`${BASE}/users/me`, payload);
  }

  uploadAvatar(file: File): Observable<AvatarResponse>
  {
    const form = new FormData();
    form.append('avatar', file);
    return this.http.post<AvatarResponse>(`${BASE}/users/me/avatar`, form);
  }

  // --- Challenges ---

  getChallenges(params?: PaginationParams): Observable<PaginatedResult<Challenge>>
  {
    const query = this.toQuery(params);
    return this.http.get<PaginatedResult<Challenge>>(`${BASE}/challenges${query}`);
  }

  getMyChallenges(params?: PaginationParams): Observable<PaginatedResult<Challenge>>
  {
    const query = this.toQuery(params);
    return this.http.get<PaginatedResult<Challenge>>(`${BASE}/challenges/mine${query}`);
  }

  getUnsolvedChallenges(params?: PaginationParams): Observable<PaginatedResult<Challenge>>
  {
    const query = this.toQuery(params);
    return this.http.get<PaginatedResult<Challenge>>(`${BASE}/challenges/unsolved${query}`);
  }

  getSolvedIds(): Observable<string[]>
  {
    return this.http.get<string[]>(`${BASE}/challenges/solved`);
  }

  getChallenge(id: string): Observable<Challenge>
  {
    return this.http.get<Challenge>(`${BASE}/challenges/${id}`);
  }

  createChallenge(payload: CreateChallengePayload): Observable<Challenge>
  {
    return this.http.post<Challenge>(`${BASE}/challenges`, payload);
  }

  deleteChallenge(id: string): Observable<void>
  {
    return this.http.delete<void>(`${BASE}/challenges/${id}`);
  }

  attemptChallenge(id: string, payload: AttemptPayload): Observable<AttemptResult>
  {
    return this.http.post<AttemptResult>(`${BASE}/challenges/${id}/attempt`, payload);
  }

  getAttempts(id: string): Observable<AttemptHistory[]>
  {
    return this.http.get<AttemptHistory[]>(`${BASE}/challenges/${id}/attempts`);
  }

  // --- Leaderboard ---

  getLeaderboard(params?: PaginationParams): Observable<PaginatedResult<LeaderboardEntry>>
  {
    const query = this.toQuery(params);
    return this.http.get<PaginatedResult<LeaderboardEntry>>(`${BASE}/challenges/leaderboard${query}`);
  }

  // --- Utility ---

  getAvatarUrl(avatarPath: string | null): string | null
  {
    if (!avatarPath) return null;
    if (avatarPath.startsWith('http')) return avatarPath;
    return `${BASE}${avatarPath}`;
  }

  private toQuery(params?: PaginationParams): string
  {
    if (!params) return '';
    const q = new URLSearchParams();
    if (params.page) q.set('page', String(params.page));
    if (params.limit) q.set('limit', String(params.limit));
    const s = q.toString();
    return s ? `?${s}` : '';
  }
}
