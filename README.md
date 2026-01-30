# 🎱 Biljardturnering

En fullstack webapplikasjon for å administrere biljardturneringer på arbeidsplassen. Bygget med Astro, React og NAV IT sitt designsystem Aksel.

## ✨ Funksjoner

- **Påmelding**: Deltakere kan melde seg på åpne turneringer med navn, e-post og Slack-brukernavn
- **Turneringstyper**: Støtter round-robin, utslagsturnering og Swiss-system
- **Fleksible innstillinger**: Konfigurerbart antall runder og varighet per runde
- **Administrasjon**: Admin-panel for å opprette turneringer, endre status, rapportere resultater og administrere deltakere
- **Tabell og resultater**: Automatisk oppdatert tabell basert på rapporterte resultater
- **Responsivt design**: Fungerer på desktop og mobil med NAV IT Aksel designsystem

## 🚀 Kom i gang

### Forutsetninger

- Node.js 18+
- npm

### Installasjon

```bash
npm install
```

### Utvikling

```bash
npm run dev
```

Åpne [http://localhost:4321](http://localhost:4321) i nettleseren.

### Produksjon

```bash
npm run build
node dist/server/entry.mjs
```

## 📁 Prosjektstruktur

```
src/
├── components/           # React-komponenter
│   ├── RegistrationForm.tsx
│   ├── CreateTournamentForm.tsx
│   └── TournamentAdmin.tsx
├── layouts/
│   └── Layout.astro      # Hovedlayout med navigasjon
├── lib/
│   └── db.ts             # Database (SQLite) og datamodeller
├── pages/
│   ├── index.astro       # Forside
│   ├── turneringer.astro # Oversikt over turneringer
│   ├── turnering/
│   │   └── [id].astro    # Turneringsdetaljer
│   ├── admin/
│   │   ├── index.astro   # Admin-oversikt
│   │   ├── ny-turnering.astro
│   │   └── turnering/
│   │       └── [id].astro # Admin for spesifikk turnering
│   └── api/              # API-endepunkter
│       ├── register.ts
│       ├── tournaments.ts
│       ├── matches.ts
│       └── participants.ts
data/
└── tournament.db         # SQLite database (opprettes automatisk)
```

## 🎯 Bruk

### For deltakere

1. Gå til forsiden og se aktive turneringer
2. Klikk på en turnering med åpen påmelding
3. Fyll ut påmeldingsskjemaet
4. Følg med på resultater og tabell

### For administratorer

1. Gå til `/admin`
2. Opprett en ny turnering med ønsket innstillinger
3. Når påmeldingsfristen er ute, klikk "Start turnering" for å generere kamper
4. Rapporter resultater etter hvert som kamper spilles
5. Avslutt turneringen når alle kamper er spilt

## 🛠 Teknologi

- **[Astro](https://astro.build/)** - Web-rammeverk
- **[React](https://react.dev/)** - UI-komponenter
- **[@navikt/ds-react](https://aksel.nav.no/)** - NAV IT designsystem (Aksel)
- **[better-sqlite3](https://github.com/WiseLibs/better-sqlite3)** - SQLite database
- **[@astrojs/node](https://docs.astro.build/en/guides/integrations-guide/node/)** - Server-side rendering

## 📝 Lisens

MIT
