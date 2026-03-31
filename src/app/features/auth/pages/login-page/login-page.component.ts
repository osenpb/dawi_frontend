import { AuthResponse, LoginRequest } from '../../../../interfaces/auth/auth.interface';
import { AuthService } from '../../../../core/services/auth.service';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LoggerService } from '../../../../core/services/logger.service';

@Component({
  selector: 'app-login-page',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './login-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPageComponent {
  fb = inject(FormBuilder);
  hasError = signal(false);
  isPosting = signal(false);

  router = inject(Router);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  authService = inject(AuthService);
  private logger = inject(LoggerService);

  onSubmit() {
    if (this.loginForm.invalid) {
      this.hasError.set(true);
      setTimeout(() => {
        this.hasError.set(false);
      }, 2000);
      return;
    }

    const { email = '', password = '' } = this.loginForm.value;

    const loginRequest: LoginRequest = {
      email: email,
      password: password,
    };

    this.isPosting.set(true);

    this.authService.login(loginRequest).subscribe({
      next: (authResp: AuthResponse) => {
        this.logger.log('AuthResponse:', authResp);
        this.isPosting.set(false);

        const user = authResp.user;

        if (!user) {
          this.logger.error('User está undefined');
          this.hasError.set(true);
          return;
        }

        // Redirigir según el rol
        if (user.role.rolename === 'ADMIN') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/home']);
        }
      },
      error: (err) => {
        this.logger.error('Login failed', err);
        this.isPosting.set(false);
        this.hasError.set(true);
        setTimeout(() => this.hasError.set(false), 3000);
      },
    });
  }
}
