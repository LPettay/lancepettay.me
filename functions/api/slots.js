// GET /api/slots?date=2026-04-10
// Returns available 30-min consultation slots from Google Calendar

const BUSINESS_HOURS = { start: 9, end: 17 }; // 9 AM - 5 PM
const SLOT_DURATION = 30; // minutes
const TIMEZONE = 'America/Chicago'; // Central Time

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

    // Get events for the requested date
    const timeMin = `${dateStr}T00:00:00-06:00`;
    const timeMax = `${dateStr}T23:59:59-06:00`;

    const calRes = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
      `timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}` +
      `&singleEvents=true&orderBy=startTime`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!calRes.ok) {
      console.error('Calendar API error:', calRes.status, await calRes.text());
      return new Response(JSON.stringify({ error: 'Calendar unavailable' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json', ...CORS },
      });
    }

    const calData = await calRes.json();
    const busySlots = (calData.items || []).map((e) => ({
      start: new Date(e.start.dateTime || e.start.date).getTime(),
      end: new Date(e.end.dateTime || e.end.date).getTime(),
    }));

    // Generate all possible slots during business hours
    const slots = [];
    const baseDate = new Date(`${dateStr}T${String(BUSINESS_HOURS.start).padStart(2, '0')}:00:00`);

    // Adjust for Central Time offset (rough — Worker doesn't have full TZ support)
    // We'll work in UTC offsets
    for (let h = BUSINESS_HOURS.start; h < BUSINESS_HOURS.end; h++) {
      for (let m = 0; m < 60; m += SLOT_DURATION) {
        const slotStart = new Date(`${dateStr}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00-05:00`);
        const slotEnd = new Date(slotStart.getTime() + SLOT_DURATION * 60 * 1000);

        // Check if slot conflicts with any busy period
        const isBusy = busySlots.some(
          (busy) => slotStart.getTime() < busy.end && slotEnd.getTime() > busy.start
        );

        // Don't show slots in the past
        const now = new Date();
        if (slotStart.getTime() < now.getTime()) continue;

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
