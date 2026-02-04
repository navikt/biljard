import { defineMiddleware, sequence } from 'astro:middleware';

export interface User {
  name: string;
  email: string;
  navIdent: string;
  groups: string[];
}

function parseJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1];
    if (!payload) return null;
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

function extractUserFromToken(authHeader: string | null): User | null {
  if (!authHeader?.startsWith('Bearer ')) return null;
  
  const token = authHeader.slice(7);
  const payload = parseJwtPayload(token);
  if (!payload) return null;

  return {
    name: (payload.name as string) ?? 'Ukjent',
    email: (payload.preferred_username as string) ?? (payload.email as string) ?? '',
    navIdent: (payload.NAVident as string) ?? '',
    groups: Array.isArray(payload.groups) ? payload.groups : [],
  };
}

// TODO: Replace with your actual AD group ID for admins
const ADMIN_GROUP_ID = import.meta.env.ADMIN_GROUP_ID ?? '';

const auth = defineMiddleware(async (context, next) => {
  const { request, locals, url } = context;

  if (url.pathname.startsWith('/api/internal/')) {
    return next();
  }

  const authHeader = request.headers.get('Authorization');
  const user = extractUserFromToken(authHeader);

  (locals as { user?: User | null }).user = user;

  if (import.meta.env.DEV) {
    if (!user) {
      (locals as { user?: User }).user = {
        name: 'Dev Bruker',
        email: 'dev@nav.no',
        navIdent: 'D123456',
        groups: [ADMIN_GROUP_ID],
      };
    }
    return next();
  }

  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  if (url.pathname.startsWith('/admin')) {
    const isAdmin = ADMIN_GROUP_ID && user.groups.includes(ADMIN_GROUP_ID);
    if (!isAdmin) {
      return new Response('Forbidden - Admin access required', { status: 403 });
    }
  }

  return next();
});

export const onRequest = sequence(auth);
