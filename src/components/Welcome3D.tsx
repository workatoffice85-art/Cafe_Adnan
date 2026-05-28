'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Moon, Sun, ArrowRight, Sparkles, Coffee } from 'lucide-react';
import { useTheme } from '@/providers/ThemeProvider';
import clsx from 'clsx';

export default function Welcome3D() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  
  // Refs for 60fps direct DOM manipulation
  const cardRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sheenRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLHeadingElement>(null);
  
  const [mounted, setMounted] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [countdown, setCountdown] = useState(100); 
  const [isHovering, setIsHovering] = useState(false);
  const [showSkipPrompt, setShowSkipPrompt] = useState(false);

  const COUNTDOWN_DURATION = 7000; // 7 seconds

  // Refs to track states inside high-frequency render loops (prevents stale closure lag!)
  const isExitingRef = useRef(false);
  const themeRef = useRef(theme);

  // Snappy smooth hardware-accelerated exit navigation
  const handleEnterMenu = useCallback(() => {
    if (isExiting) return;
    setIsExiting(true);
    isExitingRef.current = true; // Instantly halts rendering loops

    const card = cardRef.current;
    if (card) {
      card.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.45s ease-out';
      card.style.transform = 'perspective(1500px) rotateX(0deg) rotateY(0deg) translateZ(350px) scale3d(1.8, 1.8, 1.8)';
      card.style.opacity = '0';
    }

    setTimeout(() => {
      router.push('/menu');
    }, 450);
  }, [isExiting, router]);

  // Sync theme changes to the animation ref
  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    // Prefetch the menu page immediately on mount so navigation is instant
    router.prefetch('/menu');
    // Show skip prompt after 2 seconds
    const promptTimer = setTimeout(() => setShowSkipPrompt(true), 2500);
    return () => {
      clearTimeout(timer);
      clearTimeout(promptTimer);
    };
  }, [router]);

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
  }, [mounted, isExiting, handleEnterMenu]);

  // Canvas particle system (Warm Golden Steam & Stardust - Supports Light & Dark Gradients)
  useEffect(() => {
    if (!mounted) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse coordinates for interactive physics
    const mouse = { x: -1000, y: -1000, active: false };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isExitingRef.current) return;
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
      
      // Spawn interaction micro-sparks
      if (Math.random() < 0.4) {
        spawnParticle(e.clientX, e.clientY, true);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isExitingRef.current) return;
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
      alpha: number;
      color: string;
      interactive: boolean;
      orbitOffset: number;
      orbitSpeed: number;
    }

    const particles: Particle[] = [];
    const maxParticles = 85;

    // Rich dual-theme gold palettes
    const darkGoldColors = [
      'rgba(200, 169, 126, ', // brand-beige
      'rgba(232, 213, 183, ', // brand-beige-light
      'rgba(184, 134, 11, ',  // brand-gold
      'rgba(243, 203, 116, ', // glowing golden light
      'rgba(255, 235, 190, ', // star light
    ];

    const lightGoldColors = [
      'rgba(168, 139, 94, ',  // brand-beige-dark
      'rgba(200, 169, 126, ', // brand-beige
      'rgba(184, 134, 11, ',  // brand-gold
      'rgba(107, 74, 40, ',   // coffee brown
      'rgba(255, 255, 255, ', // crisp ambient sparkles
    ];

    const spawnParticle = (x: number, y: number, interactive = false) => {
      const size = Math.random() * 2 + 0.6;
      const isDark = themeRef.current === 'dark';
      const colors = isDark ? darkGoldColors : lightGoldColors;
      const colorIndex = Math.floor(Math.random() * colors.length);
      
      particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 1.5,
        vy: interactive ? (Math.random() - 0.5) * 2.5 : -Math.random() * 1.2 - 0.4,
        size,
        alpha: Math.random() * (isDark ? 0.6 : 0.5) + (isDark ? 0.3 : 0.4), // slightly solid in light theme
        color: colors[colorIndex],
        interactive,
        orbitOffset: Math.random() * Math.PI * 2,
        orbitSpeed: (Math.random() - 0.5) * 0.03
      });
    };

    // Spawn initial particles
    for (let i = 0; i < maxParticles; i++) {
      spawnParticle(Math.random() * width, Math.random() * height);
    }

    const render = () => {
      // CRITICAL PERFORMANCE: Terminate render loop immediately on exit
      if (isExitingRef.current) {
        ctx.clearRect(0, 0, width, height);
        return;
      }

      const isDark = themeRef.current === 'dark';
      const glowGrad = ctx.createRadialGradient(
        width / 2, height / 2, 0,
        width / 2, height / 2, Math.max(width, height)
      );
      
      if (isDark) {
        // Immersive Warm Espresso-Black for Dark Mode
        glowGrad.addColorStop(0, '#100a08'); 
        glowGrad.addColorStop(0.5, '#070403');
        glowGrad.addColorStop(1, '#020101');
      } else {
        // Luxurious Warm Cream-Beige for Light Mode
        glowGrad.addColorStop(0, '#fdfbf7'); 
        glowGrad.addColorStop(0.5, '#F5EFEB');
        glowGrad.addColorStop(1, '#EAE1DA');
      }
      
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, width, height);

      // Ambient luxury background beam (glowing warm aura)
      ctx.fillStyle = isDark ? 'rgba(200, 169, 126, 0.015)' : 'rgba(168, 139, 94, 0.025)';
      ctx.beginPath();
      ctx.ellipse(width / 2, height / 2, width * 0.3, height * 0.8, Math.PI / 6, 0, Math.PI * 2);
      ctx.fill();

      // Spawn new rising particles
      if (particles.length < maxParticles && Math.random() < 0.15) {
        spawnParticle(Math.random() * width, height + 10);
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        p.x += p.vx;
        p.y += p.vy;

        p.orbitOffset += p.orbitSpeed;
        p.x += Math.sin(p.orbitOffset) * 0.15;

        // Interactive gravity repel from cursor
        if (mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 180) {
            const force = (180 - dist) / 180;
            const angle = Math.atan2(dy, dx);
            
            p.vx += Math.cos(angle) * force * 0.2;
            p.vy += Math.sin(angle) * force * 0.2;
            p.alpha = Math.min(0.9, p.alpha + 0.02);
          }
        }

        p.vx *= 0.97;
        if (p.interactive) {
          p.vy *= 0.97;
          p.alpha -= 0.007;
        } else {
          p.vy = Math.max(-1.8, p.vy - 0.005);
          p.alpha -= 0.001; 
        }

        // Draw particle with glowing aura
        ctx.beginPath();
        const pGlow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2.5);
        pGlow.addColorStop(0, p.color + p.alpha + ')');
        pGlow.addColorStop(0.3, p.color + p.alpha * 0.5 + ')');
        pGlow.addColorStop(1, p.color + '0)');
        ctx.fillStyle = pGlow;
        ctx.arc(p.x, p.y, p.size * 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Recycle dead particles
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

  // Masterpiece 3D Tilt, Dynamic Shadows and Reflection calculations
  const handleMouseMove3D = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isExitingRef.current) return;
    
    const card = cardRef.current;
    const container = containerRef.current;
    const sheen = sheenRef.current;
    const logo = logoRef.current;
    const title = titleRef.current;
    const subtitle = subtitleRef.current;
    
    if (!card || !container) return;

    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const px = (x / rect.width) - 0.5;
    const py = (y / rect.height) - 0.5;

    // Extreme, smooth 3D tilt angles (max 22 degrees)
    const maxTilt = 22;
    const rotX = -py * maxTilt;
    const rotY = px * maxTilt;

    card.style.transform = `perspective(1500px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.05, 1.05, 1.05)`;

    // Interactive reflection sheen (moving in opposite direction)
    if (sheen) {
      const sheenX = (1 - (x / rect.width)) * 100;
      const sheenY = (1 - (y / rect.height)) * 100;
      sheen.style.background = `radial-gradient(circle at ${sheenX}% ${sheenY}%, ${theme === 'dark' ? 'rgba(255, 223, 137, 0.22)' : 'rgba(168, 139, 94, 0.16)'} 0%, transparent 60%)`;
      sheen.style.opacity = '1';
    }

    // Dynamic Shadow Shift under the floating logo (simulates 3D spatial height)
    if (logo) {
      const shadowX = -px * 32;
      const shadowY = -py * 32;
      logo.style.transform = `translateZ(100px) scale(1.06)`;
      logo.style.filter = theme === 'dark' 
        ? `invert(0) drop-shadow(${shadowX}px ${shadowY}px 18px rgba(0, 0, 0, 0.75)) drop-shadow(0 0 12px rgba(200, 169, 126, 0.3))`
        : `invert(1) drop-shadow(${shadowX}px ${shadowY}px 12px rgba(0, 0, 0, 0.25)) drop-shadow(0 0 6px rgba(168, 139, 94, 0.15))`;
    }

    // Dynamic metallic Gold Foil text shimmer effect
    if (title && subtitle) {
      const textAngle = ((px + 0.5) * 360).toFixed(0);
      if (theme === 'dark') {
        title.style.backgroundImage = `linear-gradient(${textAngle}deg, #A88B5E 0%, #F5E5C9 30%, #C8A97E 60%, #B8860B 100%)`;
        subtitle.style.backgroundImage = `linear-gradient(${textAngle}deg, #A88B5E 0%, #F5E5C9 30%, #C8A97E 60%, #B8860B 100%)`;
      } else {
        // Deep copper-gold sheen for high contrast in light mode
        title.style.backgroundImage = `linear-gradient(${textAngle}deg, #6b4a28 0%, #C8A97E 35%, #A88B5E 65%, #6b4a28 100%)`;
        subtitle.style.backgroundImage = `linear-gradient(${textAngle}deg, #6b4a28 0%, #C8A97E 35%, #A88B5E 65%, #6b4a28 100%)`;
      }
    }
  };

  const handleTouchMove3D = (e: React.TouchEvent<HTMLDivElement>) => {
    if (isExitingRef.current) return;
    
    const card = cardRef.current;
    const container = containerRef.current;
    const sheen = sheenRef.current;
    const logo = logoRef.current;
    
    if (!card || !container || e.touches.length === 0) return;

    const rect = container.getBoundingClientRect();
    const touch = e.touches[0];
    
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    if (x < 0 || x > rect.width || y < 0 || y > rect.height) return;

    const px = (x / rect.width) - 0.5;
    const py = (y / rect.height) - 0.5;

    const maxTilt = 16;
    const rotX = -py * maxTilt;
    const rotY = px * maxTilt;

    card.style.transform = `perspective(1200px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.03, 1.03, 1.03)`;

    if (sheen) {
      const sheenX = (1 - (x / rect.width)) * 100;
      const sheenY = (1 - (y / rect.height)) * 100;
      sheen.style.background = `radial-gradient(circle at ${sheenX}% ${sheenY}%, ${theme === 'dark' ? 'rgba(255, 223, 137, 0.16)' : 'rgba(168, 139, 94, 0.12)'} 0%, transparent 60%)`;
    }

    if (logo) {
      const shadowX = -px * 20;
      const shadowY = -py * 20;
      logo.style.transform = `translateZ(80px) scale(1.04)`;
      logo.style.filter = theme === 'dark'
        ? `invert(0) drop-shadow(${shadowX}px ${shadowY}px 12px rgba(0, 0, 0, 0.7)) drop-shadow(0 0 8px rgba(200, 169, 126, 0.25))`
        : `invert(1) drop-shadow(${shadowX}px ${shadowY}px 8px rgba(0, 0, 0, 0.2)) drop-shadow(0 0 5px rgba(168, 139, 94, 0.15))`;
    }
  };

  const handleMouseLeave3D = () => {
    if (isExitingRef.current) return;
    
    const card = cardRef.current;
    const sheen = sheenRef.current;
    const logo = logoRef.current;
    const title = titleRef.current;
    const subtitle = subtitleRef.current;
    
    if (!card) return;

    card.style.transform = 'perspective(1500px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    
    if (sheen) {
      sheen.style.background = 'transparent';
      sheen.style.opacity = '0';
    }

    if (logo) {
      logo.style.transform = 'translateZ(75px) scale(1)';
      logo.style.filter = theme === 'dark'
        ? 'invert(0) drop-shadow(0 15px 25px rgba(0, 0, 0, 0.55)) drop-shadow(0 0 6px rgba(200, 169, 126, 0.2))'
        : 'invert(1) drop-shadow(0 10px 18px rgba(0, 0, 0, 0.15)) drop-shadow(0 0 4px rgba(168, 139, 94, 0.15))';
    }

    if (title && subtitle) {
      if (theme === 'dark') {
        title.style.backgroundImage = 'linear-gradient(135deg, #B8860B 0%, #E8D5B7 50%, #C8A97E 100%)';
        subtitle.style.backgroundImage = 'linear-gradient(135deg, #A88B5E 0%, #E8D5B7 50%, #A88B5E 100%)';
      } else {
        title.style.backgroundImage = 'linear-gradient(135deg, #6b4a28 0%, #A88B5E 50%, #6b4a28 100%)';
        subtitle.style.backgroundImage = 'linear-gradient(135deg, #a88b5e 0%, #6b4a28 50%, #a88b5e 100%)';
      }
    }
  };


  if (!mounted) return null;

  const isDarkTheme = theme === 'dark';

  return (
    <div
      className={clsx(
        'relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden font-cairo select-none transition-colors duration-1000',
        isDarkTheme ? 'bg-[#070403]' : 'bg-[#F5EFEB]',
        isExiting ? 'opacity-0 scale-98 pointer-events-none' : 'opacity-100'
      )}
    >
      {/* Background Canvas Particles */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full z-0 block pointer-events-none transition-opacity duration-300"
        style={{ opacity: isExiting ? 0 : 1 }}
      />

      {/* Floating 3D Sparkles in space */}
      {!isExiting && (
        <>
          <div 
            className={clsx(
              'absolute top-1/4 left-1/10 w-2 h-2 rounded-full blur-[1px] animate-pulse opacity-60 z-10 pointer-events-none',
              isDarkTheme ? 'bg-brand-beige-light' : 'bg-brand-beige-dark'
            )} 
            style={{ transform: 'translateZ(-150px)' }} 
          />
          <div 
            className={clsx(
              'absolute bottom-1/4 right-1/10 w-3 h-3 rounded-full blur-[2px] animate-ping opacity-30 z-10 pointer-events-none',
              isDarkTheme ? 'bg-brand-gold' : 'bg-brand-beige'
            )} 
            style={{ transform: 'translateZ(-100px)', animationDuration: '6s' }} 
          />
          <div 
            className={clsx(
              'absolute top-1/3 right-1/5 w-1.5 h-1.5 rounded-full blur-none animate-pulse opacity-85 z-10 pointer-events-none',
              isDarkTheme ? 'bg-white' : 'bg-brand-beige-dark'
            )} 
            style={{ transform: 'translateZ(-50px)' }} 
          />
        </>
      )}

      {/* Top Navigation Bar */}
      <div 
        className="absolute top-6 left-6 right-6 flex items-center justify-between z-40 max-w-5xl mx-auto w-full px-6 transition-opacity duration-300"
        style={{ opacity: isExiting ? 0 : 1, display: isExiting ? 'none' : 'flex' }}
      >
        <div 
          className={clsx(
            'flex items-center gap-2.5 backdrop-blur-xl border py-2 px-4 rounded-full shadow-sm text-xs font-bold transition-all duration-500',
            isDarkTheme 
              ? 'bg-black/60 border-brand-beige/25 text-brand-beige-light shadow-[0_0_20px_rgba(200,169,126,0.1)]' 
              : 'bg-white/70 border-brand-beige/35 text-brand-beige-dark shadow-[0_0_15px_rgba(168,139,94,0.06)]'
          )}
        >
          <Sparkles className={clsx('h-3.5 w-3.5 animate-bounce', isDarkTheme ? 'text-brand-gold' : 'text-brand-beige-dark')} />
          <span>تألق الفخامة • Cafe Adnan Experience</span>
        </div>
        <button
          onClick={toggleTheme}
          className={clsx(
            'p-3.5 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 backdrop-blur-xl border shadow-sm transition-colors duration-500',
            isDarkTheme 
              ? 'bg-black/60 border-brand-beige/25 text-brand-beige hover:text-brand-gold shadow-[0_0_20px_rgba(200,169,126,0.1)]' 
              : 'bg-white/70 border-brand-beige/35 text-brand-beige-dark hover:text-brand-beige shadow-[0_0_15px_rgba(168,139,94,0.06)]'
          )}
          aria-label="Toggle Theme"
        >
          {isDarkTheme ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      {/* Interactive 3D Card Area */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove3D}
        onMouseLeave={handleMouseLeave3D}
        onTouchMove={handleTouchMove3D}
        onTouchEnd={handleMouseLeave3D}
        onMouseEnter={() => setIsHovering(true)}
        className="relative z-10 w-full max-w-[370px] md:max-w-[430px] aspect-[10/14] flex items-center justify-center p-5 cursor-grab active:cursor-grabbing"
      >
        {/* Holographic Glowing Pedestal Aura behind the card */}
        <div 
          className={clsx(
            'absolute inset-5 rounded-full blur-[90px] transition-all duration-1000 z-0 pointer-events-none',
            isHovering && !isExiting
              ? (isDarkTheme ? 'bg-brand-gold scale-120 blur-[110px] opacity-60' : 'bg-brand-beige scale-120 blur-[110px] opacity-45')
              : (isDarkTheme ? 'bg-brand-beige opacity-35' : 'bg-brand-beige-light opacity-30'),
            isExiting ? 'opacity-0 scale-90' : ''
          )}
        />

        {/* The 3D Glassmorphic Slab */}
        <div
          ref={cardRef}
          onClick={handleEnterMenu}
          style={{ transformStyle: 'preserve-3d', transition: isHovering && !isExiting ? 'none' : 'transform 0.8s cubic-bezier(0.15, 0.85, 0.15, 1)' }}
          className={clsx(
            'relative w-full h-full rounded-[36px] z-10 overflow-hidden flex flex-col items-center justify-between p-8 md:p-9 text-center transition-all duration-500 border-2',
            isDarkTheme 
              ? 'bg-black/75 border-brand-beige/35 shadow-[0_25px_60px_rgba(0,0,0,0.85),_inset_0_2px_4px_rgba(255,255,255,0.15)]' 
              : 'bg-white/75 border-brand-beige/45 shadow-[0_25px_50px_rgba(168,139,94,0.1),_inset_0_2px_4px_rgba(255,255,255,0.7)]',
            isHovering && !isExiting 
              ? (isDarkTheme ? 'shadow-[0_30px_70px_rgba(200,169,126,0.22),_0_0_40px_rgba(200,169,126,0.1)]' : 'shadow-[0_30px_60px_rgba(168,139,94,0.16),_0_0_30px_rgba(200,169,126,0.06)]')
              : ''
          )}
        >
          {/* Real Light Sheen Reflection Layer */}
          <div
            ref={sheenRef}
            className="absolute inset-0 pointer-events-none z-30 transition-opacity duration-300 opacity-0"
          />

          {/* Double Beveled Glass Corners */}
          <div style={{ transform: 'translateZ(20px)' }} className={clsx('absolute top-5 left-5 w-5 h-5 border-t-[3px] border-l-[3px] rounded-tl-md', isDarkTheme ? 'border-brand-gold/60' : 'border-brand-beige-dark/60')} />
          <div style={{ transform: 'translateZ(20px)' }} className={clsx('absolute top-5 right-5 w-5 h-5 border-t-[3px] border-r-[3px] rounded-tr-md', isDarkTheme ? 'border-brand-gold/60' : 'border-brand-beige-dark/60')} />
          <div style={{ transform: 'translateZ(20px)' }} className={clsx('absolute bottom-5 left-5 w-5 h-5 border-b-[3px] border-l-[3px] rounded-bl-md', isDarkTheme ? 'border-brand-gold/60' : 'border-brand-beige-dark/60')} />
          <div style={{ transform: 'translateZ(20px)' }} className={clsx('absolute bottom-5 right-5 w-5 h-5 border-b-[3px] border-r-[3px] rounded-br-md', isDarkTheme ? 'border-brand-gold/60' : 'border-brand-beige-dark/60')} />

          {/* Est badge inside card */}
          <span
            style={{ transform: 'translateZ(35px)' }}
            className={clsx(
              'text-[10px] tracking-[0.3em] uppercase font-bold font-inter flex items-center gap-1.5 transition-colors duration-500',
              isDarkTheme ? 'text-brand-beige-light opacity-80' : 'text-brand-beige-dark'
            )}
          >
            <Coffee className={clsx('h-3 w-3', isDarkTheme ? 'text-brand-gold' : 'text-brand-beige-dark')} /> EST. 2024
          </span>

          {/* 3D ORBITAL SYSTEM */}
          <div
            style={{ transform: 'translateZ(80px)', transformStyle: 'preserve-3d' }}
            className="relative w-44 h-44 md:w-52 md:h-52 flex items-center justify-center my-4 group z-20"
          >
            {/* Holographic orbital rings */}
            {!isExiting && (
              <>
                <div 
                  style={{ 
                    transform: 'rotateX(72deg) rotateY(15deg) translateZ(0px)',
                    border: isDarkTheme ? '1.5px dashed rgba(200, 169, 126, 0.4)' : '1.5px dashed rgba(168, 139, 94, 0.35)',
                    boxShadow: isDarkTheme 
                      ? '0 0 15px rgba(200, 169, 126, 0.15), inset 0 0 15px rgba(200, 169, 126, 0.15)' 
                      : '0 0 10px rgba(168, 139, 94, 0.08), inset 0 0 10px rgba(168, 139, 94, 0.08)'
                  }}
                  className="absolute w-52 h-52 rounded-full animate-[spin_12s_linear_infinite] pointer-events-none" 
                />
                <div 
                  style={{ 
                    transform: 'rotateX(64deg) rotateY(-20deg) translateZ(5px)',
                    border: isDarkTheme ? '1px solid rgba(184, 134, 11, 0.35)' : '1px solid rgba(200, 169, 126, 0.3)',
                    boxShadow: isDarkTheme ? '0 0 20px rgba(184, 134, 11, 0.2)' : '0 0 12px rgba(200, 169, 126, 0.1)'
                  }}
                  className="absolute w-44 h-44 rounded-full animate-[spin_18s_linear_infinite_reverse] pointer-events-none" 
                />
                <div className={clsx(
                  'absolute inset-2 rounded-full blur-2xl animate-pulse pointer-events-none',
                  isDarkTheme ? 'bg-radial from-brand-gold/20 via-brand-beige/5 to-transparent' : 'bg-radial from-brand-beige/15 via-brand-beige-light/5 to-transparent'
                )} />
              </>
            )}

            {/* Absolute Floating Logo Image */}
            <img
              ref={logoRef}
              src="/logo.png"
              alt="Cafe Adnan Logo"
              style={{ 
                transform: 'translateZ(75px)',
                transition: 'transform 0.15s ease-out, filter 0.15s ease-out',
                filter: isDarkTheme
                  ? 'invert(0) drop-shadow(0 15px 25px rgba(0, 0, 0, 0.55)) drop-shadow(0 0 6px rgba(200, 169, 126, 0.2))'
                  : 'invert(1) drop-shadow(0 10px 18px rgba(0, 0, 0, 0.15)) drop-shadow(0 0 4px rgba(168, 139, 94, 0.15))'
              }}
              className="h-32 w-32 md:h-36 md:w-36 object-contain pointer-events-none transition-all duration-500"
            />
          </div>

          {/* 3D Typographic Section */}
          <div 
            style={{ transform: 'translateZ(50px)', transformStyle: 'preserve-3d' }} 
            className="flex flex-col items-center gap-2.5 w-full z-10"
          >
            <h1 
              ref={titleRef}
              style={{ 
                backgroundImage: isDarkTheme 
                  ? 'linear-gradient(135deg, #B8860B 0%, #E8D5B7 50%, #C8A97E 100%)' 
                  : 'linear-gradient(135deg, #6b4a28 0%, #A88B5E 50%, #6b4a28 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                transition: 'background-image 0.1s ease-out',
                textShadow: isDarkTheme ? '0 5px 15px rgba(0,0,0,0.4)' : '0 2px 4px rgba(0,0,0,0.06)'
              }}
              className="text-3xl md:text-4xl font-extrabold tracking-wide"
            >
              قهوة عدنان
            </h1>
            <h2 
              ref={subtitleRef}
              style={{ 
                backgroundImage: isDarkTheme 
                  ? 'linear-gradient(135deg, #A88B5E 0%, #E8D5B7 50%, #A88B5E 100%)'
                  : 'linear-gradient(135deg, #a88b5e 0%, #6b4a28 50%, #a88b5e 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                transition: 'background-image 0.1s ease-out',
                textShadow: isDarkTheme ? '0 3px 8px rgba(0,0,0,0.4)' : '0 1px 2px rgba(0,0,0,0.04)'
              }}
              className="text-sm tracking-[0.2em] font-bold uppercase -mt-0.5 font-inter"
            >
              Cafe Adnan
            </h2>
            <div 
              style={{ transform: 'translateZ(20px)' }} 
              className={clsx(
                'w-16 h-[2px] my-1.5 transition-all duration-500',
                isDarkTheme 
                  ? 'bg-gradient-to-r from-transparent via-brand-gold to-transparent shadow-[0_0_8px_rgba(184,134,11,0.5)]' 
                  : 'bg-gradient-to-r from-transparent via-brand-beige-dark to-transparent'
              )} 
            />
            <p className={clsx(
              'text-xs md:text-sm font-semibold max-w-[260px] leading-relaxed opacity-95 transition-colors duration-500',
              isDarkTheme ? 'text-brand-beige-light' : 'text-brand-gray-700'
            )}>
              حيث تلتقي الأصالة بالفخامة
              <br />
              <span className={clsx(
                'text-[10px] italic font-inter block mt-1 font-normal transition-colors duration-500',
                isDarkTheme ? 'text-brand-gray-400' : 'text-brand-gray-500'
              )}>
                Where Authenticity Meets Luxury
              </span>
            </p>
          </div>

          {/* Interactive Luxury Neon Enter Button */}
          <div
            style={{ transform: 'translateZ(65px)' }}
            className="w-full flex flex-col items-center gap-4 mt-5 z-20"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEnterMenu();
              }}
              className={clsx(
                'relative w-full py-4.5 px-6 rounded-2xl flex items-center justify-center gap-3 overflow-hidden transition-all duration-300 font-bold group shadow-lg cursor-pointer',
                isDarkTheme 
                  ? 'bg-gradient-to-r from-brand-beige to-brand-gold text-brand-black hover:shadow-[0_0_30px_rgba(200,169,126,0.35)]' 
                  : 'bg-brand-black text-brand-white hover:bg-brand-gray-900 hover:shadow-[0_0_20px_rgba(10,10,10,0.2)]',
                'hover:scale-[1.03] active:scale-97'
              )}
            >
              {/* Lightning speed sheen streak */}
              <div className="absolute inset-0 w-1/3 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 translate-x-[-150%] group-hover:translate-x-[250%] transition-transform duration-1000 ease-out" />
              
              <span className="text-sm md:text-base tracking-wider">دخول القائمة | Explore Menu</span>
              <ArrowRight className="h-4 w-4 md:h-5 md:w-5 transition-transform duration-300 group-hover:translate-x-1.5 rtl:rotate-180" />
            </button>
          </div>
        </div>
      </div>

      {/* Auto-redirect bottom progress indicator & skip prompt */}
      <div 
        className="absolute bottom-10 left-6 right-6 flex flex-col items-center gap-4.5 z-40 max-w-sm mx-auto w-full transition-opacity duration-300"
        style={{ opacity: isExiting ? 0 : 1, display: isExiting ? 'none' : 'flex' }}
      >
        <div 
          className={clsx(
            'w-full h-1.5 border rounded-full overflow-hidden transition-all duration-500 shadow-[inset_0_1px_3px_rgba(0,0,0,0.3)]',
            isDarkTheme ? 'bg-black/60 border-brand-beige/10' : 'bg-white/60 border-brand-beige/20'
          )}
        >
          <div
            style={{ width: `${countdown}%` }}
            className={clsx(
              'h-full rounded-full transition-all duration-75 linear',
              isDarkTheme 
                ? 'bg-gradient-to-r from-brand-beige-dark via-brand-beige to-brand-gold shadow-[0_0_8px_rgba(184,134,11,0.5)]' 
                : 'bg-gradient-to-r from-brand-beige-dark via-brand-beige to-brand-gold'
            )}
          />
        </div>
        
        {showSkipPrompt && (
          <button
            onClick={handleEnterMenu}
            className={clsx(
              'text-[11px] font-bold transition-all duration-300 uppercase tracking-widest font-inter cursor-pointer animate-fadeIn flex items-center gap-1.5 py-1.5 px-3 rounded-full border border-white/5 transition-colors duration-500',
              isDarkTheme 
                ? 'text-brand-beige/85 hover:text-brand-gold bg-black/40' 
                : 'text-brand-beige-dark hover:text-brand-gold bg-white/50 border-brand-beige/25'
            )}
          >
            <span className={clsx('inline-block w-1.5 h-1.5 rounded-full animate-ping', isDarkTheme ? 'bg-brand-gold' : 'bg-brand-beige-dark')} />
            الانتقال التلقائي قريباً... اضغط للدخول
          </button>
        )}
      </div>
    </div>
  );
}
