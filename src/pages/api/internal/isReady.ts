import type { APIRoute } from 'astro';
import db from '@/lib/db';

export const GET: APIRoute = () => {
  try {
    db.prepare('SELECT 1').get();
    return new Response('OK', { status: 200 });
  } catch {
    return new Response('Database not ready', { status: 503 });
  }
};
