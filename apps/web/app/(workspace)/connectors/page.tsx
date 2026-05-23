import { prisma } from '@pcs/db';
import { getSession } from '@/lib/auth';
import { Topbar } from '@/components/Topbar';
import { Badge } from '@/components/ui/Badge';
import { SourceIcon, sourceLabel } from '@/components/SourceIcon';

export const dynamic = 'force-dynamic';

export default async function ConnectorsPage() {
  const session = await getSession();
  const connectors = await prisma.connectorInstance.findMany({
    where: { workspaceId: session.workspace.id },
    orderBy: { kind: 'asc' },
  });

  const installable: Array<{ kind: 'SLACK' | 'DEVREV' | 'GITHUB' | 'GMAIL'; status: string }> = [
    { kind: 'SLACK', status: 'Coming in M8' },
    { kind: 'DEVREV', status: 'Coming in M8' },
    { kind: 'GITHUB', status: 'Coming in M8' },
    { kind: 'GMAIL', status: 'Coming in M8' },
  ];

  return (
    <>
      <Topbar
        title="Connectors"
        subtitle="Bring source-of-truth tools into the Problem Context Store"
      />
      <main className="px-6 py-6">
        <section className="mb-8">
          <h2 className="mb-3 text-sm font-semibold text-ink-900">Installed</h2>
          {connectors.length === 0 ? (
            <p className="text-sm text-ink-500">None installed yet.</p>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {connectors.map((c) => (
                <li
                  key={c.id}
                  className="flex items-center gap-3 rounded-lg border border-ink-200 bg-white p-4 shadow-sm"
                >
                  <SourceIcon source={c.kind} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink-900">{c.displayName}</p>
                    <p className="truncate text-xs text-ink-500">{sourceLabel(c.kind)}</p>
                  </div>
                  <Badge tone={c.status === 'ACTIVE' ? 'success' : 'muted'}>
                    {c.status.toLowerCase()}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-ink-900">Available</h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {installable.map((i) => (
              <li
                key={i.kind}
                className="flex items-center gap-3 rounded-lg border border-dashed border-ink-200 bg-white/50 p-4"
              >
                <SourceIcon source={i.kind} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink-900">{sourceLabel(i.kind)}</p>
                  <p className="truncate text-xs text-ink-500">{i.status}</p>
                </div>
                <button
                  disabled
                  className="inline-flex h-7 cursor-not-allowed items-center rounded-md bg-ink-100 px-2.5 text-xs font-medium text-ink-500"
                >
                  Install
                </button>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </>
  );
}
