import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-error-display',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="text-center py-20">
      <div class="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg class="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </div>
      <h2 class="text-2xl font-semibold text-gray-800 mb-2">Error al cargar la reserva</h2>
      <p class="text-gray-500 mb-6">No se pudo encontrar la información de la reserva.</p>
      <a routerLink="/home" class="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
        Volver al inicio
      </a>
    </div>
  `,
})
export class ErrorDisplayComponent {

}