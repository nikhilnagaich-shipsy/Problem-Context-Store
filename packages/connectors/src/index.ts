/**
 * @pcs/connectors — adapter registry.
 *
 * Real adapters (slack, devrev, github, gmail) get added here as they're
 * implemented in M8. For now we have the Stub so the rest of the pipeline
 * can be tested end-to-end.
 */

import type { ConnectorAdapter } from './adapter';
import { stubAdapter } from './stub';

export * from './adapter';

/**
 * Registry keyed by the string used in the `/api/ingest/[connector]` URL.
 * Note that the `SourceKind` enum has values like SLACK, DEVREV; we use the
 * lowercased version in URLs for cleanliness ("slack", "devrev", "stub").
 */
const REGISTRY: Record<string, ConnectorAdapter> = {
  stub: stubAdapter,
  // slack: slackAdapter,        // M8a
  // devrev: devrevAdapter,      // M8b
  // github: githubAdapter,      // M8b
  // gmail: gmailAdapter,        // M8b
};

export function getAdapter(slug: string): ConnectorAdapter | null {
  return REGISTRY[slug.toLowerCase()] ?? null;
}

export function listAdapters(): ConnectorAdapter[] {
  return Object.values(REGISTRY);
}

/**
 * URL slug for a kind. Inverse of getAdapter().
 * Used to build the webhook URL on install.
 */
export function adapterSlugForKind(kind: string): string | null {
  for (const [slug, adapter] of Object.entries(REGISTRY)) {
    if (adapter.descriptor.kind === kind) return slug;
  }
  return null;
}
