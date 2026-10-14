import React, { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';

interface Star {
  x: number;
  y: number;
  z: number;
  pz: number;
  size: number;
  color: string;
  twinkle: number;
}

export const GalaxyCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { theme, particlesEnabled, warpActive } = useTheme();

  useEffect(() => {
    // Only render particles in galaxy and synthwave themes, and when enabled
    if (!particlesEnabled || (theme !== 'galaxy' && theme !== 'synthwave')) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const colors = theme === 'synthwave'
      ? ['#ec4899', '#8b5cf6', '#06b6d4', '#f43f5e', '#a855f7']
      : ['#ffffff', '#c4b5fd', '#93c5fd', '#fde047', '#67e8f9'];

    const numStars = 450;
    const stars: Star[] = [];

    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: (Math.random() - 0.5) * width * 2,
        y: (Math.random() - 0.5) * height * 2,
        z: Math.random() * width,
        pz: Math.random() * width,
        size: Math.random() * 1.8 + 0.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        twinkle: Math.random() * Math.PI * 2
      });
    }

    // Mouse gravity interactive position
    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX - width / 2) * 0.05;
      mouseY = (e.clientY - height / 2) * 0.05;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const render = () => {
      // Clear with fade trail for warp speed
      if (warpActive) {
        ctx.fillStyle = 'rgba(3, 7, 18, 0.25)';
      } else {
        ctx.fillStyle = theme === 'synthwave' ? 'rgba(10, 5, 25, 0.4)' : 'rgba(3, 7, 18, 0.4)';
      }
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2 + mouseX;
      const cy = height / 2 + mouseY;
      const speed = warpActive ? 32 : 1.2;

      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        s.pz = s.z;
        s.z -= speed;

        if (s.z <= 0) {
          s.z = width;
          s.pz = width;
          s.x = (Math.random() - 0.5) * width * 2;
          s.y = (Math.random() - 0.5) * height * 2;
        }

        const k = 200 / s.z;
        const px = s.x * k + cx;
        const py = s.y * k + cy;

        const pk = 200 / s.pz;
        const prevX = s.x * pk + cx;
        const prevY = s.y * pk + cy;

        if (px >= 0 && px <= width && py >= 0 && py <= height) {
          s.twinkle += 0.03;
          const alpha = warpActive ? 1 : Math.sin(s.twinkle) * 0.3 + 0.7;

          ctx.beginPath();
          if (warpActive) {
            // Luminous streak
            ctx.strokeStyle = s.color;
            ctx.lineWidth = s.size * 1.5;
            ctx.moveTo(prevX, prevY);
            ctx.lineTo(px, py);
            ctx.stroke();
          } else {
            ctx.fillStyle = s.color;
            ctx.globalAlpha = alpha;
            ctx.arc(px, py, s.size * (1 - s.z / width) * 1.6, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1.0;
          }
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [theme, particlesEnabled, warpActive]);

  if (!particlesEnabled || (theme !== 'galaxy' && theme !== 'synthwave')) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-700"
    />
  );
};
