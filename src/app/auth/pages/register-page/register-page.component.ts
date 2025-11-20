import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { RegisterRequest } from '../../interfaces/auth.interface';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './register-page.component.html',
})
export class RegisterPageComponent {
  fb = inject(FormBuilder);
  router = inject(Router);
  authService = inject(AuthService);

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
    console.log('🔵 Formulario enviado');
    console.log('Formulario válido:', this.registerForm.valid);
    console.log('Valores:', this.registerForm.value);

    // Marcar todos los campos como touched para mostrar errores
    if (this.registerForm.invalid) {
      console.log('❌ Formulario inválido');
      this.registerForm.markAllAsTouched();
      this.showError('Por favor completa todos los campos correctamente');
      return;
    }

    const { username, email, telefono, password, repeatPassword } = this.registerForm.value;

    // Validar que las contraseñas coincidan
    if (password !== repeatPassword) {
      console.log('Las contraseñas no coinciden');
      this.showError('Las contraseñas no coinciden');
      return;
    }


    const registerRequest: RegisterRequest = {
      username: username!,
      email: email!,
      telefono: telefono!,
      password: password!
    };

    console.log('📤 Enviando registro:', registerRequest);
    this.isPosting.set(true);


    this.authService.register(registerRequest).subscribe({
      next: (resp) => {
        console.log('✅ Registro exitoso:', resp);
        this.isPosting.set(false);
        if (resp) {
          this.router.navigate(['/auth/login']);
        } else {
          this.showError('Error al crear la cuenta');
        }
      },
      error: (error) => {
        console.error('❌ Error en registro:', error);
        this.isPosting.set(false);
        this.showError('Error al crear la cuenta. Inténtalo de nuevo.');
      }
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
