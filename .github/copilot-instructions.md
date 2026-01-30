# Development Guidelines for Biljardturnering

## Project Overview
This is a fullstack Astro SSR application for managing pool/billiard tournaments at the workplace. It features tournament creation, participant registration, match scheduling, result reporting, and standings tracking, using the NAV Aksel design system v8.

## Tech Stack
- **Framework**: Astro 5.x with SSR mode (@astrojs/node adapter)
- **UI Library**: React 19.x
- **Design System**: NAV Aksel v8 (@navikt/ds-react ^8.x, @navikt/ds-css ^8.x, @navikt/aksel-icons ^8.x)
- **Database**: SQLite via better-sqlite3 (file-based persistence)
- **Type Safety**: TypeScript with strict mode
- **Package Manager**: npm
- **Node**: >=18

> **IMPORTANT**: This project uses Aksel v8 (January 2026). See `.github/instructions/aksel-instructions.md` for v8-specific patterns. Key changes:
> - CSS classes use `.aksel` prefix (not `.navds`)
> - Design tokens use `--ax` prefix (not `--a`)
> - Native dark mode support via `light`/`dark` class on root element

## Project Structure
```
src/
├── components/          # React components (TSX)
│   ├── RegistrationForm.tsx
│   ├── CreateTournamentForm.tsx
│   └── TournamentAdmin.tsx
├── layouts/
│   └── Layout.astro     # Main layout with navigation
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
- React components: `PascalCase.tsx` (e.g., `RegistrationForm.tsx`)
- TypeScript utilities: `camelCase.ts` (e.g., `db.ts`)
- API routes: `camelCase.ts` (e.g., `tournaments.ts`)

### TypeScript Patterns
- Use strict TypeScript configuration with `noUncheckedIndexedAccess`
- Define explicit interfaces for all component props
- Use `undefined` instead of `null` for optional values
- Create type-safe API response interfaces
- Use Zod schemas for API input validation when complexity warrants it

### React Component Patterns
- Use functional components with hooks
- Prefer `useCallback` for event handlers passed to children
- Use `useMemo` for expensive computations
- Import types using `type` keyword: `import { type FormEvent } from 'react'`
- Avoid `any` type - use `unknown` and type guards instead

### State Management
- Use React's built-in `useState` and `useCallback` hooks
- Keep state close to where it's used
- Lift state up only when necessary for shared data

## Astro Best Practices

### SSR Configuration
- The app uses `output: 'server'` mode with `@astrojs/node` adapter
- API routes are server-side only (no client-side fetch during SSR)
- Use `client:load` directive for React components that need interactivity

### Page Structure
```astro
---
// Frontmatter: Server-side code
import Layout from '../layouts/Layout.astro';
import { getDataFromDb } from '../lib/db';

const data = getDataFromDb();
---

<Layout title="Page Title">
  <!-- Static content -->
  <ReactComponent client:load data={data} />
</Layout>
```

### API Routes
- Place API routes in `src/pages/api/`
- Export named functions for HTTP methods: `GET`, `POST`, `PUT`, `DELETE`
- Return `Response` objects with proper status codes
- Use JSON for request/response bodies

```typescript
import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json();
  // ... handle request
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
```

## Database Layer

### SQLite with better-sqlite3
- Database file stored in `data/tournament.db`
- Database and tables auto-created on first access
- Use synchronous API (better-sqlite3 is synchronous by design)
- Export typed functions for all database operations

### Data Models
```typescript
interface Tournament {
  id: number;
  name: string;
  description: string | null;
  type: 'round-robin' | 'knockout' | 'swiss';
  rounds: number;
  round_duration_weeks: number;
  registration_deadline: string | null;
  start_date: string | null;
  end_date: string | null;
  status: 'registration' | 'active' | 'completed';
  created_at: string;
}

interface Participant {
  id: number;
  tournament_id: number;
  name: string;
  email: string;
  slack_handle: string | null;
  registered_at: string;
}

interface Match {
  id: number;
  tournament_id: number;
  round: number;
  player1_id: number;
  player2_id: number;
  player1_score: number | null;
  player2_score: number | null;
  winner_id: number | null;
  played_at: string | null;
  reported_by: string | null;
}
```

## NAV Aksel Design System v8

> **Version**: This project uses Aksel v8 (January 2026). See `.github/instructions/aksel-instructions.md` for detailed component patterns.

### Key v8 Changes
- All CSS classes now use `.aksel` prefix (was `.navds`)
- Design tokens use `--ax` prefix (was `--a`)
- Native dark mode: toggle via `light`/`dark` class on `<html>`
- No Theme wrapper component needed
- CSS bundle ~20% smaller with CSS layers

### Component Usage
- Import components from `@navikt/ds-react` (^8.x)
- Import icons from `@navikt/aksel-icons` (^8.x)
- Import CSS once in layout: `import "@navikt/ds-css"`

### Common Components
```typescript
import { 
  Button, 
  TextField, 
  Select, 
  Alert, 
  Table, 
  Heading, 
  BodyLong,
  Tag,
  Modal,
  ConfirmationPanel,
  Box,
  VStack,
  HStack,
  HGrid
} from '@navikt/ds-react';
```

### Styling Guidelines (v8)
```css
/* Use --ax prefixed tokens in v8 */
.custom-element {
  padding: var(--ax-spacing-4);
  color: var(--ax-text-default);
  background: var(--ax-surface-subtle);
  border-radius: var(--ax-border-radius-medium);
}
```

### Spacing Tokens
Use with Box component's padding/margin props:
- `space-4` (4px), `space-8` (8px), `space-12` (12px)
- `space-16` (16px), `space-20` (20px), `space-24` (24px)
- `space-32` (32px), `space-40` (40px)

```tsx
<Box padding={{ xs: "space-16", md: "space-24" }}>
  {/* Content */}
</Box>
```

## Accessibility Requirements

### WCAG Compliance
- All interactive elements must be keyboard accessible
- Use semantic HTML elements (`<nav>`, `<main>`, `<button>`)
- Include ARIA attributes where needed (`aria-label`, `aria-describedby`)
- Ensure color contrast meets WCAG AA standards (4.5:1 for text)
- Provide visible focus states on all interactive elements

### Patterns Used
- Skip-link for keyboard navigation
- `role="tablist"` and `role="tab"` for tab interfaces
- `aria-live="polite"` for dynamic content updates
- `visually-hidden` class for screen reader-only content

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

## Production Deployment
```bash
npm run build
node dist/server/entry.mjs
```

The SQLite database persists in the `data/` directory. Ensure this directory has write permissions and is backed up appropriately.

## Error Handling
- Use try/catch for all async operations
- Return appropriate HTTP status codes (400, 404, 500)
- Display user-friendly error messages in Norwegian
- Log errors server-side for debugging

## Testing (Future)
- Use Vitest for unit tests
- Use Playwright for E2E tests
- Follow patterns from `.github/agents/nodejs-javascript-vitest.instructions.md`

## Documentation References
- Astro docs: https://docs.astro.build
- NAV Aksel v8 changelog: https://aksel.nav.no/grunnleggende/endringslogg/versjon-8
- NAV Aksel components: https://aksel.nav.no/komponenter
- NAV Aksel icons: https://aksel.nav.no/ikoner
- NAV Aksel tokens: https://aksel.nav.no/grunnleggende/styling/design-tokens
- better-sqlite3: https://github.com/WiseLibs/better-sqlite3
