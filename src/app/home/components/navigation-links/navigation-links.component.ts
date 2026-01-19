import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-navigation-links',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="flex flex-col sm:flex-row gap-4 justify-center">
      <a
        routerLink="/home/mis-reservas"
        class="inline-flex items-center justify-center gap-2 px-6 py-3 border border-indigo-600 text-indigo-600 font-medium rounded-lg hover:bg-indigo-50 transition"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
        </svg>
        Ver Mis Reservas
      </a>
      <a
        routerLink="/home"
        class="inline-flex items-center justify-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-800 transition"
      >
        ← Volver al Inicio
      </a>
    </div>
  `,
})
export class NavigationLinksComponent {

}