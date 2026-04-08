import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export const runtime = 'nodejs';

const anthropic = new Anthropic();

export async function POST(req: NextRequest) {
  const { providerName, providerLogo, offerName, offerPrice, messages } = await req.json() as {
    providerName: string;
    providerLogo: string;
    offerName: string;
    offerPrice: number;
    messages: { role: 'user' | 'assistant'; content: string }[];
  };

  const system = `You are a sales representative for "${providerName}" (${providerLogo}).
You are chatting with a potential customer about: "${offerName}" priced at €${offerPrice}.
Be helpful, friendly, and professional. You can offer small discounts (up to 10%) if the customer negotiates.
Keep responses short (2-3 sentences max). Stay in character as a ${providerName} representative.
Never break character. If asked about things unrelated to the offer, politely redirect.`;

  const stream = await anthropic.messages.stream({
    model: 'claude-opus-4-6',
    max_tokens: 256,
    system,
    messages,
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
          controller.enqueue(encoder.encode(chunk.delta.text));
        }
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-cache' },
  });
}
