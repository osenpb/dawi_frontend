import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { RegisterRequest } from '../../../../interfaces/auth/auth.interface';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { LoggerService } from '../../../../core/services/logger.service';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './register-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterPageComponent {
  fb = inject(FormBuilder);
  router = inject(Router);
  authService = inject(AuthService);
  private logger = inject(LoggerService);

  hasError = signal(false);
  isPosting = signal(false);
  errorMessage = signal('');

  registerForm = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    telefono: ['', [Validators.required, Validators.pattern(/^\d{9,15}$/)]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    repeatPassword: ['', [Validators.required, Validators.minLength(8)]],
  });

  onSubmit() {
    this.logger.log('Formulario enviado');
    this.logger.log('Formulario válido:', this.registerForm.valid);
    this.logger.log('Valores:', this.registerForm.value);

    // Marcar todos los campos como touched para mostrar errores
    if (this.registerForm.invalid) {
      this.logger.log('Formulario inválido');
      this.registerForm.markAllAsTouched();
      this.showError('Por favor completa todos los campos correctamente');
      return;
    }

    const { username, email, telefono, password, repeatPassword } = this.registerForm.value;

    // Validar que las contraseñas coincidan
    if (password !== repeatPassword) {
      this.logger.log('Las contraseñas no coinciden');
      this.showError('Las contraseñas no coinciden');
      return;
    }

    const registerRequest: RegisterRequest = {
      username: username!,
      email: email!,
      telefono: telefono!,
      password: password!,
    };

    this.logger.log('Enviando registro:', registerRequest);
    this.isPosting.set(true);

    this.authService.register(registerRequest).subscribe({
      next: (resp) => {
        this.logger.log('Registro exitoso:', resp);
        this.isPosting.set(false);
        if (resp) {
          // Auto-login exitoso, redirigir al home del cliente
          this.router.navigate(['/home']);
        } else {
          this.showError('Error al crear la cuenta');
        }
      },
      error: (error) => {
        this.logger.error('Error en registro:', error);
        this.isPosting.set(false);
        const message = error.userMessage || 'Error al crear la cuenta. Inténtalo de nuevo.';
        this.showError(message);
      },
    });
  }

  private showError(message: string) {
    this.errorMessage.set(message);
    this.hasError.set(true);
    setTimeout(() => {
      this.hasError.set(false);
      this.errorMessage.set('');
    }, 10000);
  }
}
