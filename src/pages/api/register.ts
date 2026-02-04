import type { APIRoute } from 'astro';
import { registerParticipant, getTournamentById, getParticipantsByTournament } from '../../lib/db';
import type { User } from '../../middleware';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const user = (locals as { user?: User }).user;
    if (!user) {
      return new Response(JSON.stringify({ error: 'Ikke autentisert' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const body = await request.json();
    const { tournamentId, slackHandle } = body;

    if (!tournamentId) {
      return new Response(JSON.stringify({ error: 'Mangler turneringsid' }), {
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

    const existing = getParticipantsByTournament(tournamentId);
    if (existing.some(p => p.email.toLowerCase() === user.email.toLowerCase())) {
      return new Response(JSON.stringify({ error: 'Du er allerede påmeldt denne turneringen' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const participantId = registerParticipant({
      tournament_id: tournamentId,
      name: user.name,
      email: user.email,
      nav_ident: user.navIdent || null,
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
