'use client';

import { useEffect, useRef, useCallback } from 'react';
import {
  GraphParticle,
  CATEGORY_CONFIG,
  createParticle,
  tickParticles,
  buildStats,
  Category,
} from '@/lib/graphSimulator';

interface Props {
  onStatsUpdate: (stats: ReturnType<typeof buildStats>) => void;
  liveQuery?: { query: string; category: Category } | null;
}

const SPAWN_INTERVAL_MS = 1400;
const MAX_PARTICLES = 80;
const CONNECTION_DISTANCE = 70;

export default function IntentGraph({ onStatsUpdate, liveQuery }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<GraphParticle[]>([]);
  const lastSpawnRef = useRef(0);
  const lastTickRef = useRef(0);
  const allTimeTotalRef = useRef(0);
  const rafRef = useRef<number>(0);
  const pendingQueryRef = useRef<{ query: string; category: Category } | null>(null);

  // Whenever a live query arrives, queue it
  useEffect(() => {
    if (liveQuery) pendingQueryRef.current = liveQuery;
  }, [liveQuery]);

  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, particles: GraphParticle[]) => {
    ctx.clearRect(0, 0, w, h);

    // Draw faint cluster labels
    (Object.entries(CATEGORY_CONFIG) as [Category, typeof CATEGORY_CONFIG[Category]][]).forEach(([, cfg]) => {
      const cx = cfg.clusterFrac[0] * w;
      const cy = cfg.clusterFrac[1] * h;
      ctx.save();
      ctx.font = '10px Inter, sans-serif';
      ctx.fillStyle = cfg.color + '28';
      ctx.textAlign = 'center';
      ctx.fillText(cfg.label.toUpperCase(), cx, cy - 22);
      ctx.restore();
    });

    // Draw connection lines between nearby same-category particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i];
        const b = particles[j];
        if (a.category !== b.category) continue;
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > CONNECTION_DISTANCE) continue;
        const alpha = (1 - dist / CONNECTION_DISTANCE) * 0.18 * Math.min(a.opacity, b.opacity);
        const color = CATEGORY_CONFIG[a.category].color;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = color;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
        ctx.restore();
      }
    }

    // Draw particles
    particles.forEach((p) => {
      const color = CATEGORY_CONFIG[p.category].color;
      ctx.save();
      ctx.globalAlpha = p.opacity;

      // Outer glow
      const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3.5);
      gradient.addColorStop(0, color + 'cc');
      gradient.addColorStop(0.4, color + '44');
      gradient.addColorStop(1, color + '00');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Core dot
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);

    const loop = (now: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      const dt = lastTickRef.current === 0 ? 16 : Math.min(now - lastTickRef.current, 100);
      lastTickRef.current = now;

      // Spawn auto particles
      if (now - lastSpawnRef.current > SPAWN_INTERVAL_MS && particlesRef.current.length < MAX_PARTICLES) {
        particlesRef.current.push(createParticle(w, h));
        allTimeTotalRef.current++;
        lastSpawnRef.current = now;
      }

      // Spawn live query particle
      if (pendingQueryRef.current) {
        const pq = pendingQueryRef.current;
        pendingQueryRef.current = null;
        const p = createParticle(w, h, pq.category);
        particlesRef.current.push({ ...p, query: pq.query, size: p.size + 2, maxAge: p.maxAge + 3000 });
        allTimeTotalRef.current++;
      }

      particlesRef.current = tickParticles(particlesRef.current, dt, w, h);
      draw(ctx, w, h, particlesRef.current);
      onStatsUpdate(buildStats(particlesRef.current, allTimeTotalRef.current));

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [draw, onStatsUpdate]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ display: 'block' }}
    />
  );
}
