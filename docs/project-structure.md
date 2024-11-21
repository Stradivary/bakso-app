---
title: Project Structure
nav_order: 4
---

# **Project Structure 📁**

 

## Root Configuration Files
- `package.json`: Dependency management and scripts
- `tsconfig.json`: TypeScript configuration
- `vite.config.ts`: Vite build configuration
- `vitest.config.ts`: Testing configuration
- `eslint.config.js`: Linting configuration
- `ecosystem.config.js`: Likely PM2 process management configuration
- `commitlint.config.js`: Commit message linting
- `sonar-project.properties`: SonarQube configuration

## Project Architecture
```
bakso-app/
├── src/                # Vite React application
|   ├── data/           # Data models and type definitions
|   ├── domain/         # Business logic and services
|   ├── presentation/   # React components and views
|   └── shared/         # Reusable utilities and hooks
├── public/             # Static assets and diagrams
├── LICENSE             # Licensing information
└── README.md           # Project documentation
```

## Key Architectural Components

### 1. Data Layer (`src/data/`)
- Defines TypeScript interfaces and types
- Key models:
  - `LoginModel.ts`
  - `BroadcastMapModel.ts`
  - `supabase.types.ts`

### 2. Domain Layer (`src/domain/`)
- Services:
  - `authService.ts`: Authentication logic
  - `supabaseService.ts`: Supabase interaction
  - `trackerServices.ts`: Tracking-related operations

- Use Cases:
  - `calculateDistance.ts`
  - `calculateRegion.ts`
  - `createPingPayload.ts`
  - `filterNearbyUsers.ts`

### 3. Presentation Layer (`src/presentation/`)
- Components:
  - Reusable components like `ProtectedRoute.tsx`
  - Providers for authentication, routing, and theming
- Views:
  - `LoginView`
  - `MapView`

### 4. Shared Resources (`src/shared/`)
- Hooks:
  - `useLocation.ts`
  - `useLocationUpdater.ts`
  - `useNotification.ts`
- Utilities:
  - `constants.ts`
