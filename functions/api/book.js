// POST /api/book { name, email, phone, slot, notes }
// Creates a Google Calendar event with both Lance and the client as attendees
// Google sends invite emails to everyone automatically

const LANCE_EMAIL = 'lancepettay@gmail.com';

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
    const { name, email, phone, slot, notes } = await request.json();

    if (!name || !email || !slot) {
      return new Response(JSON.stringify({ error: 'name, email, and slot are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...CORS },
      });
    }

    const token = await getAccessToken(env);
    const startTime = new Date(slot);
    const endTime = new Date(startTime.getTime() + 30 * 60 * 1000);

    const description = [
      'Free 30-minute consultation booked via lancepettay.me',
      '',
      `Name: ${name}`,
      `Email: ${email}`,
      phone ? `Phone: ${phone}` : '',
      notes ? `Notes: ${notes}` : '',
      '',
      'Booked automatically — respond or reschedule as needed.',
    ].filter(Boolean).join('\n');

    const event = {
      summary: `Consultation — ${name}`,
      description,
      start: {
        dateTime: startTime.toISOString(),
        timeZone: 'America/Chicago',
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: 'America/Chicago',
      },
      attendees: [
        { email: LANCE_EMAIL, responseStatus: 'accepted' },
        { email: email, displayName: name },
      ],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 60 },
          { method: 'popup', minutes: 30 },
          { method: 'popup', minutes: 10 },
        ],
      },
      guestsCanModify: false,
      guestsCanSeeOtherGuests: false,
    };

    // sendUpdates=all tells Google to email invites to all attendees
    const calRes = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events?sendUpdates=all',
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
      message: `You're booked! Check your email for the calendar invite.`,
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
