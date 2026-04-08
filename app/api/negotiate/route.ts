import { NextRequest } from 'next/server';

export const runtime = 'nodejs';

interface NegotiationStep {
  round: number;
  type: 'offer' | 'counter' | 'accept' | 'reject' | 'thinking';
  providerName: string;
  providerLogo: string;
  price?: number;
  message: string;
}

export async function POST(req: NextRequest) {
  const { query, startPrice, budget } = await req.json() as { query: string; startPrice: number; budget: number };

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (step: NegotiationStep) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(step)}\n\n`));
      };

      const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

      // Simulated negotiation sequence
      const providers = [
        { name: 'TechMart', logo: '🛒' },
        { name: 'MediaMarkt', logo: '🔴' },
        { name: 'Skroutz', logo: '🔶' },
      ];

      let currentBest = startPrice;
      const target = Math.max(budget, startPrice * 0.75);

      send({ round: 0, type: 'thinking', providerName: 'AI Agent', providerLogo: '🤖', message: `Analyzing market. Starting price: €${startPrice}. Your budget: €${budget}.` });
      await delay(1200);

      for (let round = 1; round <= 4; round++) {
        const provider = providers[round % providers.length];
        const counterPrice = Math.round(currentBest * (0.92 - round * 0.02));

        send({ round, type: 'counter', providerName: 'AI Agent', providerLogo: '🤖', price: counterPrice, message: `Round ${round}: Proposing €${counterPrice} to ${provider.name}…` });
        await delay(1000);

        if (counterPrice <= target + 20 || round === 4) {
          const acceptPrice = counterPrice + Math.round(Math.random() * 15);
          send({ round, type: 'offer', providerName: provider.name, providerLogo: provider.logo, price: acceptPrice, message: `We can do €${acceptPrice} — final offer.` });
          await delay(800);

          if (acceptPrice <= budget) {
            send({ round, type: 'accept', providerName: 'AI Agent', providerLogo: '🤖', price: acceptPrice, message: `Deal secured at €${acceptPrice}! That's €${startPrice - acceptPrice} saved.` });
          } else {
            send({ round, type: 'reject', providerName: 'AI Agent', providerLogo: '🤖', message: `Best offer €${acceptPrice} exceeds budget. Try adjusting your limit.` });
          }
          break;
        } else {
          const providerCounter = Math.round(currentBest * (0.96 - round * 0.01));
          send({ round, type: 'offer', providerName: provider.name, providerLogo: provider.logo, price: providerCounter, message: `Best I can do is €${providerCounter}.` });
          currentBest = providerCounter;
          await delay(900);
        }
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
  });
}
