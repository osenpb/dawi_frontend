import { LoginRequest } from '../../interfaces/auth.interface';
import { AuthService } from '../../services/auth.service';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login-page.component',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './login-page.component.html',
})
export class LoginPageComponent {

  fb = inject(FormBuilder);
  hasError = signal(false);
  isPosting = signal(false);

  router = inject(Router);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  })

  authService = inject(AuthService);

  onSubmit() {
    if( this.loginForm.invalid ) {
      this.hasError.set(true);
      setTimeout(() => {
        this.hasError.set(false)
      }, 2000)
      return;
    }

    const {email = '', password= ''} = this.loginForm.value;

    const loginRequest: LoginRequest = {
      email: email,
      password: password
    };

    this.authService.login(loginRequest).subscribe((isAuthenticated) => {
      if(isAuthenticated) {
        console.log(isAuthenticated)
        this.router.navigate(['/home'])
        return ;
      }

      //en caso haya errorm luego lo gestionamos en el componente con una validacion
      console.log("ERROR")
      this.hasError.set(true);
      setTimeout(() => {
        this.hasError.set(false)
      }, 2000)
    })
  }

 }
