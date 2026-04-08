import { NextRequest } from 'next/server';
import { parseBundleIntent, looksLikeBundle } from '@/lib/bundleParser';
import { parseIntent } from '@/lib/intentParser';
import { fetchAllOffers } from '@/lib/providers';
import { rankOffers } from '@/lib/rankingEngine';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const { query } = await req.json() as { query: string };

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (obj: object) => {
        controller.enqueue(encoder.encode(JSON.stringify(obj) + '\n'));
      };

      try {
        // 1. Quick heuristic check
        if (!looksLikeBundle(query)) {
          send({ type: 'not_bundle' });
          controller.close();
          return;
        }

        // 2. Parse into sub-intents via Claude
        const plan = await parseBundleIntent(query);
        if (!plan.isBundle || plan.subIntents.length === 0) {
          send({ type: 'not_bundle' });
          controller.close();
          return;
        }

        send({ type: 'plan', data: plan });

        // 3. Run each sub-intent through the full pipeline in parallel
        const subResults = await Promise.all(
          plan.subIntents.map(async (sub) => {
            const intent = await parseIntent(sub.query);
            const { offers } = fetchAllOffers(intent);
            const ranked = rankOffers(offers, intent).slice(0, 3);
            return { sub, intent, results: ranked };
          })
        );

        // 4. Stream each sub-result
        let totalMin = 0;
        let totalMax = 0;
        for (const sr of subResults) {
          send({ type: 'sub_result', data: sr });
          if (sr.results.length > 0) {
            const cheapest = sr.results[sr.results.length - 1].offer.price;
            const dearest  = sr.results[0].offer.price;
            totalMin += cheapest;
            totalMax += dearest;
          }
          // Small stagger so the UI can animate each one in
          await new Promise((r) => setTimeout(r, 300));
        }

        // 5. Summary
        send({
          type: 'bundle_done',
          data: {
            title: plan.title,
            subCount: plan.subIntents.length,
            totalMin: Math.round(totalMin),
            totalMax: Math.round(totalMax),
          },
        });
      } catch (err) {
        send({ type: 'error', message: String(err) });
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: { 'Content-Type': 'application/x-ndjson', 'Cache-Control': 'no-cache' },
  });
}
