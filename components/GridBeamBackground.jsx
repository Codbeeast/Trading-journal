// GridBeamBackground.jsx
'use client';
import React from 'react';

const GridBeamBackground = () => {
  return (
    <>
      <style jsx global>{`
        :root{
          --grid-gap: 80px;
          --grid-opacity: 0.035;     /* visible but understated */
          --ray-blur: 44px;          /* softness of rays */
          --ray-strong: 0.14;        /* main ray alpha */
          --ray-mid: 0.08;           /* mid ray alpha */
          --ray-faint: 0.045;        /* faint fill alpha */
          --ray-drift: 22%;          /* horizontal drift amount */
        }

        /* container keeps the canvas full-screen and behind content */
        .backgroundContainer {
          position: fixed;
          inset: 0;
          width: 100vw;
          height: 100vh;
          z-index: -1;
          pointer-events: none;
          overflow: hidden;
          background: linear-gradient(150deg, #000000 0%, #030314 38%, #000000 100%);
        }

        /* subtle inner vignette to keep center readable and blacks respectful */
        .backgroundContainer::before{
          content: '';
          position: absolute;
          inset: 0;
          z-index: 0;
          background: radial-gradient(1200px 700px at 18% 12%, rgba(6,10,28,0.18), transparent 30%);
          mix-blend-mode: multiply;
          pointer-events: none;
        }

        /* GRID - visible but faint, behind rays */
        .gridLayer {
          position: absolute;
          inset: 0;
          z-index: 1;
          background-image:
            repeating-linear-gradient(
              to right,
              rgba(255,255,255,var(--grid-opacity)),
              rgba(255,255,255,var(--grid-opacity)) 1px,
              transparent 1px,
              transparent var(--grid-gap)
            ),
            repeating-linear-gradient(
              to bottom,
              rgba(255,255,255,var(--grid-opacity)),
              rgba(255,255,255,var(--grid-opacity)) 1px,
              transparent 1px,
              transparent var(--grid-gap)
            );
          mix-blend-mode: overlay;
          transform: translateZ(0);
          animation: gridSlow 80s linear infinite;
          opacity: 0.98;
        }

        @keyframes gridSlow {
          0%   { background-position: 0 0, 0 0; }
          100% { background-position: 140px 70px, 0 140px; }
        }

        /* RAYS container (above grid) */
        .raysLayer {
          position: absolute;
          inset: 0;
          z-index: 2;
          overflow: visible;
        }

        /* Each ray is a huge blurred strip positioned top-left and rotated toward right */
        .ray {
          position: absolute;
          /* place origin slightly off-canvas top-left so rays sweep across */
          left: -36%;
          top: -32%;
          width: 200%;
          height: 220%;
          filter: blur(var(--ray-blur));
          transform-origin: 0% 0%;
          mix-blend-mode: screen; /* lifts highlights while keeping blacks deep thanks to low alpha */
          pointer-events: none;
        }

        /* Main bright beam (closest to reference) */
        .ray.r1 {
          background: linear-gradient(90deg,
            rgba(24,58,167,var(--ray-strong)) 0%,
            rgba(59,130,246,0.085) 18%,
            rgba(59,130,246,var(--ray-faint)) 38%,
            transparent 72%);
          transform: rotate(-24deg) translateX(0);
          opacity: 0.96;
          animation: r1 30s ease-in-out infinite;
        }

        /* Secondary beam, slightly different angle and tint */
        .ray.r2 {
          background: linear-gradient(90deg,
            rgba(38,24,112,var(--ray-mid)) 0%,
            rgba(79,70,229,0.06) 20%,
            rgba(79,70,229,0.02) 42%,
            transparent 75%);
          transform: rotate(-20deg) translateX(0);
          opacity: 0.86;
          animation: r2 36s ease-in-out infinite;
        }

        /* Faint volumetric fill that softens edges and creates the overlapping feel */
        .ray.r3 {
          background: linear-gradient(90deg,
            rgba(40,46,102,var(--ray-faint)) 0%,
            rgba(99,102,241,0.03) 28%,
            transparent 70%);
          transform: rotate(-28deg) translateX(0);
          opacity: 0.72;
          animation: r3 34s ease-in-out infinite;
        }

        /* subtle breathing/translate so rays feel alive but slow */
        @keyframes r1 {
          0%   { transform: rotate(-24deg) translateX(0) scale(1); opacity: 0.92; }
          50%  { transform: rotate(-24deg) translateX(var(--ray-drift)) scale(1.02); opacity: 1; }
          100% { transform: rotate(-24deg) translateX(0) scale(1); opacity: 0.92; }
        }
        @keyframes r2 {
          0%   { transform: rotate(-20deg) translateX(0) scale(1); opacity: 0.80; }
          50%  { transform: rotate(-20deg) translateX(calc(var(--ray-drift) * 0.6)) scale(1.01); opacity: 0.9; }
          100% { transform: rotate(-20deg) translateX(0) scale(1); opacity: 0.80; }
        }
        @keyframes r3 {
          0%   { transform: rotate(-28deg) translateX(0) scale(1); opacity: 0.68; }
          50%  { transform: rotate(-28deg) translateX(calc(var(--ray-drift) * 1.15)) scale(1.03); opacity: 0.78; }
          100% { transform: rotate(-28deg) translateX(0) scale(1); opacity: 0.68; }
        }

        /* small soft top-left glow to mimic source without washing blacks */
        .softGlow {
          position: absolute;
          left: 0;
          top: 0;
          width: 46%;
          height: 46%;
          z-index: 1;
          background: radial-gradient(circle at 6% 8%, rgba(40,60,200,0.12), rgba(28,34,80,0.06) 18%, transparent 40%);
          filter: blur(22px);
          mix-blend-mode: screen;
          pointer-events: none;
        }

        /* accessibility: stop animations if user prefers reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .gridLayer { animation: none; }
          .ray { animation: none; filter: blur(calc(var(--ray-blur) * 0.6)); }
        }
      `}</style>

      <div className="backgroundContainer" aria-hidden>
        <div className="softGlow" />
        <div className="gridLayer" />
        <div className="raysLayer">
          <div className="ray r1" />
          <div className="ray r2" />
          <div className="ray r3" />
        </div>
      </div>
    </>
  );
};

export default GridBeamBackground;
