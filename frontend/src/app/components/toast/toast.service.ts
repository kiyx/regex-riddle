import { Injectable, type Signal, signal } from '@angular/core';

export interface Toast
{
  id: number;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService
{
  private readonly toasts = signal<Toast[]>([]);
  private nextId = 1;

  readonly all: Signal<Toast[]> = this.toasts;

  show(message: string, type: Toast['type'] = 'info', duration = 3000): void
  {
    const id = this.nextId++;
    const toast: Toast = { id, message, type, duration };
    this.toasts.update((list) => [...list, toast]);
    setTimeout(() => this.remove(id), duration);
  }

  remove(id: number): void
  {
    this.toasts.update((list) => list.filter((t) => t.id !== id));
  }
}
