import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, map, Observable, of, tap, throwError } from 'rxjs';
import { LoginRequest, RegisterRequest, AuthResponse } from '../../interfaces/auth/auth.interface';
import { UserResponse } from '../../interfaces/auth/userResponse.interface';
import { LoggerService } from './logger.service';
import { environment } from '../../../environments/environments';


type AuthStatus = 'checking' | 'authenticated' | 'not-authenticated';

const baseUrl = `${environment.apiUrl}/auth`;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private logger = inject(LoggerService);

  // Signals privados - inicializar desde localStorage
  private _authStatus = signal<AuthStatus>(this.getInitialAuthStatus());
  private _user = signal<UserResponse | null>(this.loadUserFromStorage());
  private _token = signal<string | null>(localStorage.getItem('token'));

  /**
   * Determina el estado inicial de autenticación basado en localStorage
   */
  private getInitialAuthStatus(): AuthStatus {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (token && user) {
      return 'authenticated';
    }
    return 'not-authenticated';
  }

  /**
   * Carga el usuario desde localStorage
   */
  private loadUserFromStorage(): UserResponse | null {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);

        return user;
      }
    } catch (e) {
      this.logger.warn('Error parsing user from localStorage:', e);
      localStorage.removeItem('user');
    }
    return null;
  }

  // Computed values
  authStatus = computed(() => this._authStatus());
  user = computed<UserResponse | null>(() => this._user());
  token = computed(() => this._token());

  // Helpers
  isAuthenticated = computed(() => this._authStatus() === 'authenticated' && this._user() !== null);
  isChecking = computed(() => this._authStatus() === 'checking');

  /**
   * Registro de nuevo usuario
   */
  register(registerRequest: RegisterRequest): Observable<boolean> {
    return this.http
      .post<AuthResponse>(`${baseUrl}/register`, {
        username: registerRequest.username,
        email: registerRequest.email,
        telefono: registerRequest.telefono,
        password: registerRequest.password,
      })
      .pipe(
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
    return this.http.post<AuthResponse>(`${baseUrl}/login`, loginRequest).pipe(
      tap((resp) => {

        this.handleLoginSuccess(resp);
      }),
      catchError((error) => this.handleAuthError(error))
    );
  }

  /**
   * Logout del usuario
   */
  logout() {
    this.logger.log('Cerrando sesión...');

    this._user.set(null);
    this._token.set(null);
    this._authStatus.set('not-authenticated');

    localStorage.removeItem('token');
    localStorage.removeItem('user');

    this.logger.log('Sesión cerrada');
  }

  /**
   * Verifica el estado de autenticación con el backend
   * Usar solo cuando sea necesario verificar que el token sigue válido
   */
  checkAuthStatus(): Observable<boolean | UserResponse> {
    const token = localStorage.getItem('token');
    const storedUser = this.loadUserFromStorage();

    if (!token) {
      this.logger.log('No hay token');
      this._authStatus.set('not-authenticated');
      this._user.set(null);
      return of(false);
    }

    // Si ya tenemos usuario en localStorage, usarlo sin llamar al backend
    if (storedUser) {
      this.logger.log('Usuario ya disponible:', storedUser.username);
      this._user.set(storedUser);
      this._token.set(token);
      this._authStatus.set('authenticated');
      return of(storedUser);
    }

    // Solo llamar al backend si no tenemos usuario
    this.logger.log('Verificando token con backend...');
    this._authStatus.set('checking');

    return this.me().pipe(
      tap((user) => {
        this.logger.log('Token válido, usuario:', user.username);
        this._authStatus.set('authenticated');
        localStorage.setItem('user', JSON.stringify(user));
      }),
      catchError((error) => {
        this.logger.log('Token inválido:', error.status);
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
    this.logger.log('Guardando datos de autenticación...');

    localStorage.setItem('token', resp.token);
    localStorage.setItem('user', JSON.stringify(resp.user));

    this._token.set(resp.token);
    this._user.set(resp.user);
    this._authStatus.set('authenticated');

    this.logger.log('Datos guardados para:', resp.user.username);
  }

  /**
   * Maneja errores de autenticación
   */
  private handleAuthError(error: any) {
    this.logger.error('Error de autenticación:', error);

    // No cerrar sesión en errores de conexión
    if (error.status === 0) {
      return throwError(() => ({
        ...error,
        userMessage: 'No se puede conectar con el servidor',
      }));
    }

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
    }

    return throwError(() => ({
      ...error,
      userMessage: errorMessage,
    }));
  }

  /**
   * Obtiene información del usuario actual desde el backend
   */
  me(): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${baseUrl}/auth/me`).pipe(
      tap((user: UserResponse) => {
        this.logger.log('Usuario obtenido de /me:', user.username);
        this._user.set(user);
        localStorage.setItem('user', JSON.stringify(user));
      })
    );
  }

  /**
   * Refresca la información del usuario
   */
  refreshUser(): Observable<UserResponse> {
    return this.me().pipe(
      catchError((error) => {
        this.logger.error('Error al refrescar usuario:', error);
        return throwError(() => error);
      })
    );
  }
}

