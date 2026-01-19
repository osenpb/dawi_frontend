import { ChangeDetectionStrategy, Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReservaPublicService } from '../../services/reserva-public.service';
import { DepartamentoResponse } from '../../../interfaces';
import { ExperiencesGalery } from "../../components/experiences-galery/experiences-galery";

interface Slide {
  url: string;
  title: string;
  subtitle: string;
  highlight: string;
}


@Component({
  standalone: true,
  selector: 'app-home-page',
  imports: [CommonModule, RouterLink, ExperiencesGalery],
  templateUrl: './home-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePageComponent implements OnInit, OnDestroy {
  private reservaService = inject(ReservaPublicService);

  departamentosDestacados = signal<DepartamentoResponse[]>([]);
  loading = signal<boolean>(true);

  // Carousel
  currentSlide = signal<number>(0);
  private slideInterval: any;
  private readonly totalSlides = 3;

  readonly slides: Slide[] = [
    {
      url: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=1600&q=80',
      title: 'El lujo de la',
      highlight: 'Reciprocidad',
      subtitle: 'Bienvenidos a Ayni'
    },
    {
      url: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=1600&q=80',
      title: 'Confort que abraza tus',
      highlight: 'Sentidos',
      subtitle: 'Experiencias Premium'
    },
    {
      url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1600&q=80',
      title: 'Crea recuerdos en el',
      highlight: 'Paraíso',
      subtitle: 'Destinos Inolvidables'
    }
  ];



  ngOnInit(): void {
    this.loadDepartamentosDestacados();
    this.startAutoSlide();
  }

  ngOnDestroy(): void {
    this.stopAutoSlide();
  }

  loadDepartamentosDestacados(): void {
    this.reservaService.getDepartamentos().subscribe({
      next: (data) => {
        this.departamentosDestacados.set(data.slice(0, 4));
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error cargando departamentos:', err);
        this.loading.set(false);
      },
    });
  }

  // Carousel methods
  nextSlide(): void {
    const next = (this.currentSlide() + 1) % this.totalSlides;
    this.currentSlide.set(next);
  }

  prevSlide(): void {
    const prev = (this.currentSlide() - 1 + this.totalSlides) % this.totalSlides;
    this.currentSlide.set(prev);
  }

  goToSlide(index: number): void {
    this.currentSlide.set(index);
  }

  private startAutoSlide(): void {
    this.slideInterval = setInterval(() => {
      this.nextSlide();
    }, 5000); // Cambiar cada 5 segundos
  }

  private stopAutoSlide(): void {
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
    }
  }
}
