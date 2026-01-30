# Biljardturnering

En applikasjon for å administrere biljardturneringer på arbeidsplassen.

## Teknologier

- **[Astro](https://astro.build/)** - Web rammeverk
- **[React](https://reactjs.org/)** - UI bibliotek
- **[Starwind UI](https://starwind.dev/)** - UI komponenter og Tailwind CSS
- **SQLite** - Database (via `better-sqlite3`)

## Kom i gang

1. Installer avhengigheter:
   ```bash
   npm install
   ```

2. Start utviklingsserveren:
   ```bash
   npm run dev
   ```

3. Åpne nettleseren på `http://localhost:4321`

## Funksjonalitet

- Opprette turneringer (Round Robin, Utslag, Swiss)
- Melde seg på turneringer
- Generere kamper
- Registrere resultater
- Se tabell og oversikt

## Prosjektstruktur

- `src/pages` - Astro sider og API endpoints
- `src/components` - React komponenter
- `src/components/ui` - Starwind UI komponenter
- `src/layouts` - Layouts
- `src/lib` - Hjelpefunksjoner og database
- `data` - SQLite database fil