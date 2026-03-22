# Recomendaciones de Arquitectura y Buenas Prácticas

> Proyecto: DAWI Frontend (AYNI Sistema de Reservas)
> Framework: Angular 20 + Tailwind CSS 4
> Última actualización: Marzo 2026

---

## Resumen Ejecutivo

El proyecto tiene una **base sólida**: standalone components, signals, lazy loading, `inject()`, OnPush y strict TypeScript. Se realizaron múltiples mejoras de arquitectura documentadas en este archivo.

---

## Estado de Implementación

| Categoría | Estado |
|-----------|--------|
| LoggerService + eliminación de console.log/error | ✅ Completado |
| URLs hardcodeadas eliminadas | ✅ Completado |
| Migración input/output signals | ✅ Completado |
| Shared pipes (CurrencySol, EstadoBadge, FormatDate) | ✅ Completado |
| NotificationService + ToastComponent | ✅ Completado |
| Reemplazo de alert()/confirm() | ✅ Completado |
| OnPush en todos los componentes | ✅ Completado |
| Selectores corregidos (sin .component) | ✅ Completado |
| Tipos deprecated eliminados | ✅ Completado |
| Guards con cache de auth state | ✅ Completado |
| Constructor → inject() en update-page | ✅ Completado |
| ClickOutsideDirective con output() signals | ✅ Completado |
| Consolidación de services (AuthService, ReservaPublicService) | ✅ Completado |
| Barrel exports para shared/ y core/ | ✅ Completado |
| Feature `reservas/` eliminada → movida a `home/pages/` | ✅ Completado |
| Endpoints públicos para pages de home | ✅ Completado |
| Nomenclatura: selectores, clases, sufijos PageComponent | ✅ Completado |
| Directorio `auth-layout.component/` → `auth-layout/` | ✅ Completado |
| Interfaces auth centralizadas en `interfaces/auth/` | ✅ Completado |
| `experiences-galery` → `experiences-gallery.component` + standalone | ✅ Completado |
| `hoteles-por-departamento` → `.component` + standalone | ✅ Completado |
| Template inline `ReservationDetailsComponent` extraído a .html | ✅ Completado |
| takeUntilDestroyed() en subscripciones | ⏳ Pendiente (excluido por usuario) |
| Tests unitarios | ⏳ Pendiente (excluido por usuario) |

---

## 1. Arquitectura Actual

### Estructura de directorios

```
src/app/
├── app.ts                           # Root component
├── app.html                         # <router-outlet /> + <app-toast />
├── app.config.ts                    # Application bootstrap config
├── app.routes.ts                    # Top-level routes (lazy loading)
│
├── core/                            # Funcionalidad central de la app
│   ├── guards/
│   │   ├── index.ts                 # Barrel export
│   │   ├── auth.guard.ts            # Requiere autenticación (con cache)
│   │   ├── admin.guard.ts           # Requiere rol ADMIN (con cache)
│   │   └── login.guard.ts           # Bloquea acceso si ya autenticado
│   ├── interceptors/
│   │   ├── auth.interceptor.ts      # Inyección de token + manejo 401
│   │   └── logging.interceptor.ts   # Debug logging HTTP
│   └── services/
│       ├── index.ts                 # Barrel export
│       ├── auth.service.ts          # Estado de autenticación (signals)
│       ├── logger.service.ts        # Logging condicional (solo dev)
│       └── notification.service.ts  # Sistema de toasts
│
├── shared/                          # Componentes/utilidades reutilizables
│   ├── components/
│   │   ├── index.ts                 # Barrel export
│   │   └── toast/
│   │       └── toast.component.ts   # Toast notifications global
│   ├── directives/
│   │   ├── index.ts                 # Barrel export
│   │   └── click-outside.directive.ts
│   └── pipes/
│       ├── index.ts                 # Barrel export
│       ├── currency-sol.pipe.ts     # Formato S/ 0.00
│       ├── estado-badge.pipe.ts     # Clases CSS por estado
│       └── format-date.pipe.ts      # Formato fecha corto/largo
│
├── services/                        # Services globales de la app
│   ├── departamento.service.ts      # CRUD departamentos (/admin)
│   ├── hotel.service.ts             # CRUD hoteles (/admin)
│   ├── reserva.service.ts           # CRUD reservas admin (/admin)
│   ├── reserva-public.service.ts    # API pública de reservas (/public)
│   ├── dashboard.service.ts         # Estadísticas dashboard
│   ├── tipo-habitacion.service.ts   # Tipos de habitación
│   └── pdf-generator.service.ts     # Generación de PDFs
│
├── interfaces/                      # DTOs centralizados
│   ├── index.ts                     # Barrel export
│   ├── departamento/
│   ├── tipo-habitacion/
│   ├── cliente/
│   ├── habitacion/
│   ├── hotel/
│   ├── reserva/
│   └── dashboard/
│
└── features/                        # Módulos de funcionalidad
    ├── auth/                        # Autenticación
    ├── admin/                       # Panel administrativo
    ├── home/                        # Sitio público
    └── reservas/                    # Páginas de reserva
```

### Convenciones establecidas

- **100% standalone components** — Sin NgModules
- **Signals para estado** — Sin BehaviorSubject/NgRx
- **`inject()` para DI** — Sin constructor injection
- **OnPush en todos los componentes** — Performance óptima
- **`input()`/`output()` signals** — API moderna de Angular 20
- **Pipes para formateo** — Sin métodos duplicados en componentes
- **LoggerService** — Sin console.log directo en producción
- **NotificationService** — Sin alert()/confirm() nativos
- **Lazy loading multinivel** — auth, home, admin + sub-rutas admin
- **TypeScript strict mode** — Con todas las opciones de Angular habilitadas

---

## 2. Análisis de la Estructura de Features

### Estado actual por feature

| Feature | Ruta | Servicios propios | Interfaces | Layout | Sub-rutas |
|---------|------|-------------------|------------|--------|-----------|
| `auth` | `/auth/*` | AuthService (en core/) | Auth, UserResponse, Role | AuthLayoutComponent | login, register |
| `admin` | `/admin/*` | Todos en services/ (global) | Todas en interfaces/ (global) | AdminLayoutComponent + Sidebar | departamento, hotel, reserva (lazy) |
| `home` | `/home/*` | ReservaPublicService (en services/) | Re-export de global | ClienteLayoutComponent + Navbar + Footer | departamentos, hoteles, reserva, pago, confirmacion, mis-reservas, contacto |

### Problemas identificados

#### 1. ~~Feature `reservas` es huérfana~~ ✅ Resuelto

~~La feature `reservas/` contenía dos page components sin rutas, layout o services propios.~~
**Resuelto:** `ReservaPageComponent` y `MisReservasPageComponent` movidos a `features/home/pages/`. La carpeta `reservas/` fue eliminada.

#### 2. Dependencias cruzadas de servicios (resuelto)

~~`AuthService` estaba en `features/auth/services/` pero se usaba en 3 features + core/guards.~~
**Resuelto:** Movido a `core/services/auth.service.ts`.

~~`ReservaPublicService` estaba en `features/home/services/` pero se usaba en `features/reservas/`.~~
**Resuelto:** Movido a `services/reserva-public.service.ts` (global).

#### 3. ~~Endpoint mismatch: páginas públicas usan endpoints admin~~ ✅ Resuelto

~~Los componentes públicos `hoteles-page` y `departamentos-page` usaban `HotelService` y `DepartamentoService` que llaman a endpoints `/admin/*`.~~
**Resuelto:** Se agregaron métodos públicos (`getDepartamentosList`, `getHotelesList`, `getHotelesByDepartamento`) a `ReservaPublicService`. Los pages de home ahora usan estos métodos con endpoints `/public/*`.

#### 4. ~~Interfaces de auth separadas del patrón global~~ ✅ Resuelto

~~`auth` tenía sus propias interfaces en `features/auth/interfaces/` mientras el resto usaba `interfaces/` centralizadas.~~
**Resuelto:** Interfaces movidas a `interfaces/auth/`. Barrel export actualizado en `interfaces/index.ts`.

#### 5. ~~Asimetría de profundidad de carpetas~~ ✅ Resuelto

~~La feature `reservas` tenía 1 nivel mientras las demás tenían 2-4 niveles.~~
**Resuelto:** Feature `reservas/` eliminada. Sus pages movidas a `features/home/pages/`.

---

## 3. Recomendaciones Pendientes

### Alto

- [x] ~~Eliminar feature `reservas/`~~ ✅ Movido a `features/home/pages/`
- [x] ~~Crear endpoints públicos~~ ✅ `ReservaPublicService` ahora tiene métodos públicos usados por `hoteles-page` y `departamentos-page`

### Medio

- [x] ~~Corregir typo `experiences-galery` → `experiences-gallery` + agregar sufijo `.component` al archivo~~ ✅ Completado
- [x] ~~Renombrar `hoteles-por-departamento.ts` → `hoteles-por-departamento.component.ts`~~ ✅ Completado
- [x] ~~Directorio `auth-layout.component/` → `auth-layout/`~~ ✅ Completado
- [x] ~~Hacer standalone los componentes `ExperiencesGalery` y `HotelesPorDepartamento`~~ ✅ Completado

### Bajo

- [x] ~~Estandarizar interfaces de auth — Mover `features/auth/interfaces/` a `interfaces/auth/`~~ ✅ Completado
- [x] ~~Extraer template inline de `ReservationDetailsComponent` a archivo `.html`~~ ✅ Completado (146 líneas → archivo externo, componente reducido de 195 a 48 líneas)
- [ ] Agregar `takeUntilDestroyed()` a subscripciones sin cleanup en componentes (excluido por usuario)
- [ ] Escribir tests unitarios (excluido por usuario)

---

## 4. Detalles de Cambios Realizados

### LoggerService (`core/services/logger.service.ts`)

Reemplaza ~100 llamadas a `console.log/error/warn` en 30+ archivos. Solo loguea en desarrollo.

### NotificationService + ToastComponent

Sistema de notificaciones toast con signals. Reemplaza 16 llamadas a `alert()` y 2 a `confirm()` en:
- `edit-reserva`, `list-reserva`, `update-page`, `create-hotel`, `list-hotel`
- `create-departamento`, `edit-departamento`, `list-departamento`, `navbar`

### Shared Pipes

- `CurrencySolPipe` — `{{ value | currencySol }}` → `S/ 123.45`
- `EstadoBadgePipe` — `[ngClass]="estado | estadoBadge"` → clases Tailwind por estado
- `FormatDatePipe` — `{{ date | formatDate }}` o `{{ date | formatDate:'long' }}`

Reemplazan métodos duplicados en 6 componentes: `list-reserva`, `dashboard-page`, `reserva-page`, `pago-page`, `mis-reservas-page`, `edit-reserva`.

### Guards con Cache

Los guards verifican primero el signal cacheado de `AuthService.isAuthenticated()` antes de hacer llamadas HTTP, reduciendo requests innecesarios en navegación.

### Consolidación de Services

| Service | Ubicación anterior | Ubicación nueva | Razón |
|---------|-------------------|-----------------|-------|
| `AuthService` | `features/auth/services/` | `core/services/` | Usado en 3 features + guards |
| `ReservaPublicService` | `features/home/services/` | `services/` | Usado en home + reservas |

### Barrel Exports

Creados `index.ts` en:
- `core/services/` — AuthService, LoggerService, NotificationService
- `core/guards/` — AuthGuard, AdminGuard, LoginGuard
- `shared/pipes/` — CurrencySolPipe, EstadoBadgePipe, FormatDatePipe
- `shared/directives/` — ClickOutsideDirective
- `shared/components/` — ToastComponent

---

## 5. Análisis de Nomenclatura de Componentes

### Convenciones de Angular

La convención moderna de Angular establece:

| Elemento | Convención | Ejemplo |
|----------|-----------|---------|
| Archivo | `kebab-case.component.ts` | `user-profile.component.ts` |
| Selector | `app-kebab-case` | `app-user-profile` |
| Clase | `PascalCase + Suffix` | `UserProfileComponent` |
| Directorio | `kebab-case` | `user-profile/` |

Para **pages**, el sufijo esperado es `PageComponent`. Para **components reutilizables**, solo `Component`. Para **layouts**, `LayoutComponent`.

### Análisis completo de selectores

| # | Selector | Archivo | Clase | Veredicto |
|---|----------|---------|-------|-----------|
| 1 | `app-login-page` | `login-page.component.ts` | `LoginPageComponent` | ✅ Correcto |
| 2 | `app-register-page` | `register-page.component.ts` | `RegisterPageComponent` | ✅ Correcto |
| 3 | `app-auth-layout` | `auth-layout.component.ts` | `AuthLayoutComponent` | ✅ Correcto |
| 4 | `app-admin-layout` | `admin-layout.component.ts` | `AdminLayoutComponent` | ✅ Correcto |
| 5 | `app-sidebar` | `sidebar.component.ts` | `SidebarComponent` | ✅ Correcto |
| 6 | `app-dashboard-page` | `dashboard-page.component.ts` | `DashboardPageComponent` | ✅ Correcto |
| 7 | `app-list-departamento` | `list-departamento.component.ts` | `ListDepartamentoPageComponent` | ✅ Corregido |
| 8 | `app-create-departamento` | `create-departamento.component.ts` | `CreateDepartamentoPageComponent` | ✅ Corregido |
| 9 | `app-edit-departamento` | `edit-departamento.component.ts` | `EditDepartamentoPageComponent` | ✅ Corregido |
| 10 | `app-list-hotel` | `list-hotel.component.ts` | `ListHotelPageComponent` | ✅ Correcto |
| 11 | `app-create-hotel` | `create-hotel.component.ts` | `CreateHotelPageComponent` | ✅ Correcto |
| 12 | `app-update-hotel` | `update-page.component.ts` | `UpdateHotelComponent` | ✅ Corregido |
| 13 | `app-select-departamento` | `select-departamento.component.ts` | `SelectDepartamentoHotelComponent` | ✅ Corregido |
| 14 | `app-list-reserva` | `list-reserva.component.ts` | `ListReservaPageComponent` | ✅ Corregido |
| 15 | `app-edit-reserva` | `edit-reserva.component.ts` | `EditReservaPageComponent` | ✅ Corregido |
| 16 | `app-home-page` | `home-page.component.ts` | `HomePageComponent` | ✅ Correcto |
| 17 | `app-departamentos-page` | `departamentos-page.component.ts` | `DepartamentosPageComponent` | ✅ Correcto |
| 18 | `app-hoteles-page` | `hoteles-page.component.ts` | `HotelesPageComponent` | ✅ Correcto |
| 19 | `app-pago-page` | `pago-page.component.ts` | `PagoPageComponent` | ✅ Correcto |
| 20 | `app-confirmacion-page` | `confirmacion-page.component.ts` | `ConfirmacionPageComponent` | ✅ Correcto |
| 21 | `app-reserva-page` | `reserva-page.component.ts` | `ReservaPageComponent` | ✅ Correcto |
| 22 | `app-mis-reservas-page` | `mis-reservas-page.component.ts` | `MisReservasPageComponent` | ✅ Correcto |
| 23 | `app-contacto-page` | `contacto-page.component.ts` | `ContactoPageComponent` | ✅ Correcto |
| 24 | `app-navbar` | `navbar.component.ts` | `NavbarComponent` | ✅ Correcto |
| 25 | `app-footer` | `footer.component.ts` | `FooterComponent` | ✅ Correcto |
| 26 | `app-cliente-layout` | `cliente-layout.component.ts` | `ClienteLayoutComponent` | ✅ Corregido |
| 27 | `app-card-hotel` | `card-hotel.component.ts` | `CardHotelComponent` | ✅ Corregido |
| 28 | `app-toast` | `toast.component.ts` | `ToastComponent` | ✅ Correcto |
| 29 | `app-info-alert` | `info-alert.component.ts` | `InfoAlertComponent` | ✅ Correcto |
| 30 | `app-action-buttons` | `action-buttons.component.ts` | `ActionButtonsComponent` | ✅ Correcto |
| 31 | `app-reservation-details` | `reservation-details.component.ts` | `ReservationDetailsComponent` | ✅ Correcto |
| 32 | `app-payment-alert` | `payment-alert.component.ts` | `PaymentAlertComponent` | ✅ Correcto |
| 33 | `app-reservation-header` | `reservation-header.component.ts` | `ReservationHeaderComponent` | ✅ Correcto |
| 34 | `app-navigation-links` | `navigation-links.component.ts` | `NavigationLinksComponent` | ✅ Correcto |
| 35 | `app-loading-spinner` | `loading-spinner.component.ts` | `LoadingSpinnerComponent` | ✅ Correcto |
| 36 | `app-error-display` | `error-display.component.ts` | `ErrorDisplayComponent` | ✅ Correcto |

### Problemas encontrados

#### ~~❌ Crítico: `UpdateHotelFormComponent` — Triple mismatch~~ ✅ Corregido

Clase renombrada a `UpdateHotelComponent`. Selector corregido a `app-update-hotel` en rutas.

#### ~~❌ Crítico: `CartHotelComponent` — Typo en clase~~ ✅ Corregido

Clase renombrada a `CardHotelComponent`.

#### ~~❌ Selector con `.component` en `ClienteLayoutComponent`~~ ✅ Corregido

Selector corregido a `app-cliente-layout`.

#### ~~⚠️ Inconsistencia en sufijos `PageComponent`~~ ✅ Corregido

5 componentes renombrados: `ListDepartamentoPageComponent`, `CreateDepartamentoPageComponent`, `EditDepartamentoPageComponent`, `ListReservaPageComponent`, `EditReservaPageComponent`.

#### ~~⚠️ Selector `app-select-departamento-hotel` no coincide con archivo~~ ✅ Corregido

Selector corregido a `app-select-departamento`.

#### Pendientes

#### ~~⚠️ Directorio de `auth-layout.component` tiene `.component`~~ ✅ Corregido

Directorio renombrado a `features/auth/layout/auth-layout/`. Import en `auth.routes.ts` actualizado.

#### ~~⚠️ Archivos sin sufijo `.component`~~ ✅ Corregido

- `experiences-galery.ts` → renombrado a `experiences-gallery.component.ts`. Clase: `ExperiencesGalleryComponent`. Selector: `app-experiences-gallery`. Standalone: true.
- `hoteles-por-departamento.ts` → renombrado a `hoteles-por-departamento.component.ts`. Clase: `HotelesPorDepartamentoComponent`. Standalone: true.

### ~~Nota sobre componentes inline vs template externo~~ ✅ Resuelto

~~Varios componentes usan `template:` inline en vez de `templateUrl:`.~~

`ReservationDetailsComponent` (el más largo, ~130 líneas) fue extraído a `reservation-details.component.html`. Los demás componentes inline son suficientemente pequeños para mantenerse inline.
