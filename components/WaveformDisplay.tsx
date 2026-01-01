
import React, { useEffect, useRef } from 'react';

interface WaveformDisplayProps {
  color?: string;
  isAnimated?: boolean;
  intensity?: 'low' | 'high';
}

const WaveformDisplay: React.FC<WaveformDisplayProps> = ({ 
  color = '#60a5fa', 
  isAnimated = false,
  intensity = 'low'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const pointCount = 60;
    const points: number[] = Array.from({ length: pointCount }, () => Math.random() * 40 + 5);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const step = width / pointCount;

      const time = Date.now() / (intensity === 'high' ? 100 : 200);

      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';

      points.forEach((p, i) => {
        const x = i * step;
        let h = p;
        
        if (isAnimated) {
          // Hiệu ứng nhịp Trap: thỉnh thoảng có cột sóng nhảy cao đột ngột (Bass Kick)
          const kick = intensity === 'high' && Math.sin(time + i * 0.5) > 0.8 ? 30 : 0;
          h = p + Math.sin(time + i * 0.3) * (intensity === 'high' ? 25 : 10) + kick;
        }

        // Tạo bóng mờ cho sóng (Glow effect)
        ctx.shadowBlur = intensity === 'high' ? 15 : 5;
        ctx.shadowColor = color;
        
        ctx.moveTo(x, height / 2 - h / 2);
        ctx.lineTo(x, height / 2 + h / 2);
      });
      ctx.stroke();

      if (isAnimated) {
        animationId = requestAnimationFrame(draw);
      }
    };

    draw();
    return () => cancelAnimationFrame(animationId);
  }, [color, isAnimated, intensity]);

  return (
    <div className="relative group">
      <canvas 
        ref={canvasRef} 
        width={600} 
        height={120} 
        className={`w-full h-24 bg-black/40 rounded-2xl border border-white/5 transition-all duration-500 ${intensity === 'high' ? 'border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.2)]' : ''}`}
      />
      {intensity === 'high' && (
        <div className="absolute inset-0 bg-purple-500/5 animate-pulse rounded-2xl pointer-events-none"></div>
      )}
    </div>
  );
};

export default WaveformDisplay;
