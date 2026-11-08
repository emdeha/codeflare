export interface RepoLink {
  repo: string;
  ref?: string;
}

// Same rules as the clone schema in src/routes/session/crud.ts (the authority).
// web-ui cannot import from the Worker tree, so the literals are duplicated.
const REPO_PATTERN = /^[A-Za-z0-9._-]+\/[A-Za-z0-9._-]+$/;
const REF_PATTERN = /^[A-Za-z0-9._/][A-Za-z0-9._/-]*$/;
const REF_MAX_LENGTH = 255;

function singleValue(params: URLSearchParams, key: string): string | null | undefined {
  const values = params.getAll(key);
  if (values.length === 0) return undefined;
  if (values.length > 1 || values[0] === '') return null;
  return values[0];
}

/**
 * Parse an inbound /app/?repo=<owner>/<name>[&ref=<branch>] query. Returns null
 * for anything the session API would reject, including a bad ref, so a link can
 * never clone a different ref than it names.
 */
export function parseRepoLink(search: string): RepoLink | null {
  const params = new URLSearchParams(search);
  const repo = singleValue(params, 'repo');
  if (!repo || !REPO_PATTERN.test(repo)) return null;

  const ref = singleValue(params, 'ref');
  if (ref === undefined) return { repo };
  if (ref === null || ref.length > REF_MAX_LENGTH || !REF_PATTERN.test(ref)) return null;
  return { repo, ref };
}
