import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      @for (n of notificationService.notifications(); track n.id) {
        <div
          class="flex items-start gap-3 p-4 rounded-lg shadow-lg border animate-slide-in"
          [ngClass]="{
            'bg-green-50 border-green-200 text-green-800': n.type === 'success',
            'bg-red-50 border-red-200 text-red-800': n.type === 'error',
            'bg-yellow-50 border-yellow-200 text-yellow-800': n.type === 'warning',
            'bg-blue-50 border-blue-200 text-blue-800': n.type === 'info'
          }"
        >
          <span class="text-sm font-medium flex-1">{{ n.message }}</span>
          <button
            (click)="notificationService.dismiss(n.id)"
            class="text-current opacity-50 hover:opacity-100 transition"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      }
    </div>
  `,
  styles: `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    .animate-slide-in {
      animation: slideIn 0.2s ease-out;
    }
  `,
})
export class ToastComponent {
  notificationService = inject(NotificationService);
}
