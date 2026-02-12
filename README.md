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
