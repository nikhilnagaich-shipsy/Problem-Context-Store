import { getSession } from '@/lib/auth';
import { Topbar } from '@/components/Topbar';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const session = await getSession();
  return (
    <>
      <Topbar title="Settings" subtitle="Workspace + account" />
      <main className="mx-auto max-w-2xl px-6 py-6">
        <section className="space-y-1 rounded-lg border border-ink-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-ink-900">Workspace</h2>
          <dl className="mt-2 grid grid-cols-2 gap-4 text-sm">
            <Row label="Name">{session.workspace.name}</Row>
            <Row label="Slug">{session.workspace.slug}</Row>
            <Row label="Created">{session.workspace.createdAt.toString().slice(0, 10)}</Row>
            <Row label="Your role">{session.membership.role}</Row>
          </dl>
        </section>

        <section className="mt-5 space-y-1 rounded-lg border border-ink-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-ink-900">You</h2>
          <dl className="mt-2 grid grid-cols-2 gap-4 text-sm">
            <Row label="Name">{session.user.name ?? '—'}</Row>
            <Row label="Email">{session.user.email}</Row>
          </dl>
        </section>

        <p className="mt-6 text-xs text-ink-500">
          Real account settings, invites, RBAC, and connector OAuth land in M2 and M10.
        </p>
      </main>
    </>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-ink-500">{label}</dt>
      <dd className="mt-0.5 text-ink-900">{children}</dd>
    </div>
  );
}
