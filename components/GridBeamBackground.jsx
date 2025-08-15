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
                    /* Layer 4: Stronger diagonal light beams from top-left */
                    linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, transparent 40%),
                    linear-gradient(140deg, rgba(79, 70, 229, 0.06) 0%, transparent 35%),
                    linear-gradient(130deg, rgba(59, 130, 246, 0.07) 0%, transparent 45%),
                    linear-gradient(145deg, rgba(99, 102, 241, 0.05) 0%, transparent 30%),

                    /* Layer 3: Subtle grid - Vertical Lines */
                    repeating-linear-gradient(
                      to right,
                      rgba(255, 255, 255, 0.015),
                      rgba(255, 255, 255, 0.015) 1px,
                      transparent 1px,
                      transparent 80px
                    ),
                    
                    /* Layer 2: Subtle grid - Horizontal Lines */
                    repeating-linear-gradient(
                      to bottom,
                      rgba(255, 255, 255, 0.015),
                      rgba(255, 255, 255, 0.015) 1px,
                      transparent 1px,
                      transparent 80px
                    ),

                    /* Layer 1: Deep dark blue base background */
                    linear-gradient(145deg, #000000 0%, #050814 50%, #000000 100%);

                  background-size: cover;
                  background-repeat: no-repeat;
                  animation: subtleShift 40s infinite ease-in-out;
                }

                @keyframes subtleShift {
                  0%, 100% {
                    background-position: 
                      0% 0%,
                      0% 0%,
                      0% 0%,
                      0% 0%,
                      0 0,
                      0 0,
                      0 0;
                  }
                  50% {
                    background-position: 
                      2% 2%,
                      1% 3%,
                      2.5% 1.5%,
                      1.5% 2.5%,
                      0 0,
                      0 0,
                      0 0;
                  }
                }

                /* Radial glow overlay for depth */
                .backgroundContainer::after {
                  content: '';
                  position: absolute;
                  top: 0;
                  left: 0;
                  right: 0;
                  bottom: 0;
                  background: radial-gradient(circle at 30% 20%, rgba(59, 130, 246, 0.08) 0%, transparent 60%);
                  pointer-events: none;
                }
            `}</style>
            <div className="backgroundContainer"></div>
        </>
    );
};

export default GridBeamBackground;
