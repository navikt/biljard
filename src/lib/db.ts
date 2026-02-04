import Database from 'better-sqlite3';
import { existsSync, mkdirSync } from 'fs';
import { dirname, resolve } from 'path';

const dbPath = process.env.NODE_ENV === 'production'
  ? '/app/data/tournament.db'
  : resolve('./data/tournament.db');

const dir = dirname(dbPath);
if (!existsSync(dir)) {
  mkdirSync(dir, { recursive: true });
}

const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS tournaments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL DEFAULT 'round-robin',
    rounds INTEGER NOT NULL DEFAULT 10,
    round_duration_weeks INTEGER NOT NULL DEFAULT 2,
    registration_deadline TEXT,
    start_date TEXT,
    end_date TEXT,
    status TEXT NOT NULL DEFAULT 'registration',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS participants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tournament_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    nav_ident TEXT,
    slack_handle TEXT,
    registered_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id),
    UNIQUE(tournament_id, email)
  );

  CREATE TABLE IF NOT EXISTS matches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tournament_id INTEGER NOT NULL,
    round INTEGER NOT NULL,
    player1_id INTEGER NOT NULL,
    player2_id INTEGER NOT NULL,
    player1_score INTEGER,
    player2_score INTEGER,
    winner_id INTEGER,
    played_at TEXT,
    reported_by TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id),
    FOREIGN KEY (player1_id) REFERENCES participants(id),
    FOREIGN KEY (player2_id) REFERENCES participants(id)
  );
`);

export interface Tournament {
  id: number;
  name: string;
  description: string | null;
  type: string;
  rounds: number;
  round_duration_weeks: number;
  registration_deadline: string | null;
  start_date: string | null;
  end_date: string | null;
  status: string;
  created_at: string;
}

export interface Participant {
  id: number;
  tournament_id: number;
  name: string;
  email: string;
  nav_ident: string | null;
  slack_handle: string | null;
  registered_at: string;
}

export interface Match {
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
  created_at: string;
}

export function getAllTournaments(): Tournament[] {
  return db.prepare('SELECT * FROM tournaments ORDER BY created_at DESC').all() as Tournament[];
}

export function getTournamentById(id: number): Tournament | undefined {
  return db.prepare('SELECT * FROM tournaments WHERE id = ?').get(id) as Tournament | undefined;
}

export function createTournament(data: Omit<Tournament, 'id' | 'created_at'>): number {
  const stmt = db.prepare(`
    INSERT INTO tournaments (name, description, type, rounds, round_duration_weeks, registration_deadline, start_date, end_date, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(
    data.name,
    data.description,
    data.type,
    data.rounds,
    data.round_duration_weeks,
    data.registration_deadline,
    data.start_date,
    data.end_date,
    data.status
  );
  return result.lastInsertRowid as number;
}

export function updateTournament(id: number, data: Partial<Tournament>): void {
  const fields = Object.keys(data).filter(k => k !== 'id' && k !== 'created_at');
  const setClause = fields.map(f => `${f} = ?`).join(', ');
  const values = fields.map(f => (data as Record<string, unknown>)[f]);
  
  db.prepare(`UPDATE tournaments SET ${setClause} WHERE id = ?`).run(...values, id);
}

export function deleteTournament(id: number): void {
  db.prepare('DELETE FROM matches WHERE tournament_id = ?').run(id);
  db.prepare('DELETE FROM participants WHERE tournament_id = ?').run(id);
  db.prepare('DELETE FROM tournaments WHERE id = ?').run(id);
}

export function getParticipantsByTournament(tournamentId: number): Participant[] {
  return db.prepare('SELECT * FROM participants WHERE tournament_id = ? ORDER BY registered_at').all(tournamentId) as Participant[];
}

export function getParticipantById(id: number): Participant | undefined {
  return db.prepare('SELECT * FROM participants WHERE id = ?').get(id) as Participant | undefined;
}

export function registerParticipant(data: Omit<Participant, 'id' | 'registered_at'>): number {
  const stmt = db.prepare(`
    INSERT INTO participants (tournament_id, name, email, nav_ident, slack_handle)
    VALUES (?, ?, ?, ?, ?)
  `);
  const result = stmt.run(data.tournament_id, data.name, data.email, data.nav_ident, data.slack_handle);
  return result.lastInsertRowid as number;
}

export function removeParticipant(id: number): void {
  db.prepare('DELETE FROM participants WHERE id = ?').run(id);
}

export function updateParticipant(id: number, data: Partial<Participant>): void {
  const fields = Object.keys(data).filter(k => k !== 'id' && k !== 'registered_at' && k !== 'tournament_id');
  if (fields.length === 0) return;
  
  const setClause = fields.map(f => `${f} = ?`).join(', ');
  const values = fields.map(f => (data as Record<string, unknown>)[f]);
  
  db.prepare(`UPDATE participants SET ${setClause} WHERE id = ?`).run(...values, id);
}

export function getMatchesByTournament(tournamentId: number): Match[] {
  return db.prepare('SELECT * FROM matches WHERE tournament_id = ? ORDER BY round, id').all(tournamentId) as Match[];
}

export function getMatchesByRound(tournamentId: number, round: number): Match[] {
  return db.prepare('SELECT * FROM matches WHERE tournament_id = ? AND round = ? ORDER BY id').all(tournamentId, round) as Match[];
}

export function getMatchById(id: number): Match | undefined {
  return db.prepare('SELECT * FROM matches WHERE id = ?').get(id) as Match | undefined;
}

export function createMatch(data: Omit<Match, 'id' | 'created_at'>): number {
  const stmt = db.prepare(`
    INSERT INTO matches (tournament_id, round, player1_id, player2_id, player1_score, player2_score, winner_id, played_at, reported_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(
    data.tournament_id,
    data.round,
    data.player1_id,
    data.player2_id,
    data.player1_score,
    data.player2_score,
    data.winner_id,
    data.played_at,
    data.reported_by
  );
  return result.lastInsertRowid as number;
}

export function updateMatch(id: number, data: Partial<Match>): void {
  const fields = Object.keys(data).filter(k => k !== 'id' && k !== 'created_at');
  if (fields.length === 0) return;
  
  const setClause = fields.map(f => `${f} = ?`).join(', ');
  const values = fields.map(f => (data as Record<string, unknown>)[f]);
  
  db.prepare(`UPDATE matches SET ${setClause} WHERE id = ?`).run(...values, id);
}

export function deleteMatch(id: number): void {
  db.prepare('DELETE FROM matches WHERE id = ?').run(id);
}

export function deleteMatchesByTournament(tournamentId: number): void {
  db.prepare('DELETE FROM matches WHERE tournament_id = ?').run(tournamentId);
}

export function generateRoundRobinMatches(tournamentId: number): void {
  const participants = getParticipantsByTournament(tournamentId);
  const tournament = getTournamentById(tournamentId);
  if (!tournament || participants.length < 2) return;

  deleteMatchesByTournament(tournamentId);

  const rounds = tournament.rounds;
  
  for (let round = 1; round <= rounds; round++) {
    const usedPlayers = new Set<number>();
    const shuffled = [...participants].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < shuffled.length - 1; i += 2) {
      if (!usedPlayers.has(shuffled[i].id) && !usedPlayers.has(shuffled[i + 1].id)) {
        createMatch({
          tournament_id: tournamentId,
          round,
          player1_id: shuffled[i].id,
          player2_id: shuffled[i + 1].id,
          player1_score: null,
          player2_score: null,
          winner_id: null,
          played_at: null,
          reported_by: null
        });
        usedPlayers.add(shuffled[i].id);
        usedPlayers.add(shuffled[i + 1].id);
      }
    }
  }
}

export function getStandings(tournamentId: number): { participant: Participant; wins: number; losses: number; played: number }[] {
  const participants = getParticipantsByTournament(tournamentId);
  const matches = getMatchesByTournament(tournamentId);
  
  const standings = participants.map(p => {
    const playerMatches = matches.filter(m => 
      (m.player1_id === p.id || m.player2_id === p.id) && m.winner_id !== null
    );
    const wins = playerMatches.filter(m => m.winner_id === p.id).length;
    const losses = playerMatches.length - wins;
    
    return {
      participant: p,
      wins,
      losses,
      played: playerMatches.length
    };
  });
  
  return standings.sort((a, b) => b.wins - a.wins || a.losses - b.losses);
}

export default db;
