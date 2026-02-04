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

## Deployment til NAIS

### Forutsetninger

1. Opprett en AD-gruppe for administratorer i Azure AD
2. Oppdater `.nais/app.yaml` med:
   - `namespace` og `team`
   - `ADMIN_GROUP_ID` med din AD-gruppe ID
   - `ingresses` med ønsket URL

### Deploy

Push til `main`-branchen trigger automatisk deploy via GitHub Actions.

Manuelt:

```bash
# Build
npm run build

# Deploy (krever nais-cli)
nais deploy --cluster=dev-gcp --resource=.nais/app.yaml
```

### Autentisering

Appen bruker [Wonderwall](https://doc.nais.io/auth/entra-id/how-to/login/) sidecar for autentisering:

- **Alle ansatte** kan se turneringer og melde seg på
- **Admin-gruppe** kan opprette/administrere turneringer

## Miljøvariabler

| Variabel | Beskrivelse |
|----------|-------------|
| `ADMIN_GROUP_ID` | Azure AD gruppe-ID for administratorer |

## Lokalt utvikling

I utviklingsmodus (`npm run dev`) er autentisering deaktivert og du får en test-bruker automatisk.
