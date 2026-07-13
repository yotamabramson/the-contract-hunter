import { getStore } from '@netlify/blobs';

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const store = getStore('leaderboard');
  const current = (await store.get('playCount', { type: 'json' })) || 0;
  const next = current + 1;
  await store.set('playCount', JSON.stringify(next));

  return new Response(JSON.stringify({ ok: true, playCount: next }), {
    headers: { 'content-type': 'application/json' },
  });
};

export const config = { path: '/api/track-play' };
