# Ayni – Sistema de Reservas (Frontend)

Frontend del sistema de reservas de hoteles, desarrollado con **Angular 21** utilizando patrones modernos como Signals, standalone components y Angular's new control flow.

## Tecnologías Principales

- Angular 21
- TypeScript
- Tailwind CSS
- Signals API
- Standalone Components

## Ejecutar el Proyecto

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm start

# Construir para producción
npm run build
```

## Estructura del Proyecto

```
src/app/
├── core/              # Interceptors, servicios globales
├── features/          # Módulos por característica
│   ├── auth/          # Autenticación
│   ├── admin/         # Panel de administración
│   ├── home/          # Página principal
│   └── reservas/      # Gestión de reservas
├── interfaces/        # Tipos y DTOs
└── services/          # Servicios de dominio
```

## Características

- Autenticación con JWT
- Diseño responsivo con Tailwind CSS
- Estado reactivo con Signals
- Lazy loading de módulos

## Repositorio Backend

https://github.com/osenpb/b_ayni_sistema_reservas