import React, { useEffect, useRef } from 'react';

export const GreenSparks: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;
      blur: number;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = Math.random() * 1.5 - 0.75;
        this.speedY = Math.random() * -1.5 - 0.5; // Always fly upwards generally
        
        // Green spark color variations - emerald/green colors
        const colors = [
          'rgba(16, 185, 129, 0.8)', // emerald-500
          'rgba(52, 211, 153, 0.6)', // emerald-400
          'rgba(110, 231, 183, 0.9)', // emerald-300
          'rgba(0, 255, 128, 0.7)'  // bright neon green
        ];
        this.color = colors[Math.floor(Math.random() * colors.length)];
        
        // Some with blur
        this.blur = Math.random() > 0.4 ? Math.random() * 4 + 2 : 0;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Reset if it goes out of bounds
        if (this.y < 0 || this.x < 0 || this.x > width) {
          this.y = height + 10;
          this.x = Math.random() * width;
        }
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        
        if (this.blur > 0) {
          ctx.shadowBlur = this.blur;
          ctx.shadowColor = this.color;
        } else {
          ctx.shadowBlur = 0;
        }
        
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.shadowBlur = 0; // reset for next drawing
      }
    }

    let particlesArray: Particle[] = [];
    const init = () => {
      particlesArray = [];
      const numberOfParticles = window.innerWidth < 768 ? 30 : 70;
      for (let i = 0; i < numberOfParticles; i++) {
        particlesArray.push(new Particle());
      }
    };
    
    init();

    let animationFrameId: number;
    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
        particlesArray[i].draw();
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      init(); // Reinitialize particles on resize to adjust amount
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 pointer-events-none z-0 mix-blend-screen"
      style={{ opacity: 0.6 }}
    />
  );
};
