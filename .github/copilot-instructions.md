# Development Guidelines for Biljardturnering

## Project Overview
This is a fullstack Astro SSR application for managing pool/billiard tournaments at the workplace. It features tournament creation, participant registration, match scheduling, result reporting, and standings tracking, using the **Starwind UI** library and **Tailwind CSS**.

## Tech Stack
- **Framework**: Astro 5.x with SSR mode (@astrojs/node adapter)
- **UI Components**: Starwind UI (Pure Astro components)
- **Styling**: Tailwind CSS 4.x
- **Database**: SQLite via better-sqlite3 (file-based persistence)
- **Type Safety**: TypeScript with strict mode
- **Package Manager**: npm
- **Node**: >=18

## Project Structure
```
src/
├── components/          # Astro components
│   ├── ui/              # Starwind UI components
│   ├── RegistrationForm.astro
│   ├── CreateTournamentForm.astro
│   ├── TournamentAdmin.astro
│   └── TournamentTabs.astro
├── layouts/
│   └── Layout.astro     # Main layout with navigation
├── styles/
│   └── starwind.css     # Global Tailwind styles and theme
├── lib/
│   └── db.ts            # Database layer and type definitions
├── pages/
│   ├── index.astro      # Homepage
│   ├── turneringer.astro # Tournament listing
│   ├── turnering/
│   │   └── [id].astro   # Tournament detail page
│   ├── admin/
│   │   ├── index.astro  # Admin dashboard
│   │   ├── ny-turnering.astro
│   │   └── turnering/
│   │       └── [id].astro # Tournament admin page
│   └── api/             # REST API endpoints
│       ├── register.ts
│       ├── tournaments.ts
│       ├── matches.ts
│       └── participants.ts
data/
└── tournament.db        # SQLite database (auto-created)
```

## Code Style & Conventions

### File Naming
- Astro components: `PascalCase.astro` (e.g., `Layout.astro`)
- TypeScript utilities: `camelCase.ts` (e.g., `db.ts`)
- API routes: `camelCase.ts` (e.g., `tournaments.ts`)

### TypeScript Patterns
- Use strict TypeScript configuration with `noUncheckedIndexedAccess`
- Define explicit interfaces for all component props
- Use `undefined` instead of `null` for optional values
- Create type-safe API response interfaces

### Interactivity
- Use Astro's built-in interactivity patterns.
- Starwind components handle their own client-side behavior via vanilla JS in `<script>` tags.
- For custom page logic, prefer vanilla JS in `<script>` tags within `.astro` files.

## Astro Best Practices

### SSR Configuration
- The app uses `output: 'server'` mode with `@astrojs/node` adapter.
- API routes handle data mutations.

### Page Structure
```astro
---
// Frontmatter: Server-side code
import Layout from '../layouts/Layout.astro';
import { getDataFromDb } from '../lib/db';

const data = getDataFromDb();
---

<Layout title="Page Title">
  <!-- Static and interactive content -->
  <MyAstroComponent data={data} />
</Layout>
```

### API Routes
- Place API routes in `src/pages/api/`
- Export named functions for HTTP methods: `GET`, `POST`, `PUT`, `DELETE`
- Return `Response` objects with proper status codes
- Use JSON for request/response bodies

## Starwind UI & Tailwind CSS

- **Tailwind CSS**: Starwind is built on top of Tailwind CSS. Use Tailwind utility classes for layout and spacing.
- **Components**: Pre-built components are located in `src/components/ui`.
- **Customization**: Theme variables are in `src/styles/starwind.css`.

### Usage
Import components from `@/components/ui/...`:

```astro
---
import { Button } from "@/components/ui/button";
---
<Button>Click me</Button>
```

## Accessibility Requirements

### WCAG Compliance
- All interactive elements must be keyboard accessible.
- Use semantic HTML elements (`<nav>`, `<main>`, `<button>`).
- Include ARIA attributes where needed.
- Starwind components are designed with accessibility in mind.

## Language
- **UI Language**: Norwegian (Bokmål)
- **Code**: English (variable names, comments, types)
- All user-facing text should be in Norwegian

## Commands
```bash
npm run dev      # Start development server (localhost:4321)
npm run build    # Build for production
npm run preview  # Preview production build
```

## Documentation References
- Astro docs: https://docs.astro.build
- Starwind UI: https://starwind.dev/
- Tailwind CSS: https://tailwindcss.com/
- better-sqlite3: https://github.com/WiseLibs/better-sqlite3