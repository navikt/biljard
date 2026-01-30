import type { APIRoute } from 'astro';
import { registerParticipant, getTournamentById, getParticipantsByTournament } from '../../lib/db';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { tournamentId, name, email, slackHandle } = body;

    if (!tournamentId || !name || !email) {
      return new Response(JSON.stringify({ error: 'Mangler påkrevde felt' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const tournament = getTournamentById(tournamentId);
    if (!tournament) {
      return new Response(JSON.stringify({ error: 'Turnering ikke funnet' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (tournament.status !== 'registration') {
      return new Response(JSON.stringify({ error: 'Påmelding er stengt for denne turneringen' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (tournament.registration_deadline && new Date(tournament.registration_deadline) < new Date()) {
      return new Response(JSON.stringify({ error: 'Påmeldingsfristen har utløpt' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if already registered
    const existing = getParticipantsByTournament(tournamentId);
    if (existing.some(p => p.email.toLowerCase() === email.toLowerCase())) {
      return new Response(JSON.stringify({ error: 'Du er allerede påmeldt denne turneringen' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const participantId = registerParticipant({
      tournament_id: tournamentId,
      name,
      email,
      slack_handle: slackHandle || null
    });

    return new Response(JSON.stringify({ 
      success: true, 
      participantId,
      message: 'Du er nå påmeldt turneringen!'
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return new Response(JSON.stringify({ error: 'Noe gikk galt. Prøv igjen senere.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
