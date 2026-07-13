import { getStore } from '@netlify/blobs';

export default async () => {
  const store = getStore('leaderboard');
  const entries = (await store.get('entries', { type: 'json' })) || [];
  const playCount = (await store.get('playCount', { type: 'json' })) || 0;
  const top = entries.slice(0, 20);

  return new Response(JSON.stringify({ entries: top, playCount }), {
    headers: { 'content-type': 'application/json' },
  });
};

export const config = { path: '/api/leaderboard' };
