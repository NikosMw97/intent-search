import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export const runtime = 'nodejs';

const anthropic = new Anthropic();

export async function POST(req: NextRequest) {
  const { providerName, category, website } = await req.json() as {
    providerName: string;
    category: string;
    website?: string;
  };

  const msg = await anthropic.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 200,
    messages: [{
      role: 'user',
      content: `Write a compelling 2-sentence offer description for a provider called "${providerName}" in the ${category} category${website ? ` (${website})` : ''}.
      Focus on their value proposition and why customers should choose them.
      Be specific and persuasive. Return ONLY the description text, no quotes.`
    }]
  });

  const text = msg.content[0].type === 'text' ? msg.content[0].text.trim() : '';
  return NextResponse.json({ description: text });
}
