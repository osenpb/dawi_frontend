import { Directive, ElementRef, inject, output, HostListener } from '@angular/core';

@Directive({ selector: '[clickOutside]', standalone: true })
export class ClickOutsideDirective {
  clickOutside = output<void>();

  private elRef = inject(ElementRef);

  @HostListener('document:click', ['$event'])
  onClick(event: Event): void {
    if (!this.elRef.nativeElement.contains(event.target)) {
      this.clickOutside.emit();
    }
  }
}
