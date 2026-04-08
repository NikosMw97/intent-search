import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export const runtime = 'nodejs';

const anthropic = new Anthropic();

export async function POST(req: NextRequest) {
  try {
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

    const msg = await anthropic.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 256,
      system,
      messages,
    });

    const text = msg.content[0].type === 'text' ? msg.content[0].text : 'Sorry, I could not respond right now.';
    return NextResponse.json({ text });
  } catch (err) {
    console.error('provider-chat error:', err);
    return NextResponse.json({ text: 'Sorry, something went wrong. Please try again.' }, { status: 200 });
  }
}
