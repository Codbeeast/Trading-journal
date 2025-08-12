import React from 'react';

export default function Page() {
  return (
    <main className="flex items-center justify-center min-h-screen bg-black">
      <div className="flex flex-col items-center gap-6">
        {/* Glowing Large Text */}
        <h1 className="text-3xl md:text-8xl font-extrabold text-blue-400 drop-shadow-[0_0_20px_rgba(59,130,246,0.8)] animate-pulse">
          Coming Soon..
        </h1>
      </div>
    </main>
  );
}
