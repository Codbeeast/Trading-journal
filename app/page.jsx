import Navbar from '@/components/Navbar'; // Assuming Navbar is in this path
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const HomePage = () => {
  return (
    <div className="min-h-screen w-full bg-gray-900 text-white flex flex-col">
      <Navbar />
      
      {/* Main content area */}
      <main className="flex-grow flex flex-col items-center justify-center text-center px-4">
        {/* Background decorative elements for a subtle, modern look */}
        <div className="absolute inset-0 z-0 opacity-10 overflow-hidden">
          <div className="absolute top-0 -left-1/4 w-full h-full bg-[radial-gradient(circle_farthest-side,rgba(147,51,234,0.15),rgba(255,255,255,0))]"></div>
          <div className="absolute bottom-0 -right-1/4 w-full h-full bg-[radial-gradient(circle_farthest-side,rgba(59,130,246,0.15),rgba(255,255,255,0))]"></div>
        </div>

        <div className="relative z-10">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent">
            Welcome to ForeNotes
          </h1>
          <p className="mt-4 text-lg text-gray-400">
            Your all-in-one trading companion.
          </p>
          <Link href="/dashboard">
            <button className="mt-8 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-purple-500/20 hover:scale-105 transform transition-all duration-300 flex items-center gap-2 mx-auto">
              <span>Get Started</span>
              <ArrowRight size={20} />
            </button>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
