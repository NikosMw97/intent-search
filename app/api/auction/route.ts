/**
 * GET /api/auction?q=...&budget=...&category=...
 *
 * Server-Sent Events stream. Replays a scripted auction sequence
 * generated from the user's intent, simulating real-time provider competition.
 *
 * Events are plain SSE: `data: <JSON>\n\n`
 */

import { NextRequest } from 'next/server';
import { generateAuctionScript } from '@/lib/auctionScripts';
import type { ParsedIntent } from '@/lib/types';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query    = searchParams.get('q')        ?? '';
  const budget   = Number(searchParams.get('budget')   ?? 0) || undefined;
  const category = (searchParams.get('category') ?? 'general') as ParsedIntent['category'];

  // Reconstruct a minimal ParsedIntent from URL params
  const intent: ParsedIntent = {
    raw: query,
    category,
    budget,
    currency: 'EUR',
    keywords: query.toLowerCase().split(' ').filter((w) => w.length > 3).slice(0, 4),
    constraints: [],
  };

  const script = generateAuctionScript(intent);

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch { /* closed */ }
      };

      // Send initial "auction open" event immediately
      send({ type: 'open', totalEvents: script.length });

      // Replay each scripted event at its scheduled delay
      let lastDelay = 0;
      for (const event of script) {
        const wait = event.delay - lastDelay;
        await new Promise((r) => setTimeout(r, wait));
        lastDelay = event.delay;
        send(event);
        if (event.type === 'end') break;
      }

      try { controller.close(); } catch { /* already closed */ }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type':  'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection':    'keep-alive',
      'X-Accel-Buffering': 'no', // disable nginx buffering
    },
  });
}
