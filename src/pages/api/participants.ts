import type { APIRoute } from 'astro';
import { removeParticipant, updateParticipant, getParticipantById } from '../../lib/db';

export const PUT: APIRoute = async ({ request, locals }) => {
  if (!locals.user.isAdmin) {
    return new Response(JSON.stringify({ error: 'Ingen tilgang' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await request.json();
    const { id, name, email, slackHandle } = body;

    if (!id) {
      return new Response(JSON.stringify({ error: 'Deltaker-ID er påkrevd' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const participant = getParticipantById(id);
    if (!participant) {
      return new Response(JSON.stringify({ error: 'Deltaker ikke funnet' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (slackHandle !== undefined) updateData.slack_handle = slackHandle;

    updateParticipant(id, updateData);

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Update participant error:', error);
    return new Response(JSON.stringify({ error: 'Kunne ikke oppdatere deltaker' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const DELETE: APIRoute = async ({ url, locals }) => {
  if (!locals.user.isAdmin) {
    return new Response(JSON.stringify({ error: 'Ingen tilgang' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const id = url.searchParams.get('id');
  
  if (!id) {
    return new Response(JSON.stringify({ error: 'Deltaker-ID er påkrevd' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    removeParticipant(parseInt(id));
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Delete participant error:', error);
    return new Response(JSON.stringify({ error: 'Kunne ikke fjerne deltaker' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
