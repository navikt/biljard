# Development Guidelines for Biljardturnering

## Project Overview
Astro SSR application for managing pool tournaments. Deployed on NAIS with Azure AD authentication via Wonderwall sidecar.

## Tech Stack
- **Framework**: Astro 5.x SSR with @astrojs/node
- **UI**: Starwind UI + Tailwind CSS 4.x
- **Database**: SQLite via better-sqlite3
- **Auth**: Azure AD via NAIS Wonderwall sidecar
- **Platform**: NAIS (Kubernetes)

## Project Structure
```
src/
├── components/          # Astro components
│   └── ui/              # Starwind UI components
├── layouts/             # Page layouts
├── lib/
│   └── db.ts            # Database layer
├── pages/
│   ├── api/             # REST API
│   │   └── internal/    # NAIS health endpoints
│   ├── admin/           # Admin pages (AD group protected)
│   └── turnering/       # Tournament pages
├── middleware.ts        # Auth middleware
└── env.d.ts             # TypeScript declarations
.nais/
└── app.yaml             # NAIS manifest
```

## Clean Code Standards
- **No Comments**: Write self-documenting code instead of adding comments
- **Descriptive Names**: Use clear, specific names for variables, functions, and components
- **Extract Functions**: Break complex logic into well-named functions
- **Type Safety**: Let TypeScript types serve as documentation
- **Small Functions**: Keep functions focused and easy to understand at a glance

## Authentication
- Wonderwall sidecar handles Azure AD login automatically
- User info available via `Astro.locals.user` (set by middleware)
- Admin routes (`/admin/*`) require membership in configured AD group
- Health endpoints (`/api/internal/*`) bypass auth

## Code Conventions
- **Files**: `PascalCase.astro`, `camelCase.ts`
- **UI Language**: Norwegian (Bokmål)
- **Code Language**: English
- **TypeScript**: Strict mode with `noUncheckedIndexedAccess`

## Commands
```bash
npm run dev      # Development server (localhost:8080)
npm run build    # Production build
```

## References
- [Astro](https://docs.astro.build)
- [Starwind UI](https://starwind.dev/)
- [NAIS](https://doc.nais.io/)