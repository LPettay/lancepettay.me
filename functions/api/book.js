// POST /api/book { name, contact, slot, notes }
// Creates a Google Calendar event for a consultation

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
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const { name, contact, slot, notes } = await request.json();

    if (!name || !contact || !slot) {
      return new Response(JSON.stringify({ error: 'name, contact, and slot are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...CORS },
      });
    }

    const token = await getAccessToken(env);
    const startTime = new Date(slot);
    const endTime = new Date(startTime.getTime() + 30 * 60 * 1000);

    const event = {
      summary: `Consultation — ${name}`,
      description: `Free 30-minute consultation booked via lancepettay.me\n\nName: ${name}\nContact: ${contact}\n${notes ? 'Notes: ' + notes : ''}\n\nBooked automatically.`,
      start: {
        dateTime: startTime.toISOString(),
        timeZone: 'America/Chicago',
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: 'America/Chicago',
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: 30 },
          { method: 'popup', minutes: 10 },
        ],
      },
    };

    const calRes = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      }
    );

    if (!calRes.ok) {
      console.error('Calendar create error:', calRes.status, await calRes.text());
      return new Response(
        JSON.stringify({ error: 'Could not book the slot. Please try another time or call (316) 350-6609.' }),
        { status: 502, headers: { 'Content-Type': 'application/json', ...CORS } }
      );
    }

    const created = await calRes.json();

    return new Response(JSON.stringify({
      success: true,
      event_id: created.id,
      time: startTime.toISOString(),
      message: `You're booked! Lance will call you at the scheduled time.`,
    }), {
      headers: { 'Content-Type': 'application/json', ...CORS },
    });
  } catch (err) {
    console.error('Book error:', err);
    return new Response(
      JSON.stringify({ error: 'Something went wrong. Call Lance at (316) 350-6609.' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...CORS } }
    );
  }
}

export async function onRequestOptions() {
  return new Response(null, { headers: CORS });
}
