// GET /api/slots?date=2026-04-10
// Returns available 30-min consultation slots using FreeBusy across ALL calendars

const BUSINESS_HOURS = { start: 9, end: 17 }; // 9 AM - 5 PM CT
const SLOT_DURATION = 30; // minutes
const CT_OFFSET = '-05:00'; // Central Time (adjust for CDT/CST as needed)

// All calendars to check for conflicts
const CALENDAR_IDS = [
  'primary',
  'lance.pettay@torq.io',
  'family01518585090897192736@group.calendar.google.com',
];

async function getAccessToken(env) {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: env.GCAL_CLIENT_ID,
      client_secret: env.GCAL_CLIENT_SECRET,
      refresh_token: env.GCAL_REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  });
  const data = await res.json();
  return data.access_token;
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const dateStr = url.searchParams.get('date');

  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return new Response(JSON.stringify({ error: 'date parameter required (YYYY-MM-DD)' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...CORS },
    });
  }

  try {
    const token = await getAccessToken(env);

    const timeMin = `${dateStr}T${String(BUSINESS_HOURS.start).padStart(2, '0')}:00:00${CT_OFFSET}`;
    const timeMax = `${dateStr}T${String(BUSINESS_HOURS.end).padStart(2, '0')}:00:00${CT_OFFSET}`;

    // FreeBusy API checks ALL specified calendars at once
    const fbRes = await fetch('https://www.googleapis.com/calendar/v3/freeBusy', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        timeMin,
        timeMax,
        items: CALENDAR_IDS.map((id) => ({ id })),
      }),
    });

    if (!fbRes.ok) {
      console.error('FreeBusy API error:', fbRes.status, await fbRes.text());
      return new Response(JSON.stringify({ error: 'Calendar unavailable' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json', ...CORS },
      });
    }

    const fbData = await fbRes.json();

    // Merge all busy blocks from all calendars
    const allBusy = [];
    for (const calInfo of Object.values(fbData.calendars || {})) {
      for (const block of calInfo.busy || []) {
        allBusy.push({
          start: new Date(block.start).getTime(),
          end: new Date(block.end).getTime(),
        });
      }
    }

    // Generate slots and filter against merged busy blocks
    const slots = [];
    const now = Date.now();

    for (let h = BUSINESS_HOURS.start; h < BUSINESS_HOURS.end; h++) {
      for (let m = 0; m < 60; m += SLOT_DURATION) {
        const slotStart = new Date(`${dateStr}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00${CT_OFFSET}`);
        const slotEnd = new Date(slotStart.getTime() + SLOT_DURATION * 60 * 1000);

        // Skip past slots
        if (slotStart.getTime() < now) continue;

        // Check against all busy blocks
        const isBusy = allBusy.some(
          (busy) => slotStart.getTime() < busy.end && slotEnd.getTime() > busy.start
        );

        if (!isBusy) {
          slots.push({
            start: slotStart.toISOString(),
            time: `${h > 12 ? h - 12 : h}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`,
          });
        }
      }
    }

    return new Response(JSON.stringify({ date: dateStr, slots }), {
      headers: { 'Content-Type': 'application/json', ...CORS },
    });
  } catch (err) {
    console.error('Slots error:', err);
    return new Response(JSON.stringify({ error: 'Something went wrong' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...CORS },
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, { headers: CORS });
}
