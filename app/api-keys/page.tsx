'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo';

const STORAGE_KEY = 'intent_api_key';

function generateKey(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz0123456789';
  const segments = [8, 4, 4, 4, 12];
  return 'isk-' + segments.map((len) =>
    Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  ).join('-');
}

function CodeBlock({ code, label }: { code: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="rounded-xl border border-white/8 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 bg-white/3 border-b border-white/6">
        <span className="text-xs text-white/30 font-mono">{label}</span>
        <button
          onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
          className="text-xs text-white/30 hover:text-white/60 transition-colors"
        >
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
      <pre className="px-4 py-3 text-xs text-white/60 font-mono overflow-x-auto leading-relaxed whitespace-pre-wrap">{code}</pre>
    </div>
  );
}

export default function ApiKeysPage() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [revealConfirm, setRevealConfirm] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setApiKey(stored);
  }, []);

  const handleGenerate = () => {
    const key = generateKey();
    localStorage.setItem(STORAGE_KEY, key);
    setApiKey(key);
    setShowKey(true);
  };

  const handleRevoke = () => {
    localStorage.removeItem(STORAGE_KEY);
    setApiKey(null);
    setShowKey(false);
    setRevealConfirm(false);
  };

  const handleCopy = () => {
    if (apiKey) { navigator.clipboard.writeText(apiKey); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  };

  const maskedKey = apiKey ? apiKey.slice(0, 8) + '•'.repeat(24) + apiKey.slice(-4) : '';

  const curlExample = apiKey
    ? `curl -X POST https://your-intent-app.vercel.app/api/intent \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: ${apiKey}" \\
  -d '{"query": "Best laptop under €1200 for programming"}'`
    : `curl -X POST https://your-intent-app.vercel.app/api/intent \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: isk-YOUR_KEY_HERE" \\
  -d '{"query": "Best laptop under €1200 for programming"}'`;

  const jsExample = `import { IntentClient } from '@intent/sdk';

const client = new IntentClient({
  apiKey: '${apiKey ?? 'isk-YOUR_KEY_HERE'}',
});

const results = await client.search({
  query: 'Best laptop under €1200 for programming',
});

console.log(results.ranked[0]); // Top result with reasoning`;

  const responseExample = `{
  "intent": {
    "category": "electronics",
    "budget": 1200,
    "currency": "EUR",
    "keywords": ["laptop", "programming"]
  },
  "results": [
    {
      "rank": 1,
      "score": 94,
      "offer": {
        "name": "MacBook Air M2",
        "price": 1149,
        "providerName": "TechMart"
      },
      "badges": ["best-match"],
      "reasoning": "Excellent budget fit at €1149..."
    }
  ],
  "stats": {
    "totalProviders": 5,
    "totalOffers": 12,
    "searchTimeMs": 842
  }
}`;

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/6">
        <Link href="/"><Logo size={34} showName showTagline={false} /></Link>
        <span className="text-xs text-white/30 border border-white/10 px-3 py-1.5 rounded-full">
          🔑 API Keys
        </span>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Intent API</h1>
          <p className="text-white/40">Integrate the intent engine into your own products. Parse natural language, rank offers, and stream results — all via REST.</p>
        </div>

        {/* Key management */}
        <div className="rounded-2xl border border-white/8 bg-surface p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Your API Key</h2>

          {!apiKey ? (
            <div className="text-center py-6">
              <p className="text-sm text-white/40 mb-4">No API key yet. Generate one to get started.</p>
              <button
                onClick={handleGenerate}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold transition-colors"
              >
                Generate API Key →
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-white/8 bg-white/3">
                <code className="text-sm text-white/70 font-mono flex-1 truncate">
                  {showKey ? apiKey : maskedKey}
                </code>
                <button
                  onClick={() => setShowKey((v) => !v)}
                  className="text-xs text-white/30 hover:text-white/60 transition-colors flex-shrink-0"
                >
                  {showKey ? 'Hide' : 'Show'}
                </button>
                <button
                  onClick={handleCopy}
                  className="text-xs text-white/30 hover:text-white/60 transition-colors flex-shrink-0"
                >
                  {copied ? '✓' : 'Copy'}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                <span className="text-xs text-white/35">Active · Created just now</span>
                <button
                  onClick={() => setRevealConfirm(true)}
                  className="ml-auto text-xs text-red-400/60 hover:text-red-400 transition-colors"
                >
                  Revoke
                </button>
              </div>

              {revealConfirm && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/8 px-4 py-3 flex items-center justify-between gap-3">
                  <p className="text-xs text-red-300">Revoke this key? This cannot be undone.</p>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={handleRevoke} className="text-xs text-red-400 hover:text-red-300 font-semibold">Revoke</button>
                    <button onClick={() => setRevealConfirm(false)} className="text-xs text-white/30 hover:text-white/60">Cancel</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Usage stats (mock) */}
        {apiKey && (
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Requests today',  value: '0' },
              { label: 'Total requests',  value: '0' },
              { label: 'Rate limit',      value: '1,000 / day' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl border border-white/8 bg-surface p-4 text-center">
                <p className="text-xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-white/35 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Code examples */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-white">Quick Start</h2>
          <CodeBlock label="cURL" code={curlExample} />
          <CodeBlock label="JavaScript / TypeScript" code={jsExample} />
          <CodeBlock label="Response" code={responseExample} />
        </div>

        {/* Endpoints reference */}
        <div className="rounded-2xl border border-white/8 bg-surface p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Endpoints</h2>
          <div className="space-y-3">
            {[
              { method: 'POST', path: '/api/intent',    desc: 'Parse intent + stream ranked results (NDJSON)' },
              { method: 'POST', path: '/api/bundle',    desc: 'Decompose compound intent into sub-searches'   },
              { method: 'GET',  path: '/api/auction',   desc: 'Open live auction SSE stream for a query'      },
              { method: 'POST', path: '/api/negotiate', desc: 'Start AI negotiation for a given offer'        },
            ].map((ep) => (
              <div key={ep.path} className="flex items-center gap-3">
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded flex-shrink-0 ${
                  ep.method === 'POST' ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'
                }`}>{ep.method}</span>
                <code className="text-xs text-white/60 font-mono flex-shrink-0">{ep.path}</code>
                <span className="text-xs text-white/30 truncate">{ep.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
