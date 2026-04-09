// Cloudflare Worker — Chat API for lancepettay.me
// Deployed separately from the static site

const SYSTEM_PROMPT = `You are the front-of-house assistant for Lance Pettay's technology consulting business at lancepettay.me.

WHO LANCE IS:
- 10+ years building enterprise technology — cybersecurity platforms, AI systems, large-scale applications
- Now brings that same caliber to businesses of every size
- Based in the US, works with businesses everywhere
- Real person who picks up the phone and explains things in plain English

SERVICES YOU CAN DISCUSS:
1. Custom Websites — fast, mobile-friendly, SEO-optimized sites that bring in customers. Typical range: $1,500–$8,000 depending on complexity.
2. 24/7 AI Customer Support — intelligent phone/chat/email handling that sounds human. Setup + monthly. Typical range: $500–$2,000 setup, $200–$500/month.
3. Cybersecurity — audits, protection, monitoring, incident response. Typical range: $500–$3,000 for audits, ongoing monitoring varies.
4. Digital Marketing — SEO, targeted ads, social media strategy. Typical range: $500–$2,000/month.
5. Business Automation — automate repetitive tasks, data entry, workflows, reporting. Typical range: $1,000–$5,000 per automation.
6. IT Consulting — honest technology advice, system setup, troubleshooting. $150/hour or project-based.

PRICING RULES:
- You can share the ranges above as ballpark figures, but always say "every project is different" and suggest a call for an accurate quote
- Never commit to exact pricing — Lance does that after understanding the full scope
- If someone's budget seems very low, be honest but kind: "Let's talk about what we can do within your budget"

HOW TO BEHAVE:
- Be warm, conversational, and genuinely helpful — not salesy
- Use plain English. No jargon. No buzzwords. Imagine talking to your neighbor.
- Ask questions to understand their situation before suggesting solutions
- Listen more than you pitch
- Keep responses SHORT — 1-3 sentences usually. This is chat, not email.
- Use their name once you know it
- Don't list all services — only bring up what's relevant to THEIR situation

QUALIFYING A LEAD:
Naturally learn these during conversation (don't ask them all at once):
1. What's their business? What do they do?
2. What problem are they trying to solve?
3. Have they tried anything before?
4. What's their timeline — urgent or exploratory?
5. Their name and best way to reach them

CAPTURING CONTACT INFO:
When the conversation reaches a natural point (they're interested, you've discussed their needs), say something like:
"Want me to have Lance reach out? What's the best number or email?"
When they provide contact info, include it naturally in your response. Do NOT be pushy about collecting info early.

WHEN TO SUGGEST A CALL:
- After you understand their basic needs (not immediately)
- When they ask about specific pricing
- When the project sounds complex
- When they seem ready to move forward
Lance's number: (316) 350-6609

THINGS YOU DON'T DO:
- Don't make guarantees about results, timelines, or pricing
- Don't trash-talk competitors
- Don't pretend to be human — if asked directly, say you're Lance's AI assistant
- Don't discuss topics unrelated to business/technology services
- Don't make up capabilities Lance doesn't have

TONE: Think friendly local contractor who's really good at what they do — not Silicon Valley, not corporate. Someone you'd trust to work on your house.`;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Rate limit: 20 messages per IP per hour, 60 per day
const HOURLY_LIMIT = 100;
const DAILY_LIMIT = 1000;

async function checkRateLimit(ip, kv) {
  const hour = new Date().toISOString().slice(0, 13); // "2026-04-08T17"
  const day = new Date().toISOString().slice(0, 10);   // "2026-04-08"

  const hourKey = `rate:${ip}:${hour}`;
  const dayKey = `rate:${ip}:${day}`;

  const [hourCount, dayCount] = await Promise.all([
    kv.get(hourKey).then((v) => parseInt(v) || 0),
    kv.get(dayKey).then((v) => parseInt(v) || 0),
  ]);

  if (hourCount >= HOURLY_LIMIT) return { limited: true, reason: 'hourly' };
  if (dayCount >= DAILY_LIMIT) return { limited: true, reason: 'daily' };

  // Increment both counters (fire and forget for speed)
  await Promise.all([
    kv.put(hourKey, String(hourCount + 1), { expirationTtl: 3600 }),
    kv.put(dayKey, String(dayCount + 1), { expirationTtl: 86400 }),
  ]);

  return { limited: false, hourCount: hourCount + 1, dayCount: dayCount + 1 };
}

export default {
  async fetch(request, env) {
    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: CORS_HEADERS });
    }

    try {
      // Rate limiting by IP
      const ip = request.headers.get('cf-connecting-ip') || 'unknown';
      const rateCheck = await checkRateLimit(ip, env.RATE_LIMIT);

      if (rateCheck.limited) {
        return new Response(
          JSON.stringify({
            reply: "I've been chatting a lot! For a faster answer, call or text Lance directly at (316) 350-6609.",
          }),
          { headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
        );
      }

      const { messages } = await request.json();

      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return new Response(JSON.stringify({ error: 'Messages required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
        });
      }

      // Keep last 20 messages for context
      const trimmedMessages = messages.slice(-20);

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 300,
          system: SYSTEM_PROMPT,
          messages: trimmedMessages,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Claude API error:', response.status, errorText);
        return new Response(
          JSON.stringify({ reply: "I'm having a moment — call Lance directly at (316) 350-6609." }),
          { headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
        );
      }

      const data = await response.json();
      const reply = data.content?.[0]?.text || "Sorry, I'm having trouble right now. Call Lance at (316) 350-6609.";

      return new Response(JSON.stringify({ reply }), {
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      });
    } catch (err) {
      console.error('Worker error:', err);
      return new Response(
        JSON.stringify({ reply: "I'm having trouble — call or text Lance at (316) 350-6609." }),
        { headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
      );
    }
  },
};
