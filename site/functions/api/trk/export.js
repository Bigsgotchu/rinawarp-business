export const onRequestGet = async ({ request, env }) => {
  try {
    const url = new URL(request.url);
    const day = url.searchParams.get('day'); // required: YYYY-MM-DD
    const format = (url.searchParams.get('format') || 'csv').toLowerCase();
    if (!day || !/^\d{4}-\d{2}-\d{2}$/.test(day)) {
      return new Response(
        JSON.stringify({ ok: false, error: 'day param required as YYYY-MM-DD' }),
        {
          status: 400,
          headers: { 'content-type': 'application/json' },
        },
      );
    }

    const key = `log:${day}`;
    const raw = await env.KV_ANALYTICS.get(key);
    if (!raw) {
      return new Response(
        format === 'json'
          ? JSON.stringify({ ok: true, data: [] })
          : 't,d,ev,path,btn,href,utm_source,utm_medium,utm_campaign,ref,ua\n',
        {
          status: 200,
          headers: {
            'content-type': format === 'json' ? 'application/json' : 'text/csv; charset=utf-8',
            'content-disposition': `inline; filename="trk-${day}.${format}"`,
          },
        },
      );
    }

    // Each line is a JSON object; parse safely
    const lines = raw.split('\n').filter(Boolean);
    const events = [];
    for (const line of lines) {
      try {
        events.push(JSON.parse(line));
      } catch {}
    }

    if (format === 'json') {
      return new Response(JSON.stringify({ ok: true, day, count: events.length, data: events }), {
        headers: {
          'content-type': 'application/json',
          'content-disposition': `inline; filename="trk-${day}.json"`,
        },
      });
    }

    // CSV
    const esc = (v) => {
      const s = (v ?? '').toString();
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const header = 't,d,ev,path,btn,href,utm_source,utm_medium,utm_campaign,ref,ua';
    const rows = events.map((e) =>
      [
        e.t,
        e.d,
        e.ev,
        e.path,
        e.btn,
        e.href,
        e.utm_source,
        e.utm_medium,
        e.utm_campaign,
        e.ref,
        e.ua,
      ]
        .map(esc)
        .join(','),
    );
    const csv = [header, ...rows].join('\n');
    return new Response(csv, {
      headers: {
        'content-type': 'text/csv; charset=utf-8',
        'content-disposition': `attachment; filename="trk-${day}.csv"`,
        'cache-control': 'no-store',
      },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: e.message || 'export failed' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
};
