import type { APIRoute } from 'astro';
import { 
  getAllTournaments, 
  getTournamentById, 
  createTournament, 
  updateTournament, 
  deleteTournament,
  getParticipantsByTournament,
  getMatchesByTournament,
  generateRoundRobinMatches,
  getStandings
} from '../../lib/db';

function isAdmin(locals: App.Locals): boolean {
  const user = locals.user;
  const adminGroupId = import.meta.env.ADMIN_GROUP_ID ?? '';
  return !!user && !!adminGroupId && user.groups.includes(adminGroupId);
}

export const GET: APIRoute = async ({ url }) => {
  const id = url.searchParams.get('id');
  
  if (id) {
    const tournament = getTournamentById(parseInt(id));
    if (!tournament) {
      return new Response(JSON.stringify({ error: 'Turnering ikke funnet' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const participants = getParticipantsByTournament(parseInt(id));
    const matches = getMatchesByTournament(parseInt(id));
    const standings = getStandings(parseInt(id));
    
    return new Response(JSON.stringify({ tournament, participants, matches, standings }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  const tournaments = getAllTournaments();
  return new Response(JSON.stringify(tournaments), {
    headers: { 'Content-Type': 'application/json' }
  });
};

export const POST: APIRoute = async ({ request, locals }) => {
  if (!isAdmin(locals)) {
    return new Response(JSON.stringify({ error: 'Ingen tilgang' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await request.json();
    const { name, description, type, rounds, roundDurationWeeks, registrationDeadline, startDate, endDate } = body;

    if (!name) {
      return new Response(JSON.stringify({ error: 'Navn er påkrevd' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const tournamentId = createTournament({
      name,
      description: description || null,
      type: type || 'round-robin',
      rounds: rounds || 10,
      round_duration_weeks: roundDurationWeeks || 2,
      registration_deadline: registrationDeadline || null,
      start_date: startDate || null,
      end_date: endDate || null,
      status: 'registration'
    });

    return new Response(JSON.stringify({ success: true, tournamentId }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Create tournament error:', error);
    return new Response(JSON.stringify({ error: 'Kunne ikke opprette turnering' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const PUT: APIRoute = async ({ request, locals }) => {
  if (!isAdmin(locals)) {
    return new Response(JSON.stringify({ error: 'Ingen tilgang' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return new Response(JSON.stringify({ error: 'Turnerings-ID er påkrevd' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const tournament = getTournamentById(id);
    if (!tournament) {
      return new Response(JSON.stringify({ error: 'Turnering ikke funnet' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.rounds !== undefined) updateData.rounds = data.rounds;
    if (data.roundDurationWeeks !== undefined) updateData.round_duration_weeks = data.roundDurationWeeks;
    if (data.registrationDeadline !== undefined) updateData.registration_deadline = data.registrationDeadline;
    if (data.startDate !== undefined) updateData.start_date = data.startDate;
    if (data.endDate !== undefined) updateData.end_date = data.endDate;
    if (data.status !== undefined) updateData.status = data.status;

    updateTournament(id, updateData);

    if (data.status === 'active' && tournament.status !== 'active') {
      generateRoundRobinMatches(id);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Update tournament error:', error);
    return new Response(JSON.stringify({ error: 'Kunne ikke oppdatere turnering' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const DELETE: APIRoute = async ({ url, locals }) => {
  if (!isAdmin(locals)) {
    return new Response(JSON.stringify({ error: 'Ingen tilgang' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const id = url.searchParams.get('id');
  
  if (!id) {
    return new Response(JSON.stringify({ error: 'Turnerings-ID er påkrevd' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    deleteTournament(parseInt(id));
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Delete tournament error:', error);
    return new Response(JSON.stringify({ error: 'Kunne ikke slette turnering' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
