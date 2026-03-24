'use client';

import { motion, useAnimation } from 'framer-motion';
import { useEffect, useRef } from 'react';

interface SpinWheelProps {
  players: { id: string; name: string; avatar: string }[];
  onSpinComplete: (playerIndex: number) => void;
  isSpinning: boolean;
  winnerId: string | null;
  spinnerIndex: number;
}

// Premium segment color palette
const SEGMENT_COLORS = [
  ['#e8b86d', '#d4952a'],
  ['#c084fc', '#9333ea'],
  ['#60a5fa', '#2563eb'],
  ['#34d399', '#059669'],
  ['#f87171', '#dc2626'],
  ['#fb923c', '#ea580c'],
  ['#a78bfa', '#7c3aed'],
  ['#38bdf8', '#0284c7'],
  ['#4ade80', '#16a34a'],
  ['#fbbf24', '#d97706'],
];

export default function SpinWheel({
  players,
  onSpinComplete,
  isSpinning,
  winnerId,
  spinnerIndex,
}: SpinWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rotationRef = useRef(0);
  const animFrameRef = useRef<number | null>(null);

  const numPlayers = players.length;
  const arcSize = (2 * Math.PI) / numPlayers;

  const drawWheel = (rotation: number, glowSegment: number | null = null) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2;
    const radius = Math.min(cx, cy) - 10;

    ctx.clearRect(0, 0, W, H);

    // Outer glow ring
    const glowGrad = ctx.createRadialGradient(cx, cy, radius - 2, cx, cy, radius + 14);
    glowGrad.addColorStop(0, 'rgba(232,184,109,0.15)');
    glowGrad.addColorStop(1, 'rgba(232,184,109,0)');
    ctx.beginPath();
    ctx.arc(cx, cy, radius + 10, 0, 2 * Math.PI);
    ctx.fillStyle = glowGrad;
    ctx.fill();

    // Draw segments
    players.forEach((player, i) => {
      const startAngle = rotation + i * arcSize - Math.PI / 2;
      const endAngle = startAngle + arcSize;
      const colors = SEGMENT_COLORS[i % SEGMENT_COLORS.length];
      const isWinnerSegment = glowSegment === i;

      // Segment gradient fill
      const midAngle = startAngle + arcSize / 2;
      const gx = cx + (radius * 0.5) * Math.cos(midAngle);
      const gy = cy + (radius * 0.5) * Math.sin(midAngle);
      const segGrad = ctx.createRadialGradient(gx, gy, 0, cx, cy, radius);
      segGrad.addColorStop(0, isWinnerSegment ? colors[0] + 'ff' : colors[0] + 'dd');
      segGrad.addColorStop(1, isWinnerSegment ? colors[1] + 'ee' : colors[1] + 'aa');

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = segGrad;
      ctx.fill();

      // Winner segment extra glow
      if (isWinnerSegment) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.shadowColor = colors[0];
        ctx.shadowBlur = 20;
        ctx.strokeStyle = colors[0];
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.restore();
      }

      // Segment border
      ctx.strokeStyle = 'rgba(10,10,15,0.6)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.stroke();

      // Label
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(startAngle + arcSize / 2);
      ctx.textAlign = 'right';

      const fontSize = Math.max(14, Math.min(20, 180 / numPlayers));
      ctx.font = `${fontSize}px serif`;
      ctx.fillStyle = 'rgba(255,255,255,0.95)';
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 3;
      ctx.fillText(player.avatar, radius - 8, fontSize / 3);

      const nameFontSize = Math.max(9, Math.min(13, 140 / numPlayers));
      ctx.font = `600 ${nameFontSize}px Inter, sans-serif`;
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      const maxChars = Math.floor(radius / 10);
      const displayName = player.name.length > maxChars ? player.name.slice(0, maxChars - 1) + '…' : player.name;
      ctx.fillText(displayName, radius - fontSize - 6, fontSize / 3);

      ctx.restore();
    });

    // Center hub
    const hubGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 28);
    hubGrad.addColorStop(0, '#1a1a24');
    hubGrad.addColorStop(1, '#0a0a0f');
    ctx.beginPath();
    ctx.arc(cx, cy, 28, 0, 2 * Math.PI);
    ctx.fillStyle = hubGrad;
    ctx.fill();
    ctx.strokeStyle = 'rgba(232,184,109,0.4)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Cirqo "S"
    ctx.font = 'bold 14px "Space Grotesk", Inter, sans-serif';
    ctx.fillStyle = '#e8b86d';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(232,184,109,0.6)';
    ctx.shadowBlur = 8;
    ctx.fillText('S', cx, cy);
    ctx.shadowBlur = 0;

    // Pointer
    ctx.save();
    ctx.translate(cx, cy - radius - 8);
    ctx.beginPath();
    ctx.moveTo(0, 16);
    ctx.lineTo(-8, -6);
    ctx.lineTo(8, -6);
    ctx.closePath();
    ctx.fillStyle = '#e8b86d';
    ctx.shadowColor = 'rgba(232,184,109,0.8)';
    ctx.shadowBlur = 12;
    ctx.fill();
    ctx.restore();
  };

  useEffect(() => {
    if (numPlayers > 0) drawWheel(rotationRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [players]);

  useEffect(() => {
    if (!isSpinning || numPlayers === 0) return;
    if (numPlayers < 2) return;

    // Pick winner EXCLUDING spinner
    let winnerIndex: number;
    if (winnerId) {
      winnerIndex = players.findIndex((p) => p.id === winnerId);
    } else {
      const possible = players.map((_, i) => i).filter((i) => i !== spinnerIndex);
      winnerIndex = possible[Math.floor(Math.random() * possible.length)];
    }

    const landingAngle = -(winnerIndex * arcSize + arcSize / 2);
    const fullSpins = (6 + Math.floor(Math.random() * 4)) * 2 * Math.PI;
    const targetRotation = fullSpins + landingAngle + Math.PI / 2;

    const startRotation = rotationRef.current;
    const startTime = performance.now();
    const duration = 4500;

    const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      const easedT = easeOutQuart(t);

      rotationRef.current = startRotation + (targetRotation - startRotation) * easedT;
      drawWheel(rotationRef.current, t > 0.9 ? winnerIndex : null);

      if (t < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        drawWheel(rotationRef.current, winnerIndex);
        onSpinComplete(winnerIndex);
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSpinning]);

  if (numPlayers === 0) {
    return (
      <div className="flex items-center justify-center w-72 h-72 rounded-full border-2 border-dashed border-[rgba(232,184,109,0.15)] text-white/25 text-sm">
        Add players to see the wheel
      </div>
    );
  }

  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
    >
      <canvas
        ref={canvasRef}
        width={320}
        height={320}
        style={{ filter: 'drop-shadow(0 0 40px rgba(232,184,109,0.2))' }}
      />
    </motion.div>
  );
}
