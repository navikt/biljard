import { defineMiddleware, sequence } from 'astro:middleware';

export interface User {
  name: string;
  email: string;
  navIdent: string;
  groups: string[];
  isAdmin: boolean;
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

const ADMIN_GROUP_ID = import.meta.env.ADMIN_GROUP_ID ?? '';
const DEV_ADMIN_GROUP = 'dev-admin-group';

function extractUserFromToken(authHeader: string | null): User | null {
  if (!authHeader?.startsWith('Bearer ')) return null;
  
  const token = authHeader.slice(7);
  const payload = parseJwtPayload(token);
  if (!payload) return null;

  const groups = Array.isArray(payload.groups) ? payload.groups : [];
  const isAdmin = ADMIN_GROUP_ID ? groups.includes(ADMIN_GROUP_ID) : false;

  return {
    name: (payload.name as string) ?? 'Ukjent',
    email: (payload.preferred_username as string) ?? (payload.email as string) ?? '',
    navIdent: (payload.NAVident as string) ?? '',
    groups,
    isAdmin,
  };
}

function createDevUser(isAdmin: boolean): User {
  return {
    name: 'Dev Bruker',
    email: 'dev@nav.no',
    navIdent: 'D123456',
    groups: isAdmin ? [DEV_ADMIN_GROUP] : [],
    isAdmin,
  };
}

const auth = defineMiddleware(async (context, next) => {
  const { request, locals, url } = context;

  if (url.pathname.startsWith('/api/internal/')) {
    return next();
  }

  const authHeader = request.headers.get('Authorization');
  const user = extractUserFromToken(authHeader);

  if (import.meta.env.DEV) {
    const devAdmin = url.searchParams.get('admin') !== 'false';
    (locals as { user: User }).user = user ?? createDevUser(devAdmin);
    return next();
  }

  (locals as { user?: User | null }).user = user;

  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  if (url.pathname.startsWith('/admin') && !user.isAdmin) {
    return new Response('Forbidden - Admin access required', { status: 403 });
  }

  return next();
});

export const onRequest = sequence(auth);
