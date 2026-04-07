# ✦ Intent Search

> **"Tell me what you want. Get the best offer."**
> Intent-Based Internet MVP — Colosseum Hackathon 2025

Instead of typing keywords into a search engine, users express a **natural language intent**.
The system parses it with AI, queries competing providers, ranks the results, and returns the top offers with reasoning — all in one shot.

---

## 🚀 Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment
```bash
cp .env.local.example .env.local
# Edit .env.local and add your ANTHROPIC_API_KEY
```

Get your API key at → https://console.anthropic.com/

### 3. Run the dev server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🧠 How It Works

```
User types: "Best laptop under €1200 for programming"
                         │
                    ┌────▼────┐
                    │  Claude │  ← Intent Parsing
                    └────┬────┘
         ┌───────────────┼───────────────┐
    category: electronics    budget: €1200    constraints: ["for programming"]
                         │
              ┌──────────▼──────────┐
              │   Mock Providers    │  ← Provider Catalogue
              │  TecHub · Amazon    │
              │  MediaMarkt · etc.  │
              └──────────┬──────────┘
                         │  47 offers
                    ┌────▼────┐
                    │ Ranking │  ← Budget · Relevance · Quality
                    └────┬────┘
                         │  Top 5
                    ┌────▼────┐
                    │  Claude │  ← AI Reasoning per result
                    └────┬────┘
                         │
              ┌──────────▼──────────┐
              │   Ranked Results    │
              │  with explanations  │
              └─────────────────────┘
```

---

## 🗂 Project Structure

```
intent-search/
├── app/
│   ├── layout.tsx          # Root layout + global styles
│   ├── page.tsx            # Main page (idle → loading → results)
│   ├── globals.css         # Tailwind + custom design tokens
│   └── api/intent/
│       └── route.ts        # POST /api/intent — core pipeline
│
├── lib/
│   ├── types.ts            # Shared TypeScript interfaces
│   ├── intentParser.ts     # Claude-powered intent extraction
│   ├── rankingEngine.ts    # Algorithmic scoring (budget/relevance/quality)
│   └── providers/
│       ├── index.ts        # Aggregator — routes to correct provider
│       ├── electronics.ts  # Mock electronics catalogue (laptops, phones)
│       ├── flights.ts      # Mock flight offers (route-based pricing)
│       └── freelance.ts    # Mock freelance service offers
│
└── components/
    ├── SearchBox.tsx        # Animated input with typewriter placeholder
    ├── IntentSummary.tsx    # Structured intent visualisation (left panel)
    ├── ResultCard.tsx       # Offer card with score bars + reasoning
    ├── LoadingState.tsx     # Animated multi-step loading indicator
    └── WalletButton.tsx     # Solana wallet connect (structure ready)
```

---

## 🎯 Example Queries

| Query | Category | Budget |
|-------|----------|--------|
| `Best laptop under €1200 for programming` | Electronics | €1200 |
| `Cheap flight from Athens to Paris` | Flights | – |
| `Hire a logo designer under €100` | Freelance | €100 |
| `Best phone under €800` | Electronics | €800 |
| `React developer for a landing page` | Freelance | – |

---

## ⚡ Architecture Highlights

### Intent Parser (`lib/intentParser.ts`)
- Uses `claude-opus-4-6` to extract structured JSON from any natural language query
- Falls back to regex heuristics if Claude is unavailable
- Extracts: category, budget, currency, keywords, constraints, origin/destination

### Ranking Engine (`lib/rankingEngine.ts`)
- **Budget match** (40%): penalises over-budget items, slight penalty for very cheap
- **Relevance** (35%): keyword/feature overlap + name match boost
- **Quality** (25%): rating × reviewCount (log-scale) + availability signals
- Assigns badges: Best Match · Best Value · Top Rated · Fastest Delivery

### AI Reasoning (`app/api/intent/route.ts`)
- Sends top 5 offers to Claude with original query
- Returns one concise sentence per offer explaining *why* it matches
- Template fallback for offline/error scenarios

### Solana Wallet (`components/WalletButton.tsx`)
- Structural integration ready for `@solana/wallet-adapter`
- Mock connect/disconnect for demo
- "Pay with SOL" buttons on each result card

---

## 🔧 Extending to Real APIs

Replace mock data in `lib/providers/` with real API calls:

```typescript
// lib/providers/electronics.ts
export async function getElectronicsOffers(intent: ParsedIntent) {
  // Replace with: Amazon API, Google Shopping, Skroutz API, etc.
  const response = await fetch(`https://api.real-provider.com/search?q=${intent.keywords.join('+')}`);
  return await response.json();
}
```

---

## 🏆 Hackathon Notes

- **Stack**: Next.js 14 · TypeScript · Tailwind CSS · Claude (Anthropic)
- **Demo categories**: Electronics · Flights · Freelance
- **Wallet**: Solana-ready structure (no full chain needed for MVP)
- **Latency**: ~2–3s (Claude parsing + reasoning, real APIs would add ~1s)

---

## 📄 License

MIT — built for Colosseum Hackathon 2025
