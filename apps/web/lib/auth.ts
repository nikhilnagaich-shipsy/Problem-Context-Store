/**
 * Dev-mode session resolver.
 *
 * NOTE: This is intentionally a placeholder for M2. It reads a cookie that
 * stores the active userId; if the cookie is missing, it auto-selects the
 * first seeded user so the app is immediately walkable.
 *
 * In M2 this gets replaced by Auth.js v5 with magic links + Google OAuth.
 * The contract returned by `getSession()` will stay stable.
 */

import { cookies } from 'next/headers';
import { prisma, type User, type Workspace, type Membership } from '@pcs/db';

const COOKIE_USER = 'pcs_dev_user';
const COOKIE_WORKSPACE = 'pcs_dev_workspace';

export type Session = {
  user: User;
  workspace: Workspace;
  membership: Membership;
};

/**
 * Returns the current session — user + active workspace + their membership.
 * Throws if no users exist (the seed should always create one).
 */
export async function getSession(): Promise<Session> {
  const jar = cookies();
  const cookieUserId = jar.get(COOKIE_USER)?.value;
  const cookieWorkspaceId = jar.get(COOKIE_WORKSPACE)?.value;

  // Resolve the user — cookie first, fallback to the earliest-created user.
  const user = cookieUserId
    ? await prisma.user.findUnique({ where: { id: cookieUserId } })
    : await prisma.user.findFirst({ orderBy: { createdAt: 'asc' } });

  if (!user) {
    throw new Error(
      'No users found. Run `pnpm db:seed` to create the demo workspace.',
    );
  }

  // Resolve the workspace via membership — cookie first, then first membership.
  const membership = cookieWorkspaceId
    ? await prisma.membership.findUnique({
        where: { userId_workspaceId: { userId: user.id, workspaceId: cookieWorkspaceId } },
        include: { workspace: true },
      })
    : await prisma.membership.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: 'asc' },
        include: { workspace: true },
      });

  if (!membership) {
    throw new Error(
      `User ${user.email} has no workspace memberships. Run \`pnpm db:seed\`.`,
    );
  }

  return {
    user,
    workspace: membership.workspace,
    membership,
  };
}

/**
 * Switch active workspace. Returns the new session.
 * Used by the workspace switcher in the sidebar.
 */
export async function setActiveWorkspace(workspaceId: string) {
  cookies().set(COOKIE_WORKSPACE, workspaceId, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });
}

/**
 * Switch active user (dev only — handy to test multi-user scenarios).
 */
export async function setActiveUser(userId: string) {
  cookies().set(COOKIE_USER, userId, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });
}
