import React, { useEffect, useRef, useState } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  decay: number;
  color: string;
  shape: 'star' | 'dot' | 'sparkle';
  rotation: number;
  rotationSpeed: number;
}

export const SparkleCursor: React.FC<{ enabled?: boolean }> = ({ enabled = true }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef<{ x: number; y: number; prevX: number; prevY: number }>({
    x: -100,
    y: -100,
    prevX: -100,
    prevY: -100
  });

  useEffect(() => {
    if (!enabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const colors = [
      '#f3d069', // burnished gold
      '#fef08a', // pale starlight gold
      '#c59b27', // antique gold
      '#93c5fd', // celestial starlight blue
      '#bfdbfe', // moonlight mist
    ];

    const shapes: ('star' | 'dot' | 'sparkle')[] = ['star', 'sparkle', 'dot'];

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const dx = clientX - mouseRef.current.x;
      const dy = clientY - mouseRef.current.y;
      const speed = Math.sqrt(dx * dx + dy * dy);

      mouseRef.current.prevX = mouseRef.current.x;
      mouseRef.current.prevY = mouseRef.current.y;
      mouseRef.current.x = clientX;
      mouseRef.current.y = clientY;

      // Spawn particles proportional to movement
      const count = Math.min(Math.floor(speed / 4) + 1, 5);
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 2 + 0.5;
        particlesRef.current.push({
          x: clientX + (Math.random() - 0.5) * 8,
          y: clientY + (Math.random() - 0.5) * 8,
          vx: Math.cos(angle) * velocity,
          vy: Math.sin(angle) * velocity + 0.4, // subtle gravity
          size: Math.random() * 3.5 + 1.5,
          alpha: 1,
          decay: Math.random() * 0.03 + 0.02,
          color: colors[Math.floor(Math.random() * colors.length)],
          shape: shapes[Math.floor(Math.random() * shapes.length)],
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.2,
        });
      }

      // Limit particle array size
      if (particlesRef.current.length > 120) {
        particlesRef.current = particlesRef.current.slice(-120);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        handleMouseMove({ clientX: touch.clientX, clientY: touch.clientY } as MouseEvent);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);

    let animationId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;
        p.rotation += p.rotationSpeed;
        p.size *= 0.98;

        if (p.alpha <= 0 || p.size <= 0.4) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);

        if (p.shape === 'star') {
          // 4-pointed golden sparkle star
          ctx.beginPath();
          const s = p.size * 1.8;
          ctx.moveTo(0, -s);
          ctx.quadraticCurveTo(0, 0, s, 0);
          ctx.quadraticCurveTo(0, 0, 0, s);
          ctx.quadraticCurveTo(0, 0, -s, 0);
          ctx.quadraticCurveTo(0, 0, 0, -s);
          ctx.fill();
        } else if (p.shape === 'sparkle') {
          // Tiny diamond
          ctx.beginPath();
          const d = p.size;
          ctx.moveTo(0, -d * 1.5);
          ctx.lineTo(d, 0);
          ctx.lineTo(0, d * 1.5);
          ctx.lineTo(-d, 0);
          ctx.closePath();
          ctx.fill();
        } else {
          // Soft circular glow orb
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      cancelAnimationFrame(animationId);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
      style={{ pointerEvents: 'none' }}
    />
  );
};
