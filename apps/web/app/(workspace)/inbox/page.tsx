import { prisma } from '@pcs/db';
import { getSession } from '@/lib/auth';
import { Topbar } from '@/components/Topbar';
import { SourceIcon, sourceLabel } from '@/components/SourceIcon';
import { relativeTime, absoluteTime } from '@/lib/format';
import { AttachToProblemForm } from './AttachToProblemForm';

export const dynamic = 'force-dynamic';

export default async function InboxPage() {
  const session = await getSession();

  const [unattached, problems] = await Promise.all([
    prisma.event.findMany({
      where: {
        workspaceId: session.workspace.id,
        problemId: null,
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
      include: { client: true },
    }),
    prisma.problem.findMany({
      where: { workspaceId: session.workspace.id },
      orderBy: { firstSeenAt: 'desc' },
      select: { id: true, title: true, client: { select: { id: true, name: true } } },
      take: 200,
    }),
  ]);

  const withClient = unattached.filter((e) => e.clientId);
  const withoutClient = unattached.filter((e) => !e.clientId);

  return (
    <>
      <Topbar
        title="Inbox"
        subtitle={`${unattached.length} unattached event${unattached.length === 1 ? '' : 's'}`}
      />

      <main className="px-6 py-6 space-y-6">
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
          <strong>How this works:</strong> Events whose Problem can't be deterministically resolved
          land here. M6 will auto-resolve most of these with vector matching + an LLM judge. For
          now, attach them manually below — the system records every choice as training signal.
        </div>

        {unattached.length === 0 ? (
          <div className="rounded-lg border border-dashed border-ink-200 bg-white p-12 text-center">
            <h3 className="text-base font-medium text-ink-900">Inbox zero</h3>
            <p className="mt-1 text-sm text-ink-500">
              All ingested events are attached to a Problem. Nothing to triage right now.
            </p>
          </div>
        ) : (
          <>
            {withClient.length > 0 && (
              <Group
                title="Client identified · Problem unknown"
                subtitle="Pick from this client's open Problems, or spawn a new one."
                events={withClient}
                problems={problems}
              />
            )}
            {withoutClient.length > 0 && (
              <Group
                title="Client unknown"
                subtitle="No matching domain or rule. Pick a Problem (and inherit its client) or skip."
                events={withoutClient}
                problems={problems}
              />
            )}
          </>
        )}
      </main>
    </>
  );
}

function Group({
  title,
  subtitle,
  events,
  problems,
}: {
  title: string;
  subtitle: string;
  events: Awaited<ReturnType<typeof prisma.event.findMany>> extends Array<infer T> ? T[] : never;
  problems: Array<{ id: string; title: string; client: { id: string; name: string } }>;
}) {
  return (
    <section>
      <header className="mb-2">
        <h2 className="text-sm font-semibold text-ink-900">{title}</h2>
        <p className="text-xs text-ink-500">{subtitle}</p>
      </header>
      <ul className="divide-y divide-ink-200 rounded-lg border border-ink-200 bg-white shadow-sm">
        {events.map((e: any) => {
          const candidateProblems = e.clientId
            ? problems.filter((p) => p.client.id === e.clientId)
            : problems;
          return (
            <li key={e.id} className="grid gap-3 px-5 py-4 md:grid-cols-[1fr,300px]">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-xs text-ink-500">
                  <SourceIcon source={e.source} size="sm" />
                  <span className="font-medium text-ink-900">{e.actorName ?? 'Unknown'}</span>
                  <span>·</span>
                  <span>{sourceLabel(e.source)}</span>
                  <span>·</span>
                  <span>{e.kind.toLowerCase().replace('_', ' ')}</span>
                  <span className="ml-auto" title={absoluteTime(e.createdAt)}>
                    {relativeTime(e.createdAt)}
                  </span>
                </div>
                <p className="mt-1 whitespace-pre-wrap text-sm text-ink-700">{e.body}</p>
                {e.client && (
                  <p className="mt-1 text-xs text-ink-500">
                    Client: <span className="font-medium text-ink-700">{e.client.name}</span>
                    {e.resolutionReason && (
                      <span className="text-ink-500"> · {e.resolutionReason}</span>
                    )}
                  </p>
                )}
              </div>
              <AttachToProblemForm eventId={e.id} candidateProblems={candidateProblems} />
            </li>
          );
        })}
      </ul>
    </section>
  );
}
