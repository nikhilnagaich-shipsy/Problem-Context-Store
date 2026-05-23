/**
 * Cross-cutting constants. Tuneables for the resolution layer live here so
 * we can revise them without hunting through code.
 */

/** Confidence floor below which auto-resolution falls back to manual review. */
export const RESOLUTION_AUTO_THRESHOLD = 0.85;

/** Cosine similarity threshold for vector-based problem clustering. */
export const PROBLEM_CLUSTER_SIMILARITY_THRESHOLD = 0.78;

/** Embedding model dimension — must match the schema's vector(N) column. */
export const EMBEDDING_DIMENSION = 1536;

/** Maximum body length stored on Events. Longer bodies are summarized + linked to raw storage. */
export const MAX_EVENT_BODY_CHARS = 32_000;

/** Audit log retention in days (per-workspace setting can override). */
export const DEFAULT_AUDIT_RETENTION_DAYS = 365;
