import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

// ─── Request / Response types ──────────────────────────────────────────────

export interface ImproviseRequest {
  /** The original dare text that is not feasible */
  originalDare: string;
  /** Dare level 1-5 (Mild → Wild) */
  level: 1 | 2 | 3 | 4 | 5;
  /** Tags on the dare, e.g. ['flirty', 'physical'] */
  tags: string[];
  /** Name of the player receiving the dare */
  playerName: string;
  /** One-line reason the dare isn't feasible (optional) */
  reason?: string;
}

export interface ImproviseResponse {
  improvisedText: string;
}

// ─── Groq client (server-only) ─────────────────────────────────────────────

function getClient(): Groq {
  const key = process.env.GROQ_API_KEY;
  if (!key || key === 'your_groq_api_key_here') {
    throw new Error('GROQ_API_KEY is not configured. Add it to .env.local');
  }
  return new Groq({ apiKey: key });
}

// ─── System prompt ─────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are Cirqo's Dare Improv Engine — a sharp, playful rewriter for a premium adult party game.

Your job: take a dare that a player flagged as "not feasible" and rewrite it into something equally fun, bold, and on-brand — but actually doable in the current situation.

RULES:
1. Keep the same energy, boldness level, and tags as the original.
2. Make it fun and a tiny bit cheeky — this is a party, not a board meeting.
3. Replace any impossible or unavailable element (e.g. "text an ex" if no phone, "take a shot" if no drinks) with a creative alternative that works in a typical house-party or group setting.
4. Keep it SHORT — one sentence, max two. No preamble, no explanation, just the dare itself.
5. Address the player by name naturally within the dare text.
6. Match the dare's level:
   - Level 1-2: Mild/Warm — funny, social, no physical contact needed
   - Level 3: Spicy — mildly suggestive or mildly embarrassing
   - Level 4: Bold — directly provocative, requires group interaction
   - Level 5: Wild — maximum boldness, within real-world party limits
7. Output ONLY the dare text. No quotes, no labels, no bullets.`;

// ─── Route handler ─────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body: ImproviseRequest = await req.json();
    const { originalDare, level, tags, playerName, reason } = body;

    if (!originalDare || !playerName) {
      return NextResponse.json(
        { error: 'Missing required fields: originalDare, playerName' },
        { status: 400 }
      );
    }

    const client = getClient();

    const userPrompt = `Original dare: "${originalDare}"
Dare level: ${level}/5
Tags: ${tags.join(', ')}
Player name: ${playerName}
${reason ? `Why it's not feasible: ${reason}` : 'Reason: player flagged it as not feasible for their situation.'}

Rewrite this dare so it works in a typical party setting. One sentence, addressed to ${playerName}.`;

    const completion = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user',   content: userPrompt },
      ],
      temperature: 0.85,
      max_tokens: 120,
    });

    const improvisedText = completion.choices[0]?.message?.content?.trim();

    if (!improvisedText) {
      return NextResponse.json({ error: 'AI returned an empty response' }, { status: 502 });
    }

    const response: ImproviseResponse = { improvisedText };
    return NextResponse.json(response);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[/api/improvise-dare]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
