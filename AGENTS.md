# AGENTS.md - Development Guidelines for DAWI Frontend

This document provides comprehensive guidelines for AI agents working on the DAWI Frontend Angular application. It covers build commands, testing, code style, architecture patterns, and development conventions.

## Project Overview

- **Framework**: Angular 20.3.0
- **Language**: TypeScript 5.9.2
- **Styling**: Tailwind CSS 4.1.17
- **Architecture**: Standalone components with signals-based reactive state management
- **Backend**: REST API integration

## Build and Development Commands

### Development Server
```bash
npm start          # Start development server on http://localhost:4200
ng serve          # Alternative command for development server
```

### Building
```bash
npm run build     # Production build with optimizations
ng build         # Alternative production build command

npm run watch    # Development build with file watching
ng build --watch --configuration development  # Alternative watch command
```

### Testing
```bash
npm test         # Run unit tests with Karma/Jasmine
ng test         # Alternative test command

# Run specific test file
ng test --include="**/component-name.component.spec.ts"

# Run tests in watch mode
ng test --watch

# Run tests with code coverage
ng test --code-coverage
```

### Linting and Formatting
```bash
# Format code with Prettier
npx prettier --write "src/**/*.{ts,html,css,scss,json}"

# Check formatting
npx prettier --check "src/**/*.{ts,html,css,scss,json}"

# Note: ESLint is not configured in this project
```

### Additional Angular CLI Commands
```bash
# Generate new component
ng generate component component-name --standalone

# Generate new service
ng generate service service-name

# Generate new interface
ng generate interface interface-name
```

## Code Style Guidelines

### TypeScript Configuration
- **Strict Mode**: Enabled with comprehensive type checking
- **Target**: ES2022 modules
- **Import Helpers**: Enabled for smaller bundles
- **Angular Compiler Options**:
  - `strictInjectionParameters`: true
  - `strictInputAccessModifiers`: true
  - `strictTemplates`: true
  - `typeCheckHostBindings`: true

### Formatting (Prettier)
```json
{
  "printWidth": 100,
  "singleQuote": true,
  "overrides": [
    {
      "files": "*.html",
      "options": {
        "parser": "angular"
      }
    }
  ]
}
```

### EditorConfig
```ini
[*]
charset = utf-8
indent_style = space
indent_size = 2
insert_final_newline = true
trim_trailing_whitespace = true

[*.ts]
quote_type = single
ij_typescript_use_double_quotes = false

[*.md]
max_line_length = off
trim_trailing_whitespace = false
```

### Naming Conventions

#### Files and Directories
- **Components**: `component-name.component.ts`
- **Services**: `service-name.service.ts`
- **Interfaces**: `interface-name.interface.ts` or `interface-name-response.interface.ts`
- **Directories**: kebab-case (e.g., `reserva-page`, `auth-services`)

#### Code Elements
- **Classes**: PascalCase (e.g., `ReservaService`, `ListReservaComponent`)
- **Methods**: camelCase (e.g., `getAll()`, `loadReservas()`, `buscarPorDni()`)
- **Properties**: camelCase (e.g., `reservas`, `loading`, `successMessage`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `baseUrl`)
- **Interfaces**: PascalCase with descriptive suffixes (e.g., `ReservaListResponse`, `HotelRequest`)
- **Types**: PascalCase (e.g., `EstadoReserva`, `MisReservasResponse`)

#### Angular-Specific
- **Component Selectors**: `app-component-name` (prefix: `app-`)
- **Signals**: Descriptive names ending with signal type (e.g., `loading = signal<boolean>(true)`)
- **Route Paths**: kebab-case (e.g., `reserva-page`, `list-reserva`)

### Import Organization
```typescript
// 1. Angular imports (grouped by @angular/*)
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

// 2. Third-party libraries
import { Observable, catchError, throwError } from 'rxjs';

// 3. Local interfaces/types (barrel imports preferred)
import { ReservaListResponse, ReservaAdminUpdateDTO } from '../interfaces';

// 4. Local services/utilities
import { ReservaService } from '../../../../services/reserva.service';

// 5. Environment configuration
import { environment } from '../../environments/environments';
```

### Component Structure

#### Standalone Components
```typescript
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-component-name',
  imports: [CommonModule],
  templateUrl: './component-name.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush, // Preferred for performance
})
export class ComponentNameComponent {
  // Services injected at top
  private service = inject(ServiceName);

  // Signals for reactive state
  data = signal<DataType[]>([]);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  constructor() {
    // Initialize in constructor or ngOnInit
    this.loadData();
  }

  // Public methods
  loadData(): void {
    this.loading.set(true);
    // Implementation
  }

  // Private methods
  private handleError(error: any): void {
    console.error('Error:', error);
    this.error.set('An error occurred');
    this.loading.set(false);
  }
}
```

#### Services
```typescript
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ServiceName {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/endpoint`;

  getAll(): Observable<ResponseType[]> {
    return this.http.get<ResponseType[]>(this.baseUrl).pipe(
      catchError((error: any) => {
        console.error('Error fetching data:', error);
        return throwError(() => error);
      })
    );
  }

  getById(id: number): Observable<ResponseType> {
    return this.http.get<ResponseType>(`${this.baseUrl}/${id}`).pipe(
      catchError((error: any) => {
        console.error('Error fetching item:', error);
        return throwError(() => error);
      })
    );
  }
}
```

### Interface Design
```typescript
// Use descriptive names with context
export interface ReservaListResponse {
  id: number;
  fechaReserva: string;
  fechaInicio: string;
  fechaFin: string;
  total: number;
  estado: string;
  hotel: HotelSimple;
  cliente: ClienteSimple;
  detalles: DetalleSimple[];
}

// Use union types for flexible responses
export type MisReservasResponse = ReservaListResponse[] | MisReservasVacio;

// Use type aliases for readability
export type EstadoReserva = 'CONFIRMADA' | 'CANCELADA' | 'PENDIENTE';

// Document interfaces with JSDoc
/**
 * DTO de listado de reservas (admin y público)
 * Coincide con backend ReservaListResponse.java
 */
export interface ReservaListResponse {
  // ...
}
```

### Error Handling
```typescript
// In services - use catchError and throwError
return this.http.get<DataType>(url).pipe(
  catchError((error: any) => {
    console.error('Descriptive error message:', error);
    return throwError(() => error);
  })
);

// In components - handle errors gracefully
this.service.getData().subscribe({
  next: (data) => {
    this.data.set(data);
    this.loading.set(false);
  },
  error: (err) => {
    console.error('Error loading data', err);
    this.error.set('Failed to load data');
    this.loading.set(false);
  },
});
```

### HTTP Client Usage
```typescript
// GET requests
getData(): Observable<DataType> {
  return this.http.get<DataType>(`${this.baseUrl}/data`);
}

// POST requests
createData(data: CreateDataType): Observable<ResponseType> {
  return this.http.post<ResponseType>(`${this.baseUrl}/data`, data);
}

// PUT requests with path parameters
updateData(id: number, data: UpdateDataType): Observable<ResponseType> {
  return this.http.put<ResponseType>(`${this.baseUrl}/data/${id}`, data);
}

// DELETE requests
deleteData(id: number): Observable<void> {
  return this.http.delete<void>(`${this.baseUrl}/data/${id}`);
}

// Requests with query parameters
searchData(params: SearchParams): Observable<DataType[]> {
  return this.http.get<DataType[]>(`${this.baseUrl}/search`, {
    params: { ...params }
  });
}
```

### Reactive State Management (Signals)
```typescript
// Signal declarations
data = signal<DataType[]>([]);
loading = signal<boolean>(false);
error = signal<string | null>(null);
filterValue = signal<string>('');

// Updating signals
this.data.set(newData);
this.loading.update(current => !current); // Toggle
this.error.set('Error message');

// Computed signals (derived state)
filteredData = computed(() => {
  const data = this.data();
  const filter = this.filterValue();
  return data.filter(item => item.name.includes(filter));
});

// Effects for side effects
effect(() => {
  const loading = this.loading();
  if (loading) {
    console.log('Loading started');
  }
});
```

### Routing
```typescript
// Route configuration
export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.routes').then(m => m.ADMIN_ROUTES),
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: ''
  }
];

// Navigation in components
import { Router } from '@angular/router';

export class Component {
  private router = inject(Router);

  navigateToDetail(id: number): void {
    this.router.navigate(['/detail', id]);
  }

  navigateWithQueryParams(): void {
    this.router.navigate(['/search'], {
      queryParams: { q: 'term', page: 1 }
    });
  }
}
```

### Dependency Injection
```typescript
// Preferred: inject() function (Angular 14+)
export class MyComponent {
  private service = inject(MyService);
  private router = inject(Router);
}

// Constructor injection (still valid)
export class MyComponent {
  constructor(
    private service: MyService,
    private router: Router
  ) {}
}
```

### Template Conventions
```html
<!-- Use semantic HTML -->
<main class="container mx-auto p-4">
  <!-- Prefer *ngIf over hidden -->
 
 @if(loading()) {
  <div class="loading-spinner">
      Loading...
    </div>
 }


  <!-- Use trackBy for *ngFor performance -->

   @for(let item of items() ) {
      <div class="item">
    {{ item.name }}
  </div>

   }

  <!-- Signal binding syntax -->
  <input
    [value]="searchTerm()"
    (input)="searchTerm.set($event.target.value)"
    placeholder="Search..."
  />

  <!-- Event binding with proper typing -->
  <button (click)="onSubmit($event)" [disabled]="loading()">
    Submit
  </button>
</main>
```

### CSS/Styling
```css
/* Prefer Tailwind CSS classes in templates */
/* Component-specific styles in .component.css */
.component-name {
  @apply bg-white rounded-lg shadow-md p-4;
}

/* Avoid deep selectors */
:host {
  display: block;
}

/* Use CSS custom properties for theming */
:host {
  --primary-color: #007bff;
  --border-radius: 0.375rem;
}
```

### Testing Conventions
```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';

describe('ComponentNameComponent', () => {
  let component: ComponentNameComponent;
  let fixture: ComponentFixture<ComponentNameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComponentNameComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ComponentNameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load data on init', () => {
    spyOn(component, 'loadData');
    component.ngOnInit();
    expect(component.loadData).toHaveBeenCalled();
  });
});
```

### File Organization

```
src/
├── app/
│   ├── core/                    # Core functionality (guards, interceptors)
│   ├── shared/                  # Shared components, pipes, directives
│   ├── features/               # Feature modules
│   │   ├── auth/               # Authentication feature
│   │   │   ├── pages/          # Page components
│   │   │   ├── services/       # Feature-specific services
│   │   │   └── auth.routes.ts  # Feature routing
│   │   ├── admin/              # Admin feature
│   │   └── home/               # Public/home feature
│   ├── services/               # Application-wide services
│   ├── interfaces/             # TypeScript interfaces
│   │   ├── index.ts           # Barrel exports
│   │   └── feature/           # Feature-specific interfaces
│   └── app.config.ts          # Application configuration
├── environments/               # Environment configurations
├── styles.css                 # Global styles
└── main.ts                    # Application bootstrap
```

### Commit Message Conventions
```
feat: add user authentication feature
fix: resolve memory leak in reserva service
docs: update AGENTS.md with testing guidelines
style: format code with prettier
refactor: extract common interface types
test: add unit tests for reserva component
chore: update angular to version 20.3.0
```

### Performance Considerations
- Use `ChangeDetectionStrategy.OnPush` for components
- Implement lazy loading for feature modules
- Use `trackBy` functions in `for` directives
- Prefer signals over traditional change detection
- Implement virtual scrolling for large lists
- Use Angular's built-in optimizations (tree-shakable providers, etc.)

### Security Best Practices
- Validate all user inputs
- Use HttpClient's built-in XSS protection
- Implement proper authentication guards
- Avoid storing sensitive data in localStorage
- Use environment variables for API endpoints
- Implement proper error boundaries
- Validate API responses with interfaces

### Accessibility Guidelines
- Use semantic HTML elements
- Provide proper ARIA labels
- Ensure keyboard navigation support
- Maintain sufficient color contrast
- Add alt text for images
- Use proper heading hierarchy

This document should be updated as the project evolves and new patterns emerge.</content>
<parameter name="filePath">AGENTS.md


### 

Use the new stable sintaxis from Angular 20
