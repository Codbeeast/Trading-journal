const GridBeamBackground = () => {
  return (
    <>
      <style jsx global>{`
        .backgroundContainer {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          z-index: -1;
          overflow: hidden;

          background: 
            /* Layer 1: Light rays pointing toward right side */
            linear-gradient(100deg, rgba(59, 130, 246, 0.12) 0%, transparent 50%),
            linear-gradient(105deg, rgba(79, 70, 229, 0.10) 0%, transparent 55%),
            linear-gradient(95deg, rgba(99, 102, 241, 0.08) 0%, transparent 60%),

            /* Layer 2: Visible grid - Vertical */
            repeating-linear-gradient(
              to right,
              rgba(255, 255, 255, 0.03),
              rgba(255, 255, 255, 0.03) 1px,
              transparent 1px,
              transparent 80px
            ),
            
            /* Layer 3: Visible grid - Horizontal */
            repeating-linear-gradient(
              to bottom,
              rgba(255, 255, 255, 0.03),
              rgba(255, 255, 255, 0.03) 1px,
              transparent 1px,
              transparent 80px
            ),

            /* Base */
            linear-gradient(145deg, #000000 0%, #050814 50%, #000000 100%);

          background-size: cover;
          background-repeat: no-repeat;
          animation: moveRays 25s infinite linear, moveGrid 60s infinite linear;
        }

        /* Rays motion: slow drift to enhance the "spectacular" look */
        @keyframes moveRays {
          0% {
            background-position: 0% 0%, 0% 0%, 0% 0%, 0 0, 0 0, 0 0;
          }
          100% {
            background-position: 20% 0%, 15% 0%, 25% 0%, 0 0, 0 0, 0 0;
          }
        }

        /* Grid slow movement for depth */
        @keyframes moveGrid {
          0% {
            background-position: 0 0, 0 0, 0 0;
          }
          100% {
            background-position: 80px 80px, 0 80px, 0 0;
          }
        }
      `}</style>
      <div className="backgroundContainer"></div>
    </>
  );
};

export default GridBeamBackground;
