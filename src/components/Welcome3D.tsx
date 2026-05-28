'use client';

import { useEffect, useRef, useState } from 'react';
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

  const COUNTDOWN_DURATION = 7000; // 7 seconds to let them enjoy the 3D masterpiece

  useEffect(() => {
    setMounted(true);
    // Prefetch the menu page immediately on mount so navigation is instant
    router.prefetch('/menu');
    // Show skip prompt after 2 seconds
    const promptTimer = setTimeout(() => setShowSkipPrompt(true), 2500);
    return () => clearTimeout(promptTimer);
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
  }, [mounted, isExiting]);

  // Canvas particle system (Warm Golden Steam & Stardust)
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
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
      
      // Spawn interaction micro-sparks
      if (Math.random() < 0.4) {
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
      alpha: number;
      color: string;
      interactive: boolean;
      orbitOffset: number;
      orbitSpeed: number;
    }

    const particles: Particle[] = [];
    const maxParticles = 80;

    const luxuryGoldColors = [
      'rgba(200, 169, 126, ', // brand-beige
      'rgba(232, 213, 183, ', // brand-beige-light
      'rgba(184, 134, 11, ',  // brand-gold
      'rgba(243, 203, 116, ', // glowing golden light
      'rgba(255, 235, 190, ', // star light
    ];

    const spawnParticle = (x: number, y: number, interactive = false) => {
      const size = Math.random() * 2 + 0.6;
      const colorIndex = Math.floor(Math.random() * luxuryGoldColors.length);
      
      particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 1.5,
        vy: interactive ? (Math.random() - 0.5) * 2.5 : -Math.random() * 1.2 - 0.4,
        size,
        alpha: Math.random() * 0.6 + 0.3,
        color: luxuryGoldColors[colorIndex],
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
      // Luxurious Deep Pitch-Black Coffee Gradient background (always dark for premium contrast)
      const isDark = document.documentElement.classList.contains('dark');
      
      // Let's create an immersive warm dark theme by default, providing high-end gold contrast
      const glowGrad = ctx.createRadialGradient(
        width / 2, height / 2, 0,
        width / 2, height / 2, Math.max(width, height)
      );
      
      if (isDark) {
        glowGrad.addColorStop(0, '#100a08'); // Deep chocolate-coffee core
        glowGrad.addColorStop(0.5, '#070403');
        glowGrad.addColorStop(1, '#020101');
      } else {
        // High contrast luxury dark theme even on light mode, but with warmer accents
        glowGrad.addColorStop(0, '#18120e'); 
        glowGrad.addColorStop(0.6, '#0d0806');
        glowGrad.addColorStop(1, '#050302');
      }
      
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, width, height);

      // Ambient luxury background beam (glowing gold columns)
      ctx.fillStyle = 'rgba(200, 169, 126, 0.015)';
      ctx.beginPath();
      ctx.ellipse(width / 2, height / 2, width * 0.3, height * 0.8, Math.PI / 6, 0, Math.PI * 2);
      ctx.fill();

      // Spawn new rising particles
      if (particles.length < maxParticles && Math.random() < 0.15) {
        spawnParticle(Math.random() * width, height + 10);
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        // Particle movement
        p.x += p.vx;
        p.y += p.vy;

        // Apply slight orbital drift for magical stardust look
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

        // Environmental drift friction
        p.vx *= 0.97;
        if (p.interactive) {
          p.vy *= 0.97;
          p.alpha -= 0.007;
        } else {
          p.vy = Math.max(-1.8, p.vy - 0.005);
          p.alpha -= 0.001; // environmental particles fade extremely slowly
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

    // Apply card transform
    card.style.transform = `perspective(1500px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.05, 1.05, 1.05)`;

    // Interactive reflection sheen (moving in opposite direction)
    if (sheen) {
      const sheenX = (1 - (x / rect.width)) * 100;
      const sheenY = (1 - (y / rect.height)) * 100;
      sheen.style.background = `radial-gradient(circle at ${sheenX}% ${sheenY}%, rgba(255, 223, 137, 0.22) 0%, transparent 60%)`;
      sheen.style.opacity = '1';
    }

    // Dynamic Shadow Shift under the floating logo (simulates 3D spatial height)
    if (logo) {
      const shadowX = -px * 32;
      const shadowY = -py * 32;
      logo.style.transform = `translateZ(100px) scale(1.06)`;
      logo.style.filter = `drop-shadow(${shadowX}px ${shadowY}px 18px rgba(0, 0, 0, 0.75)) drop-shadow(0 0 12px rgba(200, 169, 126, 0.3))`;
    }

    // Dynamic metallic Gold Foil text shimmer effect
    if (title && subtitle) {
      const textAngle = ((px + 0.5) * 360).toFixed(0);
      title.style.backgroundImage = `linear-gradient(${textAngle}deg, #A88B5E 0%, #F5E5C9 30%, #C8A97E 60%, #B8860B 100%)`;
      subtitle.style.backgroundImage = `linear-gradient(${textAngle}deg, #A88B5E 0%, #F5E5C9 30%, #C8A97E 60%, #B8860B 100%)`;
    }
  };

  const handleTouchMove3D = (e: React.TouchEvent<HTMLDivElement>) => {
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
      sheen.style.background = `radial-gradient(circle at ${sheenX}% ${sheenY}%, rgba(255, 223, 137, 0.16) 0%, transparent 60%)`;
    }

    if (logo) {
      const shadowX = -px * 20;
      const shadowY = -py * 20;
      logo.style.transform = `translateZ(80px) scale(1.04)`;
      logo.style.filter = `drop-shadow(${shadowX}px ${shadowY}px 12px rgba(0, 0, 0, 0.7)) drop-shadow(0 0 8px rgba(200, 169, 126, 0.25))`;
    }
  };

  const handleMouseLeave3D = () => {
    const card = cardRef.current;
    const sheen = sheenRef.current;
    const logo = logoRef.current;
    const title = titleRef.current;
    const subtitle = subtitleRef.current;
    
    if (!card) return;

    // Reset card smooth ease-out
    card.style.transform = 'perspective(1500px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    
    if (sheen) {
      sheen.style.background = 'transparent';
      sheen.style.opacity = '0';
    }

    if (logo) {
      logo.style.transform = 'translateZ(75px) scale(1)';
      logo.style.filter = 'drop-shadow(0 15px 25px rgba(0, 0, 0, 0.55)) drop-shadow(0 0 6px rgba(200, 169, 126, 0.2))';
    }

    if (title && subtitle) {
      title.style.backgroundImage = 'linear-gradient(135deg, #B8860B 0%, #E8D5B7 50%, #C8A97E 100%)';
      subtitle.style.backgroundImage = 'linear-gradient(135deg, #A88B5E 0%, #E8D5B7 50%, #A88B5E 100%)';
    }
  };

  // Cinematic page transition zoom trigger
  const handleEnterMenu = () => {
    if (isExiting) return;
    setIsExiting(true);

    const card = cardRef.current;
    if (card) {
      card.style.transition = 'transform 0.9s cubic-bezier(0.7, 0, 0.2, 1), opacity 0.8s ease-out';
      card.style.transform = 'perspective(1500px) rotateX(0deg) rotateY(0deg) translateZ(500px) scale3d(2.2, 2.2, 2.2)';
      card.style.opacity = '0';
    }

    setTimeout(() => {
      router.push('/menu');
    }, 850);
  };

  if (!mounted) return null;

  return (
    <div
      className={clsx(
        'relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden font-cairo select-none transition-all duration-1000 bg-[#070403]',
        isExiting ? 'opacity-0 bg-[#070403] scale-98 pointer-events-none' : 'opacity-100'
      )}
    >
      {/* Background Canvas Particles */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0 block pointer-events-none" />

      {/* Floating 3D Sparkles in space (Parallax background layers) */}
      <div className="absolute top-1/4 left-1/10 w-2 h-2 bg-brand-beige-light rounded-full blur-[1px] animate-pulse opacity-60 z-10 pointer-events-none" style={{ transform: 'translateZ(-150px)' }} />
      <div className="absolute bottom-1/4 right-1/10 w-3 h-3 bg-brand-gold rounded-full blur-[2px] animate-ping opacity-30 z-10 pointer-events-none" style={{ transform: 'translateZ(-100px)', animationDuration: '6s' }} />
      <div className="absolute top-1/3 right-1/5 w-1.5 h-1.5 bg-white rounded-full blur-none animate-pulse opacity-85 z-10 pointer-events-none" style={{ transform: 'translateZ(-50px)' }} />

      {/* Top Navigation Bar */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-40 max-w-5xl mx-auto w-full px-6">
        <div className="flex items-center gap-2.5 bg-black/60 backdrop-blur-xl border border-brand-beige/25 py-2 px-4 rounded-full shadow-[0_0_20px_rgba(200,169,126,0.1)] text-xs font-bold text-brand-beige-light">
          <Sparkles className="h-3.5 w-3.5 text-brand-gold animate-bounce" />
          <span>تألق الفخامة • Cafe Adnan Experience</span>
        </div>
        <button
          onClick={toggleTheme}
          className="p-3.5 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 bg-black/60 backdrop-blur-xl border border-brand-beige/25 shadow-[0_0_20px_rgba(200,169,126,0.1)] text-brand-beige hover:text-brand-gold"
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
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
            'absolute inset-5 rounded-full blur-[90px] opacity-40 transition-all duration-1000 z-0 pointer-events-none',
            isHovering 
              ? 'bg-brand-gold scale-120 blur-[110px] opacity-60' 
              : 'bg-brand-beige opacity-35'
          )}
        />

        {/* The 3D Glassmorphic Slab (Masterpiece structure) */}
        <div
          ref={cardRef}
          onClick={handleEnterMenu}
          style={{ transformStyle: 'preserve-3d', transition: isHovering ? 'none' : 'transform 0.8s cubic-bezier(0.15, 0.85, 0.15, 1)' }}
          className={clsx(
            'relative w-full h-full rounded-[36px] z-10 overflow-hidden flex flex-col items-center justify-between p-8 md:p-9 text-center transition-all duration-500',
            // Dedicated High-End Dark Luxury Theme for supreme contrast
            'bg-black/75 backdrop-blur-2xl',
            'border-2 border-brand-beige/35',
            'shadow-[0_25px_60px_rgba(0,0,0,0.85),_inset_0_2px_4px_rgba(255,255,255,0.15)]',
            isHovering ? 'shadow-[0_30px_70px_rgba(200,169,126,0.22),_0_0_40px_rgba(200,169,126,0.1)]' : ''
          )}
        >
          {/* Real Light Sheen Reflection Layer */}
          <div
            ref={sheenRef}
            className="absolute inset-0 pointer-events-none z-30 transition-opacity duration-300 opacity-0"
          />

          {/* Double Beveled Glass Corners */}
          <div style={{ transform: 'translateZ(20px)' }} className="absolute top-5 left-5 w-5 h-5 border-t-[3px] border-l-[3px] border-brand-gold/60 rounded-tl-md" />
          <div style={{ transform: 'translateZ(20px)' }} className="absolute top-5 right-5 w-5 h-5 border-t-[3px] border-r-[3px] border-brand-gold/60 rounded-tr-md" />
          <div style={{ transform: 'translateZ(20px)' }} className="absolute bottom-5 left-5 w-5 h-5 border-b-[3px] border-l-[3px] border-brand-gold/60 rounded-bl-md" />
          <div style={{ transform: 'translateZ(20px)' }} className="absolute bottom-5 right-5 w-5 h-5 border-b-[3px] border-r-[3px] border-brand-gold/60 rounded-br-md" />

          {/* Est badge inside card */}
          <span
            style={{ transform: 'translateZ(35px)' }}
            className="text-[10px] tracking-[0.3em] uppercase text-brand-beige-light font-bold opacity-80 font-inter flex items-center gap-1.5"
          >
            <Coffee className="h-3 w-3 text-brand-gold" /> EST. 2024
          </span>

          {/* 3D ORBITAL SYSTEM (The Masterpiece 3D orbits) */}
          <div
            style={{ transform: 'translateZ(80px)', transformStyle: 'preserve-3d' }}
            className="relative w-44 h-44 md:w-52 md:h-52 flex items-center justify-center my-4 group z-20"
          >
            {/* Holographic orbital ring 1 (Rotated 3D) */}
            <div 
              style={{ 
                transform: 'rotateX(72deg) rotateY(15deg) translateZ(0px)',
                border: '1.5px dashed rgba(200, 169, 126, 0.4)',
                boxShadow: '0 0 15px rgba(200, 169, 126, 0.15), inset 0 0 15px rgba(200, 169, 126, 0.15)'
              }}
              className="absolute w-52 h-52 rounded-full animate-[spin_12s_linear_infinite] pointer-events-none" 
            />

            {/* Holographic orbital ring 2 (Rotated 3D Counter-clockwise) */}
            <div 
              style={{ 
                transform: 'rotateX(64deg) rotateY(-20deg) translateZ(5px)',
                border: '1px solid rgba(184, 134, 11, 0.35)',
                boxShadow: '0 0 20px rgba(184, 134, 11, 0.2)'
              }}
              className="absolute w-44 h-44 rounded-full animate-[spin_18s_linear_infinite_reverse] pointer-events-none" 
            />

            {/* Outer halo disk glow */}
            <div className="absolute inset-2 rounded-full bg-radial from-brand-gold/20 via-brand-beige/5 to-transparent blur-2xl animate-pulse pointer-events-none" />

            {/* Absolute Floating Logo Image (with dynamic shadow and shift) */}
            <img
              ref={logoRef}
              src="/logo.png"
              alt="Cafe Adnan Logo"
              style={{ 
                transform: 'translateZ(75px)',
                transition: 'transform 0.15s ease-out, filter 0.15s ease-out',
                filter: 'drop-shadow(0 15px 25px rgba(0, 0, 0, 0.55)) drop-shadow(0 0 6px rgba(200, 169, 126, 0.2))'
              }}
              className={clsx(
                'h-32 w-32 md:h-36 md:w-36 object-contain pointer-events-none',
                // Keep original light-color logo visible on dark theme (non-inverted)
                'invert-0'
              )}
            />
          </div>

          {/* 3D Typographic Section with Metallic Gold foil reflection */}
          <div 
            style={{ transform: 'translateZ(50px)', transformStyle: 'preserve-3d' }} 
            className="flex flex-col items-center gap-2.5 w-full z-10"
          >
            <h1 
              ref={titleRef}
              style={{ 
                backgroundImage: 'linear-gradient(135deg, #B8860B 0%, #E8D5B7 50%, #C8A97E 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                transition: 'background-image 0.1s ease-out',
                textShadow: '0 5px 15px rgba(0,0,0,0.4)'
              }}
              className="text-3xl md:text-4xl font-extrabold tracking-wide"
            >
              قهوة عدنان
            </h1>
            <h2 
              ref={subtitleRef}
              style={{ 
                backgroundImage: 'linear-gradient(135deg, #A88B5E 0%, #E8D5B7 50%, #A88B5E 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                transition: 'background-image 0.1s ease-out',
                textShadow: '0 3px 8px rgba(0,0,0,0.4)'
              }}
              className="text-sm tracking-[0.2em] font-bold uppercase -mt-0.5 font-inter"
            >
              Cafe Adnan
            </h2>
            <div style={{ transform: 'translateZ(20px)' }} className="w-16 h-[2px] bg-gradient-to-r from-transparent via-brand-gold to-transparent my-1.5 shadow-[0_0_8px_rgba(184,134,11,0.5)]" />
            <p className="text-xs md:text-sm text-brand-beige-light font-semibold max-w-[260px] leading-relaxed opacity-95">
              حيث تلتقي الأصالة بالفخامة
              <br />
              <span className="text-[10px] text-brand-gray-400 italic font-inter block mt-1 font-normal">
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
                'bg-gradient-to-r from-brand-beige to-brand-gold text-brand-black hover:scale-[1.03] active:scale-97 hover:shadow-[0_0_30px_rgba(200,169,126,0.35)]'
              )}
            >
              {/* Gold lightning speed sheen streak */}
              <div className="absolute inset-0 w-1/3 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12 translate-x-[-150%] group-hover:translate-x-[250%] transition-transform duration-1000 ease-out" />
              
              <span className="text-sm md:text-base tracking-wider">دخول القائمة | Explore Menu</span>
              <ArrowRight className="h-4 w-4 md:h-5 md:w-5 transition-transform duration-300 group-hover:translate-x-1.5 rtl:rotate-180" />
            </button>
          </div>
        </div>
      </div>

      {/* Auto-redirect bottom progress indicator & skip prompt */}
      <div className="absolute bottom-10 left-6 right-6 flex flex-col items-center gap-4.5 z-40 max-w-sm mx-auto w-full">
        <div className="w-full h-1.5 bg-black/60 border border-brand-beige/10 rounded-full overflow-hidden shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)]">
          <div
            style={{ width: `${countdown}%` }}
            className="h-full bg-gradient-to-r from-brand-beige-dark via-brand-beige to-brand-gold rounded-full transition-all duration-75 linear shadow-[0_0_8px_rgba(184,134,11,0.5)]"
          />
        </div>
        
        {showSkipPrompt && (
          <button
            onClick={handleEnterMenu}
            className="text-[11px] font-bold text-brand-beige/85 hover:text-brand-gold transition-colors duration-200 uppercase tracking-widest font-inter cursor-pointer animate-fadeIn flex items-center gap-1.5 bg-black/40 py-1.5 px-3 rounded-full border border-white/5"
          >
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand-gold animate-ping" />
            الانتقال التلقائي قريباً... اضغط للدخول
          </button>
        )}
      </div>
    </div>
  );
}
