import test from 'node:test';
import assert from 'node:assert/strict';
import { fetchPublicRepos, summarize, updateReadme, renderSnapshot } from './update-profile.mjs';

const repo = (overrides = {}) => ({ private: false, owner: { login: 'RescuePC' }, fork: false, stargazers_count: 3, ...overrides });

test('public counts exclude private and other owners; stars exclude forks', () => {
  const stats = summarize([repo(), repo({ fork: true, stargazers_count: 100 }), repo({ private: true }), repo({ owner: { login: 'other' } })], new Date('2026-10-20T00:00:00Z'));
  assert.deepEqual(stats, { publicRepos: 2, originals: 1, stars: 3, date: '2026-10-20' });
  assert.match(renderSnapshot(stats), /2 public repositories, 1 original repositories, 3 stars/);
  assert.throws(() => summarize([]), /No public repositories/);
});

test('fetches subsequent pages and stops after the partial page', async () => {
  const urls = [];
  const repos = await fetchPublicRepos(async url => {
    urls.push(url);
    return { ok: true, json: async () => urls.length === 1 ? Array.from({ length: 100 }, () => repo()) : [repo()] };
  });
  assert.equal(repos.length, 101);
  assert.equal(urls.length, 2);
  assert.match(urls[1], /page=2$/);
  await assert.rejects(fetchPublicRepos(async () => ({ ok: false, status: 403 })), /403/);
  await assert.rejects(fetchPublicRepos(async () => ({ ok: true, json: async () => ({ message: 'error' }) })), /repository array/);
});

test('replaces only the stats block and rejects malformed markers', () => {
  const stats = summarize([repo()]);
  const input = 'Before\n<!-- STATS:START -->\nold\n<!-- STATS:END -->\nAfter';
  const output = updateReadme(input, stats);
  assert.ok(output.startsWith('Before\n<!-- STATS:START -->'));
  assert.ok(output.endsWith('<!-- STATS:END -->\nAfter'));
  assert.match(output, /1 public repositories/);
  assert.equal(updateReadme(output, stats), output);
  for (const invalid of ['', '<!-- STATS:END --><!-- STATS:START -->', input + '<!-- STATS:START -->']) {
    assert.throws(() => updateReadme(invalid, stats), /stats markers/);
  }
});
