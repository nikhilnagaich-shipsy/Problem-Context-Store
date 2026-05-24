/**
 * The ingest pipeline.
 *
 *   For each NormalizedEvent:
 *     1. Dedup by (workspaceId, source, sourceId).
 *     2. Run resolution-stub (M6 replaces with real resolver).
 *     3. Persist the Event row with resolved fields.
 *     4. Audit-log "event.ingest".
 *
 *   Returns the IDs of newly inserted events plus the duplicate count.
 */

import { prisma } from '@pcs/db';
import type { NormalizedEvent } from '@pcs/connectors';
import { resolveWithStub } from './resolution-stub';

export interface IngestResult {
  ingested: string[]; // event IDs
  duplicates: number;
  resolved: number; // ingested events that got both clientId and problemId
}

export async function ingestEvents(
  workspaceId: string,
  events: NormalizedEvent[],
  context: { connectorInstanceId?: string; actorUserId?: string },
): Promise<IngestResult> {
  const ingested: string[] = [];
  let duplicates = 0;
  let resolved = 0;

  for (const ev of events) {
    // Dedup
    const existing = await prisma.event.findUnique({
      where: {
        workspaceId_source_sourceId: {
          workspaceId,
          source: ev.source,
          sourceId: ev.sourceId,
        },
      },
      select: { id: true },
    });
    if (existing) {
      duplicates++;
      continue;
    }

    const res = await resolveWithStub(workspaceId, ev);

    const created = await prisma.event.create({
      data: {
        workspaceId,
        source: ev.source,
        sourceId: ev.sourceId,
        sourceUrl: ev.sourceUrl ?? null,
        kind: ev.kind,
        timestamp: ev.timestamp,
        actorName: ev.actor.name ?? null,
        actorEmail: ev.actor.email ?? null,
        actorSourceId: ev.actor.sourceId ?? null,
        body: ev.body,
        bodyHtml: ev.bodyHtml ?? null,
        parentThreadId: ev.parentThreadId ?? null,
        clientId: res.clientId,
        problemId: res.problemId,
        clientResolutionConfidence: res.clientConfidence || null,
        problemResolutionConfidence: res.problemConfidence || null,
        resolutionMethod: res.method,
        resolutionReason: res.reason,
        mentions: ev.mentions?.length
          ? {
              create: ev.mentions.map((m) => ({ kind: m.kind, value: m.value })),
            }
          : undefined,
      },
      select: { id: true },
    });

    ingested.push(created.id);
    if (res.clientId && res.problemId) resolved++;

    await prisma.auditLog.create({
      data: {
        workspaceId,
        actorUserId: context.actorUserId ?? null,
        action: 'event.ingest',
        targetType: 'event',
        targetId: created.id,
        metadata: {
          source: ev.source,
          sourceId: ev.sourceId,
          connectorInstanceId: context.connectorInstanceId ?? null,
          clientId: res.clientId,
          problemId: res.problemId,
          method: res.method,
        },
      },
    });
  }

  return { ingested, duplicates, resolved };
}

/**
 * Generate a random URL-safe token for webhook authentication.
 * Used when installing a connector.
 */
export function generateWebhookToken(): string {
  // crypto.randomUUID() is fine for non-cryptographic discriminators; we use
  // a longer random string because this token authorizes ingest.
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Buffer.from(bytes).toString('base64url');
}
