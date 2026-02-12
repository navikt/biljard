# Biljardturnering

En work in progress applikasjon som skal kunne administrere biljardturneringer i Nav.

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

3. Åpne en nettleser på adressen `http://localhost:8080`

## Funksjonalitet // TODO

- Opprette turneringer (Round Robin, Utslag, Swiss)
- Melde seg på turneringer med ett klikk (autentisert via Azure AD)
- Generere kamper
- Registrere resultater
- Se tabell og oversikt

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
