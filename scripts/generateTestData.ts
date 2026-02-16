import Database from 'better-sqlite3';
import { resolve, dirname } from 'path';
import { mkdirSync } from 'fs';

const dbPath = resolve('./data/tournament.db');
const dbDirectory = dirname(dbPath);
mkdirSync(dbDirectory, { recursive: true });
const db = new Database(dbPath);

interface TournamentConfig {
  name: string;
  description: string;
  participants: number;
  status: 'registration' | 'active' | 'completed';
  rounds?: number;
}

const FIRST_NAMES = ['Emma', 'Noah', 'Olivia', 'Liam', 'Ava', 'William', 'Sophia', 'James', 'Isabella', 'Oliver', 'Charlotte', 'Benjamin', 'Mia', 'Elijah', 'Amelia', 'Lucas', 'Harper', 'Mason', 'Evelyn', 'Logan'];
const LAST_NAMES = ['Hansen', 'Johansen', 'Olsen', 'Larsen', 'Andersen', 'Pedersen', 'Nilsen', 'Kristiansen', 'Jensen', 'Karlsen', 'Johnsen', 'Pettersen', 'Eriksen', 'Berg', 'Haugen', 'Hagen', 'Johannessen', 'Andreassen', 'Jacobsen', 'Dahl'];

function generatePerson(usedEmails: Set<string>) {
  let email: string;
  let firstName: string;
  let lastName: string;
  
  do {
    firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
    email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@nav.no`;
  } while (usedEmails.has(email));
  
  usedEmails.add(email);
  
  const name = `${firstName} ${lastName}`;
  const navIdent = `${firstName[0]}${Math.floor(100000 + Math.random() * 900000)}`;
  const slackHandle = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`;
  
  return { name, email, navIdent, slackHandle };
}

function addParticipants(tournamentId: number, count: number): number[] {
  const participantIds: number[] = [];
  const usedEmails = new Set<string>();
  const stmt = db.prepare(`
    INSERT INTO participants (tournament_id, name, email, nav_ident, slack_handle)
    VALUES (?, ?, ?, ?, ?)
  `);
  
  for (let i = 0; i < count; i++) {
    const person = generatePerson(usedEmails);
    const result = stmt.run(tournamentId, person.name, person.email, person.navIdent, person.slackHandle);
    participantIds.push(result.lastInsertRowid as number);
  }
  
  return participantIds;
}

function createTournament(config: TournamentConfig): number {
  const registrationDeadline = new Date();
  registrationDeadline.setDate(registrationDeadline.getDate() + 7);
  
  const startDate = new Date(registrationDeadline);
  startDate.setDate(startDate.getDate() + 1);
  
  const rounds = config.rounds ?? Math.max(5, Math.ceil(config.participants / 2));
  
  const stmt = db.prepare(`
    INSERT INTO tournaments (name, description, type, rounds, round_duration_weeks, registration_deadline, start_date, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  const result = stmt.run(
    config.name,
    config.description,
    'round-robin',
    rounds,
    2,
    registrationDeadline.toISOString(),
    startDate.toISOString(),
    config.status
  );
  
  return result.lastInsertRowid as number;
}

function generateMatches(tournamentId: number, participants: number[], rounds: number) {
  const stmt = db.prepare(`
    INSERT INTO matches (tournament_id, round, player1_id, player2_id, player1_score, player2_score, winner_id, played_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  for (let round = 1; round <= rounds; round++) {
    const shuffled = [...participants].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < shuffled.length - 1; i += 2) {
      const player1 = shuffled[i];
      const player2 = shuffled[i + 1];
      const shouldHaveResult = Math.random() > 0.3;
      
      if (shouldHaveResult) {
        const player1Score = Math.floor(Math.random() * 4);
        const player2Score = Math.floor(Math.random() * 4);
        const winnerId = player1Score > player2Score ? player1 : player2;
        const playedAt = new Date();
        playedAt.setDate(playedAt.getDate() - Math.floor(Math.random() * 30));
        
        stmt.run(tournamentId, round, player1, player2, player1Score, player2Score, winnerId, playedAt.toISOString());
      } else {
        stmt.run(tournamentId, round, player1, player2, null, null, null, null);
      }
    }
  }
}

function cleanDatabase() {
  db.exec(`
    DELETE FROM matches;
    DELETE FROM participants;
    DELETE FROM tournaments;
  `);
  console.log('✓ Database cleaned');
}

function generateTestData() {
  const configurations: TournamentConfig[] = [
    {
      name: 'Vårens Biljardturnering 2024',
      description: 'Tradisjonell vårturnering med mange deltakere. Alle er velkomne!',
      participants: 24,
      status: 'registration'
    },
    {
      name: 'Sommer Cup Quick Fire',
      description: 'Kort og intens turnering før ferien starter.',
      participants: 8,
      status: 'active'
    },
    {
      name: 'Høstmesterskap',
      description: 'Den store årets turnering med premier til topp 3!',
      participants: 16,
      status: 'active'
    },
    {
      name: 'Juleturnering 2023',
      description: 'Avsluttet juleturnering med gode minner.',
      participants: 12,
      status: 'completed'
    },
    {
      name: 'Mini Turnering',
      description: 'Test med få deltakere.',
      participants: 4,
      status: 'active',
      rounds: 3
    },
    {
      name: 'Mega Turnering',
      description: 'Stort arrangement med mange runder.',
      participants: 32,
      status: 'registration'
    }
  ];
  
  console.log('Generating test data...\n');
  
  configurations.forEach((config, index) => {
    console.log(`${index + 1}. Creating "${config.name}"...`);
    const tournamentId = createTournament(config);
    console.log(`   ✓ Tournament created (ID: ${tournamentId})`);
    
    const participantIds = addParticipants(tournamentId, config.participants);
    console.log(`   ✓ Added ${config.participants} participants`);
    
    if (config.status === 'active' || config.status === 'completed') {
      const rounds = config.rounds ?? Math.max(5, Math.ceil(config.participants / 2));
      generateMatches(tournamentId, participantIds, rounds);
      console.log(`   ✓ Generated matches for ${rounds} rounds`);
    }
    
    console.log('');
  });
  
  console.log('✅ Test data generation complete!');
}

const command = process.argv[2];

if (command === 'clean') {
  cleanDatabase();
} else if (command === 'generate') {
  cleanDatabase();
  generateTestData();
} else {
  console.log(`
Usage:
  pnpm test-data clean     - Remove all data
  pnpm test-data generate  - Clean and generate new test data
  `);
}