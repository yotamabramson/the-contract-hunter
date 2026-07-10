import { getStore } from '@netlify/blobs';

export default async () => {
  const store = getStore('leaderboard');
  const entries = (await store.get('entries', { type: 'json' })) || [];
  const top = entries.slice(0, 20);

  return new Response(JSON.stringify(top), {
    headers: { 'content-type': 'application/json' },
  });
};

export const config = { path: '/api/leaderboard' };
