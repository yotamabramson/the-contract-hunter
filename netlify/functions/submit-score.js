import { getStore } from '@netlify/blobs';

const MAX_ENTRIES = 200;

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }

  const { name, company, role, score, jobSatisfaction, walletPrestige, sanityQoL, day } = body || {};

  if (
    typeof name !== 'string' || name.trim().length === 0 ||
    typeof score !== 'number' || !Number.isFinite(score) || score < 0 || score > 100 ||
    typeof day !== 'number' || !Number.isFinite(day) || day < 1 || day > 180
  ) {
    return new Response(JSON.stringify({ error: 'Invalid payload' }), { status: 400 });
  }

  const store = getStore('leaderboard');
  const existing = (await store.get('entries', { type: 'json' })) || [];

  const finalName = name.trim().slice(0, 20);
  const entry = {
    name: finalName,
    company: typeof company === 'string' ? company.slice(0, 80) : '',
    role: typeof role === 'string' ? role.slice(0, 60) : '',
    score: Math.round(score),
    jobSatisfaction: Number.isFinite(jobSatisfaction) ? Math.round(jobSatisfaction) : null,
    walletPrestige: Number.isFinite(walletPrestige) ? Math.round(walletPrestige) : null,
    sanityQoL: Number.isFinite(sanityQoL) ? Math.round(sanityQoL) : null,
    day: Math.round(day),
    ts: Date.now(),
  };

  // Same name submits again -> overrides their previous entry instead of piling up duplicates.
  const withoutPrevious = existing.filter((e) => e.name !== finalName);
  const next = [...withoutPrevious, entry].sort((a, b) => b.score - a.score);
  const trimmed = next.slice(0, MAX_ENTRIES);
  await store.set('entries', JSON.stringify(trimmed));

  const rankIdx = trimmed.indexOf(entry);
  return new Response(JSON.stringify({ ok: true, rank: rankIdx === -1 ? null : rankIdx + 1 }), {
    headers: { 'content-type': 'application/json' },
  });
};

export const config = { path: '/api/submit-score' };
