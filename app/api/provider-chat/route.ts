import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const RESPONSES = [
  (name: string, price: number) => `Thanks for your interest! ${name} is one of our best sellers at €${price}. Can I answer any questions about specs or delivery?`,
  (_: string, price: number) => `Great choice! We can offer free express shipping if you order today. The price of €${price} is already our best rate.`,
  (_: string, price: number) => `I understand you're comparing options. I can offer a 5% discount bringing it to €${Math.round(price * 0.95)} if you commit today. Interested?`,
  () => `Absolutely, we have that in stock and ready to ship within 24 hours. Our return policy is 30 days, no questions asked.`,
  (_: string, price: number) => `That's a fair point. Let me see what I can do — I can go as low as €${Math.round(price * 0.9)}, which is our floor price. That's a 10% saving!`,
  () => `We've had excellent reviews on this item — 4.8 stars from over 2,000 customers. Would you like me to share some highlights?`,
  () => `Happy to help! Is there anything specific holding you back from making a decision today?`,
];

function pickResponse(providerName: string, offerPrice: number, userMessage: string): string {
  const lower = userMessage.toLowerCase();
  if (/discount|cheaper|lower|price|deal|offer/.test(lower)) {
    return `I can offer you a ${Math.floor(Math.random() * 5) + 5}% discount, bringing it to €${Math.round(offerPrice * 0.93)}. That's the best I can do — shall I lock that in for you?`;
  }
  if (/ship|deliver|fast|quick|when/.test(lower)) {
    return `We offer next-day delivery for orders placed before 3pm. Standard shipping (2–3 days) is free on this item.`;
  }
  if (/return|refund|warranty/.test(lower)) {
    return `We have a 30-day hassle-free return policy and a 2-year warranty on this product. Your purchase is fully protected.`;
  }
  if (/stock|available|left/.test(lower)) {
    return `Yes, we have ${Math.floor(Math.random() * 8) + 3} units in stock. Given demand, I'd recommend securing yours soon!`;
  }
  // Pick a contextual response based on message index
  const pick = RESPONSES[Math.floor(Math.random() * RESPONSES.length)];
  return pick(providerName, offerPrice);
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function POST(req: NextRequest) {
  const { providerName, offerPrice, messages } = await req.json() as {
    providerName: string;
    providerLogo: string;
    offerName: string;
    offerPrice: number;
    messages: { role: 'user' | 'assistant'; content: string }[];
  };

  // Simulate thinking time
  await delay(600 + Math.random() * 600);

  const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user')?.content ?? '';
  const text = pickResponse(providerName, offerPrice, lastUserMsg);

  return NextResponse.json({ text });
}
