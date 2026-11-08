import { describe, it, expect } from 'vitest';
import { parseRepoLink } from '../../lib/repo-link';

describe('parseRepoLink (REQ-GITHUB-017 external repository link validation)', () => {
  it('REQ-GITHUB-017 parser: a valid repo yields only the repo', () => {
    expect(parseRepoLink('?repo=acme/widgets')).toEqual({ repo: 'acme/widgets' });
  });

  it('REQ-GITHUB-017 parser: a valid repo and ref yield both', () => {
    expect(parseRepoLink('?repo=acme/widgets&ref=feature/x-1.2')).toEqual({ repo: 'acme/widgets', ref: 'feature/x-1.2' });
  });

  it.each(['?repo=acme', '?repo=a/b/c', '?repo=acme/widgets%26x', '?repo=acme/wid gets', '?ref=main', ''])(
    'REQ-GITHUB-017 parser: invalid or missing repo %j gives null', (search) => {
      expect(parseRepoLink(search)).toBeNull();
    });

  it.each(['-bad', 'a b', 'x&y'].map(encodeURIComponent))(
    'REQ-GITHUB-017 parser: invalid ref %j gives null, never a dropped ref', (ref) => {
      expect(parseRepoLink(`?repo=acme/widgets&ref=${ref}`)).toBeNull();
    });

  it('REQ-GITHUB-017 parser: a 255 character ref is accepted and 256 is refused', () => {
    const parse = parseRepoLink;
    expect(parse(`?repo=acme/widgets&ref=${'a'.repeat(255)}`)).toEqual({ repo: 'acme/widgets', ref: 'a'.repeat(255) });
    expect(parse(`?repo=acme/widgets&ref=${'a'.repeat(256)}`)).toBeNull();
  });

  it.each(['?repo=acme/widgets&repo=acme/other', '?repo=acme/widgets&ref=a&ref=b'])(
    'REQ-GITHUB-017 parser: repeated parameters %j give null', (search) => {
      expect(parseRepoLink(search)).toBeNull();
    });

  it.each(['?repo=', '?repo=acme/widgets&ref='])(
    'REQ-GITHUB-017 parser: empty value %j gives null', (search) => {
      expect(parseRepoLink(search)).toBeNull();
    });

  it('REQ-GITHUB-017 parser: other query keys are ignored', () => {
    expect(parseRepoLink('?repo=acme/widgets&github=connected&utm=x'), 'WHAT: unrelated keys ignored. WHY: OAuth return query must not break the link. HOW: read only repo and ref.').toEqual({ repo: 'acme/widgets' });
  });

  it('REQ-GITHUB-017 parser: dot, underscore, hyphen and leading dot or slash in ref are accepted', () => {
    expect(parseRepoLink('?repo=ac-me.io/wid_gets-2&ref=.hidden-1')).toEqual({ repo: 'ac-me.io/wid_gets-2', ref: '.hidden-1' });
    expect(parseRepoLink('?repo=acme/widgets&ref=/x')).toEqual({ repo: 'acme/widgets', ref: '/x' });
  });
});
