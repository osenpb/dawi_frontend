import { LoginRequest, RegisterRequest } from './../interfaces/auth.interface';
import { HttpClient } from "@angular/common/http";
import { computed, inject, Injectable, signal } from "@angular/core";
import { AuthResponse, UserResponseDTO } from "../interfaces/auth.interface";
import { catchError, map, Observable, of, tap } from 'rxjs';
import { rxResource } from '@angular/core/rxjs-interop';

type AuthStatus = 'checking' | 'authenticated' | 'not-authenticated'
const baseUrl = 'http://localhost:8080/api/v1'

@Injectable({providedIn: 'root'})
export class AuthService {

  private _authStatus = signal('checking');
  private _user = signal<UserResponseDTO | null>(null);
  private _token = signal<string | null>(localStorage.getItem('token'));

  checkStatusResource = rxResource({
    stream: () => this.checkAuthStatus()
  });



  private http = inject(HttpClient)

  authStatus = computed(() => {
    if( this._authStatus() === 'checking') return 'checking';

    if(this._user()) {
      return 'authenticated';
    }
    return 'not-authenticated'

  })

  user = computed<UserResponseDTO | null>(() => this._user())
  token = computed(() => this._token())

  register(registerRequest: RegisterRequest) : Observable<boolean> {
    return this.http.post(`${baseUrl}/auth/register`, {
      username: registerRequest.username,
      email: registerRequest.email,
      telefono: registerRequest.telefono,
      password: registerRequest.password,
    }, {
      responseType: 'text' as 'json'
    }).pipe(
      tap(resp => {
        this.handleLoginSuccess(resp)
      }),
      map(() => true),
      catchError((error: any) => this.handleAuthError(error))
    )
  }



  login(loginRequest: LoginRequest) : Observable<boolean> {
    return this.http.post<AuthResponse>(`${baseUrl}/auth/login`, {
      email: loginRequest.email,
      password: loginRequest.password
    }).pipe(
      tap(resp => {
        this.handleLoginSuccess(resp)
      }),
      map(() => true),
      catchError((error: any) => this.handleAuthError(error))
    )
  }

  logout() {
    this._user.set(null);
    this._token.set(null);
    this._authStatus.set('not-authenticated');

    // localStorage.removeItem('token');

  }

  private checkAuthStatus() : Observable<boolean> {
  const token = localStorage.getItem('token');

  if (!token) {
    this._authStatus.set('not-authenticated');
    return of(false);
  }

  // Aquí podrías validar el token con el backend
  // Por ahora, hago esto para verificar el token
  this._token.set(token);
  this._authStatus.set('authenticated');
  return of(true);
  // Idealmente, debería llamar a un endpoint para obtener el usuario
  // this.http.get<UserResponseDTO>(`${baseUrl}/auth/me`).subscribe(...)
  //IMPLEMENTACION FUTURA O.o

}



  private handleLoginSuccess(resp: any) {
        this._authStatus.set('authenticated');
        this._user.set(resp.user);
        this._token.set(resp.token);
        localStorage.setItem('token', resp.token);
      }

  private handleAuthError(error : any) {
    this.logout();
    console.log(error)
    return of(false)

  }
}
