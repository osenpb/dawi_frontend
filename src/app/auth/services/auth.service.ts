import { HttpClient } from "@angular/common/http";
import { computed, inject, Injectable, signal } from "@angular/core";
import { catchError, map, Observable, of, tap, throwError } from 'rxjs';
import { rxResource } from '@angular/core/rxjs-interop';
import { LoginRequest, RegisterRequest, AuthResponse } from '../interfaces/auth.interface';
import { UserResponse } from '../interfaces/userResponse.interface';

type AuthStatus = 'checking' | 'authenticated' | 'not-authenticated';

const baseUrl = 'http://localhost:8080/api/v1';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private http = inject(HttpClient);

  // Signals privados
  private _authStatus = signal<AuthStatus>('checking');
  private _user = signal<UserResponse | null>(null);
  private _token = signal<string | null>(localStorage.getItem('token'));


  checkStatusResource = rxResource({
    stream: () => this.checkAuthStatus()
  });

  authStatus = computed(() => {
    if (this._authStatus() === 'checking') return 'checking';
    if (this._user()) return 'authenticated';
    return 'not-authenticated';
  });

  user = computed<UserResponse | null>(() => this._user());
  token = computed(() => this._token());

  //helpers
  isAuthenticated = computed(() => this.authStatus() === 'authenticated');
  isChecking = computed(() => this.authStatus() === 'checking');

  /**
   * Registro de nuevo usuario
   */
  register(registerRequest: RegisterRequest): Observable<boolean> {
    return this.http.post<AuthResponse>(`${baseUrl}/auth/register`, {
      username: registerRequest.username,
      email: registerRequest.email,
      telefono: registerRequest.telefono,
      password: registerRequest.password,
    }).pipe(
      tap((resp: AuthResponse) => {
        this.handleLoginSuccess(resp);
      }),
      map(() => true),
      catchError((error: any) => this.handleAuthError(error))
    );
  }

  /**
   * Login del usuario
   */
  login(loginRequest: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${baseUrl}/auth/login`, loginRequest).pipe(
      tap(resp => {
        console.log('Login exitoso:', resp);
        this.handleLoginSuccess(resp);
      }),
      catchError(error => this.handleAuthError(error))
    );
  }

  /**
   * Logout del usuario
   */
  logout() {
    console.log('Cerrando sesión...');

    this._user.set(null);
    this._token.set(null);
    this._authStatus.set('not-authenticated');

    // Limpiar localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user'); // por si guardas el user también

    console.log('✅ Sesión cerrada');
  }

  /**
   * Verifica el estado de autenticación
   * Ideal para llamar en el AppComponent al iniciar
   */
  checkAuthStatus(): Observable<boolean> {
    const token = localStorage.getItem('token');

    if (!token) {
      console.log('❌ No hay token, usuario no autenticado');
      this._authStatus.set('not-authenticated');
      return of(false);
    }

    console.log('🔍 Token encontrado, verificando...');
    this._token.set(token);

    // OPCIÓN 1: Solo confiar en el token (actual)
    // this._authStatus.set('authenticated');
    // return of(true);

    // OPCIÓN 2: Validar token con el backend (RECOMENDADO)
    return this.http.get<UserResponse>(`${baseUrl}/auth/me`).pipe(
      tap(user => {
        console.log('✅ Usuario verificado:', user);
        this._user.set(user);
        this._authStatus.set('authenticated');
      }),
      map(() => true),
      catchError(error => {
        console.error('❌ Token inválido o expirado:', error);
        this.logout();
        return of(false);
      })
    );
  }

  /**
   * Obtiene el usuario actual (sin signal)
   */
  getCurrentUser(): UserResponse | null {
    return this._user();
  }

  /**
   * Obtiene el token actual (sin signal)
   */
  getToken(): string | null {
    return this._token();
  }

  /**
   * Verifica si el usuario tiene un rol específico
   */
  hasRole(role: string): boolean {
    const user = this._user();
    return user?.role.rolename === role;
  }

  /**
   * Verifica si el usuario es admin
   */
  isAdmin(): boolean {
    return this.hasRole('ADMIN');
  }

  /**
   * Maneja el éxito del login/registro
   */
  private handleLoginSuccess(resp: AuthResponse) {
    console.log('💾 Guardando datos de autenticación...');

    this._authStatus.set('authenticated');
    this._user.set(resp.userResponseDTO);
    this._token.set(resp.token);

    // Guardar en localStorage
    localStorage.setItem('token', resp.token);

    // Opcional: guardar también el usuario
    localStorage.setItem('user', JSON.stringify(resp.userResponseDTO));

    console.log('Datos guardados:', {
      user: resp.userResponseDTO,
      token: resp.token.substring(0, 20) + '...'
    });
  }

  /**
   * Maneja errores de autenticación
   */
  private handleAuthError(error: any) {
    console.error('❌ Error de autenticación:', error);

    this.logout();

    // Extraer mensaje de error
    let errorMessage = 'Error desconocido';

    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    } else if (error.status === 401) {
      errorMessage = 'Credenciales inválidas';
    } else if (error.status === 403) {
      errorMessage = 'No tienes permisos';
    } else if (error.status === 0) {
      errorMessage = 'No se puede conectar con el servidor';
    }

    return throwError(() => ({
      ...error,
      userMessage: errorMessage
    }));
  }

  /**
   * Refresca los datos del usuario desde el backend
   */
  refreshUser(): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${baseUrl}/auth/me`).pipe(
      tap(user => {
        console.log('🔄 Usuario actualizado:', user);
        this._user.set(user);
      }),
      catchError(error => {
        console.error('❌ Error al refrescar usuario:', error);
        return throwError(() => error);
      })
    );
  }
}
