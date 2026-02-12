import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import { existsSync, unlinkSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { initializeSchema } from '../src/lib/db';

const TEST_DB_PATH = resolve('./data/test.db');

function createTestDb() {
  const dir = dirname(TEST_DB_PATH);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  
  if (existsSync(TEST_DB_PATH)) {
    unlinkSync(TEST_DB_PATH);
  }

  const db = new Database(TEST_DB_PATH);
  initializeSchema(db);
  
  return db;
}

describe('Database Operations', () => {
  let db: Database.Database;

  beforeEach(() => {
    db = createTestDb();
  });

  afterEach(() => {
    db.close();
    if (existsSync(TEST_DB_PATH)) {
      unlinkSync(TEST_DB_PATH);
    }
  });

  describe('Tournaments', () => {
    it('should create a tournament', () => {
      const stmt = db.prepare(`
        INSERT INTO tournaments (name, description, type, rounds, status)
        VALUES (?, ?, ?, ?, ?)
      `);
      const result = stmt.run('Test Turnering', 'En test', 'round-robin', 5, 'registration');
      
      expect(result.lastInsertRowid).toBe(1);
    });

    it('should get all tournaments', () => {
      db.prepare(`INSERT INTO tournaments (name, status) VALUES (?, ?)`).run('Turnering 1', 'registration');
      db.prepare(`INSERT INTO tournaments (name, status) VALUES (?, ?)`).run('Turnering 2', 'active');
      
      const tournaments = db.prepare('SELECT * FROM tournaments').all();
      
      expect(tournaments).toHaveLength(2);
    });

    it('should get tournament by id', () => {
      db.prepare(`INSERT INTO tournaments (name, status) VALUES (?, ?)`).run('Min Turnering', 'registration');
      
      const tournament = db.prepare('SELECT * FROM tournaments WHERE id = ?').get(1) as { name: string };
      
      expect(tournament.name).toBe('Min Turnering');
    });

    it('should update tournament', () => {
      db.prepare(`INSERT INTO tournaments (name, status) VALUES (?, ?)`).run('Gammel Navn', 'registration');
      db.prepare(`UPDATE tournaments SET name = ? WHERE id = ?`).run('Nytt Navn', 1);
      
      const tournament = db.prepare('SELECT * FROM tournaments WHERE id = ?').get(1) as { name: string };
      
      expect(tournament.name).toBe('Nytt Navn');
    });

    it('should delete tournament', () => {
      db.prepare(`INSERT INTO tournaments (name, status) VALUES (?, ?)`).run('Slett meg', 'registration');
      db.prepare(`DELETE FROM tournaments WHERE id = ?`).run(1);
      
      const tournament = db.prepare('SELECT * FROM tournaments WHERE id = ?').get(1);
      
      expect(tournament).toBeUndefined();
    });
  });

  describe('Participants', () => {
    beforeEach(() => {
      db.prepare(`INSERT INTO tournaments (name, status) VALUES (?, ?)`).run('Test Turnering', 'registration');
    });

    it('should register participant', () => {
      const stmt = db.prepare(`
        INSERT INTO participants (tournament_id, name, email, nav_ident, slack_handle)
        VALUES (?, ?, ?, ?, ?)
      `);
      const result = stmt.run(1, 'Test Person', 'test@nav.no', 'T123456', 'test.person');
      
      expect(result.lastInsertRowid).toBe(1);
    });

    it('should prevent duplicate registration', () => {
      db.prepare(`INSERT INTO participants (tournament_id, name, email) VALUES (?, ?, ?)`).run(1, 'Test', 'test@nav.no');
      
      expect(() => {
        db.prepare(`INSERT INTO participants (tournament_id, name, email) VALUES (?, ?, ?)`).run(1, 'Test 2', 'test@nav.no');
      }).toThrow();
    });

    it('should get participants by tournament', () => {
      db.prepare(`INSERT INTO participants (tournament_id, name, email) VALUES (?, ?, ?)`).run(1, 'Spiller 1', 's1@nav.no');
      db.prepare(`INSERT INTO participants (tournament_id, name, email) VALUES (?, ?, ?)`).run(1, 'Spiller 2', 's2@nav.no');
      
      const participants = db.prepare('SELECT * FROM participants WHERE tournament_id = ?').all(1);
      
      expect(participants).toHaveLength(2);
    });

    it('should remove participant', () => {
      db.prepare(`INSERT INTO participants (tournament_id, name, email) VALUES (?, ?, ?)`).run(1, 'Test', 'test@nav.no');
      db.prepare(`DELETE FROM participants WHERE id = ?`).run(1);
      
      const participant = db.prepare('SELECT * FROM participants WHERE id = ?').get(1);
      
      expect(participant).toBeUndefined();
    });
  });

  describe('Matches', () => {
    beforeEach(() => {
      db.prepare(`INSERT INTO tournaments (name, status) VALUES (?, ?)`).run('Test', 'active');
      db.prepare(`INSERT INTO participants (tournament_id, name, email) VALUES (?, ?, ?)`).run(1, 'P1', 'p1@nav.no');
      db.prepare(`INSERT INTO participants (tournament_id, name, email) VALUES (?, ?, ?)`).run(1, 'P2', 'p2@nav.no');
    });

    it('should create match', () => {
      const stmt = db.prepare(`
        INSERT INTO matches (tournament_id, round, player1_id, player2_id)
        VALUES (?, ?, ?, ?)
      `);
      const result = stmt.run(1, 1, 1, 2);
      
      expect(result.lastInsertRowid).toBe(1);
    });

    it('should update match result', () => {
      db.prepare(`INSERT INTO matches (tournament_id, round, player1_id, player2_id) VALUES (?, ?, ?, ?)`).run(1, 1, 1, 2);
      db.prepare(`UPDATE matches SET player1_score = ?, player2_score = ?, winner_id = ? WHERE id = ?`).run(3, 1, 1, 1);
      
      const match = db.prepare('SELECT * FROM matches WHERE id = ?').get(1) as { winner_id: number };
      
      expect(match.winner_id).toBe(1);
    });

    it('should get matches by tournament', () => {
      db.prepare(`INSERT INTO matches (tournament_id, round, player1_id, player2_id) VALUES (?, ?, ?, ?)`).run(1, 1, 1, 2);
      db.prepare(`INSERT INTO matches (tournament_id, round, player1_id, player2_id) VALUES (?, ?, ?, ?)`).run(1, 2, 1, 2);
      
      const matches = db.prepare('SELECT * FROM matches WHERE tournament_id = ?').all(1);
      
      expect(matches).toHaveLength(2);
    });
  });
});
