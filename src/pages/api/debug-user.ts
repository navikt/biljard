import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ locals }) => {
  const user = locals.user;
  
  return new Response(JSON.stringify({
    user,
    adminGroupId: import.meta.env.ADMIN_GROUP_ID,
    hasAdminGroup: user?.groups?.includes(import.meta.env.ADMIN_GROUP_ID ?? ''),
  }, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
