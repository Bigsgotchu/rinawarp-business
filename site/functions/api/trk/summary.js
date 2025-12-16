// GET /api/trk/summary?day=YYYY-MM-DD  OR  /api/trk/summary?range=7d|30d
export const onRequestGet = async ({ request, env }) => {
  try {
    const url = new URL(request.url);
    const day = url.searchParams.get('day');
    const range = (url.searchParams.get('range') || '').toLowerCase();

    const days = [];
    if (day) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) {
        return json({ ok: false, error: 'day must be YYYY-MM-DD' }, 400);
      }
      days.push(day);
    } else if (range === '7d' || range === '30d') {
      const n = range === '7d' ? 7 : 30;
      for (let i = 0; i < n; i++) {
        const d = new Date(Date.now() - i * 86400000);
        days.push(d.toISOString().slice(0, 10));
      }
      days.reverse();
    } else {
      return json({ ok: false, error: 'pass day=YYYY-MM-DD or range=7d|30d' }, 400);
    }

    const byDay = {};
    const byBtn = {};
    const byUtm = {};
    let total = 0;

    for (const d of days) {
      const raw = await env.KV_ANALYTICS.get(`log:${d}`);
      if (!raw) {
        byDay[d] = 0;
        continue;
      }
      const evts = raw
        .split('\n')
        .map((l) => {
          try {
            return JSON.parse(l);
          } catch {
            return null;
          }
        })
        .filter(Boolean);
      byDay[d] = evts.length;
      total += evts.length;

      for (const e of evts) {
        const b = e.btn || 'unknown';
        byBtn[b] = (byBtn[b] || 0) + 1;
        const key = `${e.utm_source || ''}|${e.utm_medium || ''}|${e.utm_campaign || ''}`;
        byUtm[key] = (byUtm[key] || 0) + 1;
      }
    }

    return json({ ok: true, days, totals: { count: total }, byDay, byBtn, byUtm }, 200);
  } catch (e) {
    return json({ ok: false, error: e.message || 'summary failed' }, 500);
  }
};

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });
}
