import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export const runtime = 'nodejs';

const anthropic = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('image') as File | null;
    if (!file) return NextResponse.json({ error: 'No image' }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');
    const mediaType = (file.type || 'image/jpeg') as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';

    const msg = await anthropic.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 256,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
          { type: 'text', text: 'Identify this product in one short search query (max 8 words). Return ONLY the query, nothing else. Example: "Sony WH-1000XM5 wireless headphones"' }
        ]
      }]
    });

    const query = msg.content[0].type === 'text' ? msg.content[0].text.trim() : '';
    return NextResponse.json({ query });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
