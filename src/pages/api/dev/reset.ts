import type { APIRoute } from 'astro';
import db from '@/lib/db';

export const POST: APIRoute = async () => {
  if (!import.meta.env.DEV) {
    return new Response(JSON.stringify({ error: 'Only available in development' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    db.exec(`
      DELETE FROM matches;
      DELETE FROM participants;
      DELETE FROM tournaments;
    `);

    return new Response(JSON.stringify({ success: true, message: 'Database reset' }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Reset database error:', error);
    return new Response(JSON.stringify({ error: 'Failed to reset database' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
