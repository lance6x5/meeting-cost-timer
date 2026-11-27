import { describe, it, expect } from 'vitest';
import { buildIssueUrl, trimEnvironment, REPO_URL } from './feedback.js';

describe('feedback URLs', () => {
  it('builds a bug report URL with version and environment', () => {
    const url = new URL(buildIssueUrl('bug', { version: '1.1.0', userAgent: 'Mozilla/5.0 (Test) & Co' }));
    expect(`${url.origin}${url.pathname}`).toBe(`${REPO_URL}/issues/new`);
    expect(url.searchParams.get('template')).toBe('bug_report.yml');
    expect(url.searchParams.get('title')).toBe('[Bug]: ');
    expect(url.searchParams.get('version')).toBe('1.1.0');
    expect(url.searchParams.get('environment')).toBe('Mozilla/5.0 (Test) & Co');
  });

  it('builds a feature request URL without environment', () => {
    const url = new URL(buildIssueUrl('feature', { version: '1.1.0', userAgent: 'UA' }));
    expect(url.searchParams.get('template')).toBe('feature_request.yml');
    expect(url.searchParams.get('title')).toBe('[Feature]: ');
    expect(url.searchParams.has('environment')).toBe(false);
  });

  it('trims long user agents and rejects unknown kinds', () => {
    expect(trimEnvironment('x'.repeat(500)).length).toBe(160);
    expect(() => buildIssueUrl('nope')).toThrow();
  });
});
