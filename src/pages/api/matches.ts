import type { APIRoute } from 'astro';
import { getMatchById, updateMatch } from '../../lib/db';

export const PUT: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { id, player1Score, player2Score, winnerId, playedAt, reportedBy } = body;

    if (!id) {
      return new Response(JSON.stringify({ error: 'Kamp-ID er påkrevd' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const match = getMatchById(id);
    if (!match) {
      return new Response(JSON.stringify({ error: 'Kamp ikke funnet' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const updateData: Record<string, unknown> = {};
    if (player1Score !== undefined) updateData.player1_score = player1Score;
    if (player2Score !== undefined) updateData.player2_score = player2Score;
    if (winnerId !== undefined) updateData.winner_id = winnerId;
    if (playedAt !== undefined) updateData.played_at = playedAt;
    if (reportedBy !== undefined) updateData.reported_by = reportedBy;

    updateMatch(id, updateData);

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Update match error:', error);
    return new Response(JSON.stringify({ error: 'Kunne ikke oppdatere kamp' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
