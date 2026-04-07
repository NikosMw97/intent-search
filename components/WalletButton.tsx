'use client';

import { useState } from 'react';

// Solana wallet integration — structure ready for @solana/wallet-adapter
// For the hackathon MVP we simulate wallet connect/disconnect.

function truncateAddress(addr: string) {
  return `${addr.slice(0, 4)}…${addr.slice(-4)}`;
}

// Mock wallet address (would come from wallet adapter in production)
const MOCK_ADDRESS = '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU';

export default function WalletButton() {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    setLoading(true);
    // Simulate wallet handshake delay
    await new Promise((r) => setTimeout(r, 800));
    setConnected(true);
    setLoading(false);
  };

  const handleDisconnect = () => {
    setConnected(false);
  };

  if (connected) {
    return (
      <button
        onClick={handleDisconnect}
        className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[#9945FF]/30 bg-[#9945FF]/10 hover:bg-[#9945FF]/20 transition-all duration-200 group"
      >
        <div className="w-2 h-2 rounded-full bg-green-400" />
        <span className="text-xs font-mono text-[#9945FF]">
          ◎ {truncateAddress(MOCK_ADDRESS)}
        </span>
        <span className="text-xs text-white/20 group-hover:text-white/40 transition-colors">✕</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleConnect}
      disabled={loading}
      className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 hover:border-[#9945FF]/40 hover:bg-[#9945FF]/10 text-white/50 hover:text-[#9945FF] transition-all duration-200 text-xs"
    >
      {loading ? (
        <>
          <div className="w-3 h-3 border border-[#9945FF]/40 border-t-[#9945FF] rounded-full animate-spin" />
          <span>Connecting…</span>
        </>
      ) : (
        <>
          <span className="text-base leading-none">◎</span>
          <span>Connect Wallet</span>
        </>
      )}
    </button>
  );
}
