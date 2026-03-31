import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-experiences-gallery',
  imports: [],
  templateUrl: './experiences-gallery.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExperiencesGalleryComponent { }
