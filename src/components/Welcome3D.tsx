'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Moon, Sun, ArrowRight, Sparkles } from 'lucide-react';
import { useTheme } from '@/providers/ThemeProvider';
import clsx from 'clsx';

export default function Welcome3D() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const cardRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sheenRef = useRef<HTMLDivElement>(null);

  const [mounted, setMounted] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [countdown, setCountdown] = useState(100); // Progress percentage (starts at 100, drops to 0)
  const [isHovering, setIsHovering] = useState(false);
  const [showSkipPrompt, setShowSkipPrompt] = useState(false);

  // Constants
  const COUNTDOWN_DURATION = 6000; // 6 seconds auto-redirect

  useEffect(() => {
    setMounted(true);
    // Show skip prompt after 2 seconds
    const promptTimer = setTimeout(() => setShowSkipPrompt(true), 2500);
    return () => clearTimeout(promptTimer);
  }, []);

  // Countdown timer for automatic redirect
  useEffect(() => {
    if (!mounted || isExiting) return;

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remainingPercentage = Math.max(0, 100 - (elapsed / COUNTDOWN_DURATION) * 100);
      
      setCountdown(remainingPercentage);

      if (elapsed >= COUNTDOWN_DURATION) {
        clearInterval(interval);
        handleEnterMenu();
      }
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, [mounted, isExiting]);

  // Canvas particle system (Warm Golden Sparks)
  useEffect(() => {
    if (!mounted) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse positions for interactive physics
    const mouse = { x: -1000, y: -1000, active: false };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
      
      // Spawn interaction particles
      if (Math.random() < 0.3) {
        spawnParticle(e.clientX, e.clientY, true);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
        mouse.active = true;
      }
    };

    const handleMouseLeave = () => {
      mouse.active = false;
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      maxSize: number;
      alpha: number;
      color: string;
      speed: number;
      growth: number;
      interactive: boolean;
    }

    const particles: Particle[] = [];
    const maxParticles = 60;

    const goldColors = [
      'rgba(200, 169, 126, ', // brand-beige
      'rgba(232, 213, 183, ', // brand-beige-light
      'rgba(184, 134, 11, ',  // brand-gold
      'rgba(255, 223, 137, ', // warm pale gold
    ];

    const spawnParticle = (x: number, y: number, interactive = false) => {
      const size = Math.random() * 1.5 + 0.5;
      const colorIndex = Math.floor(Math.random() * goldColors.length);
      
      particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 1.2,
        vy: interactive ? (Math.random() - 0.5) * 2 : -Math.random() * 1.5 - 0.5,
        size,
        maxSize: Math.random() * 3 + 2,
        alpha: Math.random() * 0.5 + 0.3,
        color: goldColors[colorIndex],
        speed: Math.random() * 0.02 + 0.005,
        growth: Math.random() * 0.05,
        interactive
      });
    };

    // Initialize initial particles
    for (let i = 0; i < maxParticles; i++) {
      spawnParticle(Math.random() * width, Math.random() * height);
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Create a luxurious background radial glow based on the theme
      const isDark = document.documentElement.classList.contains('dark');
      const glowGrad = ctx.createRadialGradient(
        width / 2, height / 2, 0,
        width / 2, height / 2, Math.max(width, height)
      );
      if (isDark) {
        glowGrad.addColorStop(0, '#121212');
        glowGrad.addColorStop(0.5, '#0a0a0a');
        glowGrad.addColorStop(1, '#020202');
      } else {
        glowGrad.addColorStop(0, '#fefdfb');
        glowGrad.addColorStop(0.5, '#FAF6F0');
        glowGrad.addColorStop(1, '#f0e9dd');
      }
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, width, height);

      // Spawn environmental particles from the bottom
      if (particles.length < maxParticles && Math.random() < 0.1) {
        spawnParticle(Math.random() * width, height + 10);
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        // Particle dynamics
        p.x += p.vx;
        p.y += p.vy;

        // Interactive physics with cursor
        if (mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 150) {
            const force = (150 - dist) / 150;
            const angle = Math.atan2(dy, dx);
            
            // Push away
            p.vx += Math.cos(angle) * force * 0.15;
            p.vy += Math.sin(angle) * force * 0.15;
            
            // Brighten near cursor
            p.alpha = Math.min(1, p.alpha + 0.05);
          }
        }

        // Apply friction
        p.vx *= 0.98;
        if (p.interactive) {
          p.vy *= 0.98;
          p.alpha -= 0.008; // Interactive ones fade faster
        } else {
          // Environmental float upwards
          p.vy = Math.max(-2, p.vy - 0.01);
        }

        // Draw particle
        ctx.beginPath();
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2);
        grad.addColorStop(0, p.color + p.alpha + ')');
        grad.addColorStop(1, p.color + '0)');
        ctx.fillStyle = grad;
        ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Recycle / Remove dead particles
        if (p.y < -50 || p.x < -50 || p.x > width + 50 || p.alpha <= 0) {
          particles.splice(i, 1);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [mounted]);

  // 3D Card mouse interactions (direct DOM manipulation for 60fps)
  const handleMouseMove3D = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    const container = containerRef.current;
    const sheen = sheenRef.current;
    if (!card || !container) return;

    const rect = container.getBoundingClientRect();
    
    // Relative coordinates inside the container
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Centered coordinates (-0.5 to 0.5)
    const px = (x / rect.width) - 0.5;
    const py = (y / rect.height) - 0.5;

    // Custom tilt settings (max 20deg)
    const maxTilt = 18;
    const rotX = -py * maxTilt;
    const rotY = px * maxTilt;

    // Apply tilt transform
    card.style.transform = `perspective(1200px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.04, 1.04, 1.04)`;

    // Move sheen gradient in opposite direction to simulate reflection
    if (sheen) {
      const sheenX = (1 - (x / rect.width)) * 100;
      const sheenY = (1 - (y / rect.height)) * 100;
      sheen.style.background = `radial-gradient(circle at ${sheenX}% ${sheenY}%, rgba(200, 169, 126, 0.18) 0%, transparent 65%)`;
    }
  };

  const handleTouchMove3D = (e: React.TouchEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    const container = containerRef.current;
    const sheen = sheenRef.current;
    if (!card || !container || e.touches.length === 0) return;

    const rect = container.getBoundingClientRect();
    const touch = e.touches[0];
    
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    // Ignore if touch drifts outside the bounds
    if (x < 0 || x > rect.width || y < 0 || y > rect.height) return;

    const px = (x / rect.width) - 0.5;
    const py = (y / rect.height) - 0.5;

    const maxTilt = 12; // slightly less tilt for mobile touch
    const rotX = -py * maxTilt;
    const rotY = px * maxTilt;

    card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.03, 1.03, 1.03)`;

    if (sheen) {
      const sheenX = (1 - (x / rect.width)) * 100;
      const sheenY = (1 - (y / rect.height)) * 100;
      sheen.style.background = `radial-gradient(circle at ${sheenX}% ${sheenY}%, rgba(200, 169, 126, 0.15) 0%, transparent 60%)`;
    }
  };

  const handleMouseLeave3D = () => {
    const card = cardRef.current;
    const sheen = sheenRef.current;
    if (!card) return;

    // Reset card transforms smoothly
    card.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    
    // Reset sheen
    if (sheen) {
      sheen.style.background = 'transparent';
    }
  };

  // Immediate redirection transition trigger
  const handleEnterMenu = () => {
    if (isExiting) return;
    setIsExiting(true);

    // Apply intense camera zoom-in directly to the card
    const card = cardRef.current;
    if (card) {
      card.style.transition = 'transform 0.8s cubic-bezier(0.7, 0, 0.3, 1), opacity 0.7s ease-out';
      card.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg) translateZ(300px) scale3d(1.8, 1.8, 1.8)';
      card.style.opacity = '0';
    }

    setTimeout(() => {
      router.push('/menu');
    }, 750);
  };

  if (!mounted) return null;

  return (
    <div
      className={clsx(
        'relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden font-cairo select-none transition-all duration-700',
        isExiting ? 'opacity-0 bg-brand-white dark:bg-brand-black scale-98 pointer-events-none' : 'opacity-100'
      )}
    >
      {/* Dynamic Interactive Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0 block pointer-events-none" />

      {/* Top Bar (Theme switcher & dynamic welcome badge) */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-40 max-w-5xl mx-auto w-full px-6">
        <div className="flex items-center gap-2 bg-white/40 dark:bg-black/20 backdrop-blur-md border border-white/30 dark:border-white/5 py-1.5 px-3.5 rounded-full shadow-sm text-xs font-semibold text-brand-beige-dark dark:text-brand-beige-light">
          <Sparkles className="h-3.5 w-3.5 text-brand-beige animate-pulse" />
          <span>تذوق الأصالة • Taste the Heritage</span>
        </div>
        <button
          onClick={toggleTheme}
          className="p-3 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 bg-white/50 dark:bg-black/30 backdrop-blur-md border border-white/30 dark:border-white/5 shadow-md text-brand-gray-700 dark:text-brand-gray-300 hover:text-brand-beige-dark dark:hover:text-brand-beige-light"
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      {/* Main 3D Interactive Container */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove3D}
        onMouseLeave={handleMouseLeave3D}
        onTouchMove={handleTouchMove3D}
        onTouchEnd={handleMouseLeave3D}
        onMouseEnter={() => setIsHovering(true)}
        onMouseOver={() => setIsHovering(true)}
        onMouseOut={() => setIsHovering(false)}
        className="relative z-10 w-full max-w-sm md:max-w-md aspect-[3/4] flex items-center justify-center p-6 cursor-grab active:cursor-grabbing"
      >
        {/* Holographic glowing back aura */}
        <div 
          className={clsx(
            'absolute inset-10 rounded-full blur-[80px] opacity-40 transition-all duration-1000 z-0 pointer-events-none',
            isHovering 
              ? 'bg-brand-beige dark:bg-brand-gold scale-110 blur-[100px] opacity-55' 
              : 'bg-brand-beige-light dark:bg-brand-beige opacity-35'
          )}
        />

        {/* The 3D Glassmorphic Card */}
        <div
          ref={cardRef}
          onClick={handleEnterMenu}
          style={{ transformStyle: 'preserve-3d', transition: isHovering ? 'none' : 'transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)' }}
          className={clsx(
            'relative w-full h-full rounded-3xl z-10 overflow-hidden flex flex-col items-center justify-between p-8 md:p-10 border text-center transition-shadow duration-500',
            'bg-white/45 dark:bg-brand-black/45 backdrop-blur-xl',
            'border-white/40 dark:border-white/10',
            'shadow-[0_20px_50px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)]',
            isHovering ? 'shadow-[0_30px_70px_rgba(200,169,126,0.18)] dark:shadow-[0_30px_70px_rgba(200,169,126,0.12)]' : ''
          )}
        >
          {/* Dynamic Light Sheen Overlay */}
          <div
            ref={sheenRef}
            className="absolute inset-0 pointer-events-none z-30 transition-opacity duration-300"
          />

          {/* Card Geometric Accents (Preserve 3D depth) */}
          <div 
            style={{ transform: 'translateZ(15px)' }} 
            className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-brand-beige/50 rounded-tl" 
          />
          <div 
            style={{ transform: 'translateZ(15px)' }} 
            className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-brand-beige/50 rounded-tr" 
          />
          <div 
            style={{ transform: 'translateZ(15px)' }} 
            className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-brand-beige/50 rounded-bl" 
          />
          <div 
            style={{ transform: 'translateZ(15px)' }} 
            className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-brand-beige/50 rounded-br" 
          />

          {/* Top Decorative Text (3D translateZ) */}
          <span
            style={{ transform: 'translateZ(30px)' }}
            className="text-[10px] tracking-[0.25em] uppercase text-brand-beige-dark font-medium opacity-80"
          >
            Est. 2024
          </span>

          {/* 3D Floating Logo Section */}
          <div
            style={{ transform: 'translateZ(75px)', transformStyle: 'preserve-3d' }}
            className="relative flex items-center justify-center my-6 group"
          >
            {/* Soft inner glow behind logo */}
            <div className="absolute inset-0 w-32 h-32 md:w-36 md:h-36 rounded-full bg-radial from-brand-beige-light/35 to-transparent blur-2xl dark:from-brand-gold/15" />
            
            <img
              src="/logo.png"
              alt="Cafe Adnan Logo"
              className={clsx(
                'h-36 w-36 md:h-40 md:w-40 object-contain drop-shadow-[0_10px_25px_rgba(0,0,0,0.15)] dark:drop-shadow-[0_10px_25px_rgba(200,169,126,0.35)]',
                'transition-all duration-500 scale-100 group-hover:scale-105',
                // Keep inverted style for light mode, original light logo for dark mode
                'invert dark:invert-0'
              )}
            />
          </div>

          {/* 3D Branding & Typography */}
          <div 
            style={{ transform: 'translateZ(45px)' }} 
            className="flex flex-col items-center gap-2.5 w-full"
          >
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-brand-black dark:text-brand-white">
              قهوة عدنان
            </h1>
            <h2 className="text-sm tracking-[0.15em] font-medium text-brand-beige-dark dark:text-brand-beige-light uppercase -mt-1 font-inter">
              Cafe Adnan
            </h2>
            <div className="w-12 h-[1.5px] bg-gradient-to-r from-transparent via-brand-beige to-transparent my-1" />
            <p className="text-xs md:text-sm text-brand-gray-500 dark:text-brand-gray-400 max-w-[240px] leading-relaxed">
              حيث تلتقي الأصالة بالفخامة
              <br />
              <span className="text-[10px] text-brand-gray-400 dark:text-brand-gray-500 italic font-inter block mt-1">
                Where Authenticity Meets Luxury
              </span>
            </p>
          </div>

          {/* Interactive Luxury Enter Button (3D translateZ) */}
          <div
            style={{ transform: 'translateZ(55px)' }}
            className="w-full flex flex-col items-center gap-4 mt-6"
          >
            <button
              onClick={(e) => {
                e.stopPropagation(); // Avoid double trigger due to card click
                handleEnterMenu();
              }}
              className={clsx(
                'relative w-full py-4.5 px-6 rounded-2xl flex items-center justify-center gap-3 overflow-hidden transition-all duration-300 font-semibold group shadow-md',
                'bg-brand-black dark:bg-brand-beige text-brand-white dark:text-brand-black hover:scale-[1.02] active:scale-98 cursor-pointer'
              )}
            >
              {/* Internal pulsating shine animation for button */}
              <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/15 dark:via-black/5 to-transparent -skew-x-12 translate-x-[-150%] group-hover:translate-x-[250%] transition-transform duration-1000 ease-out" />
              
              <span className="text-sm md:text-base tracking-wide">دخول القائمة | Explore Menu</span>
              <ArrowRight className="h-4 w-4 md:h-5 md:w-5 transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180" />
            </button>
          </div>
        </div>
      </div>

      {/* Auto-redirect bottom progress bar & skip prompt */}
      <div className="absolute bottom-10 left-6 right-6 flex flex-col items-center gap-4 z-40 max-w-sm mx-auto">
        <div className="w-full h-1 bg-brand-gray-200 dark:bg-brand-gray-800 rounded-full overflow-hidden">
          <div
            style={{ width: `${countdown}%` }}
            className="h-full bg-gradient-to-r from-brand-beige to-brand-gold rounded-full transition-all duration-75 linear"
          />
        </div>
        
        {showSkipPrompt && (
          <button
            onClick={handleEnterMenu}
            className="text-[11px] text-brand-gray-400 hover:text-brand-beige transition-colors duration-200 uppercase tracking-widest font-inter cursor-pointer animate-fadeIn"
          >
            الانتقال التلقائي قريباً... اضغط للدخول الآن
          </button>
        )}
      </div>
    </div>
  );
}
