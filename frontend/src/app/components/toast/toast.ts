import { Component, inject } from '@angular/core';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.html',
  styleUrls: ['./toast.css'],
  imports: [],
})
export class ToastComponent
{
  readonly service = inject(ToastService);

  icon(type: string): string
  {
    const map: Record<string, string> = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: '💡',
    };
    return map[type] || '💡';
  }
}
