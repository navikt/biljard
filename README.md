# Biljardturnering

En applikasjon for å administrere biljardturneringer.

## Teknologier

- **[Astro](https://astro.build/)** - Web rammeverk med SSR
- **[Starwind UI](https://starwind.dev/)** - UI komponenter og Tailwind CSS
- **SQLite** - Database (via `better-sqlite3`)
- **NAIS** - Plattform med Wonderwall sidecar for autentisering

## Kom i gang

1. Installer avhengigheter:

   ```bash
   npm install
   ```

2. Start utviklingsserveren:

   ```bash
   npm run dev
   ```

3. Åpne nettleseren på `http://localhost:8080`

## Funksjonalitet

- Opprette turneringer (Round Robin, Utslag, Swiss)
- Melde seg på turneringer med ett klikk (autentisert via Azure AD)
- Generere kamper
- Registrere resultater
- Se tabell og oversikt

## Prosjektstruktur

```
src/
├── components/          # Astro komponenter
│   └── ui/              # Starwind UI komponenter
├── layouts/             # Layouts
├── lib/                 # Database og hjelpefunksjoner
├── pages/               # Astro sider og API endpoints
│   ├── api/             # REST API
│   │   └── internal/    # NAIS health endpoints
│   ├── admin/           # Admin-sider (krever AD-gruppe)
│   └── turnering/       # Turneringssider
├── middleware.ts        # Auth middleware
└── env.d.ts             # TypeScript deklarasjoner
.nais/
└── app.yaml             # NAIS manifest
```

### Autentisering

Appen bruker [Wonderwall](https://doc.nais.io/auth/entra-id/how-to/login/) sidecar for autentisering:

- **Alle ansatte** kan se turneringer og melde seg på
- **Admin-gruppe** kan opprette/administrere turneringer

## Lokalt utvikling

I utviklingsmodus (`npm run dev`) får du automatisk en test-bruker med admin-tilgang.

### Test som vanlig bruker

Legg til `?admin=false` i URL-en for å teste som ikke-admin:

```
http://localhost:8080/turneringer?admin=false
```

### Reset database

```bash
# Via API (kun i dev)
curl -X POST http://localhost:8080/api/dev/reset

# Eller slett filen
rm data/tournament.db
```

### Kjør tester

```bash
npm test           # Kjør en gang
npm run test:watch # Kjør kontinuerlig
```
