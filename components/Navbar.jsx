'use client';

import Link from 'next/link';
import {
  UserButton,
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
} from '@clerk/nextjs';
import { motion } from 'framer-motion';
import { dark } from '@clerk/themes';

export default function Navbar() {
  const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-lg border-b border-white/10"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <img
              src="https://framerusercontent.com/images/rZ69z1xaFyAlaWj5xMpvc6uUxc4.jpg"
              alt="Forenotes Logo"
              className="h-8 w-auto"
            />
            <span className="text-2xl font-medium text-white">Forenotes</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-gray-300 hover:text-white transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Auth Actions */}
          <div className="flex items-center gap-4">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="text-gray-300 hover:text-white transition-colors">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-lg shadow-blue-500/20">
                  Sign Up
                </button>
              </SignUpButton>
            </SignedOut>

            <SignedIn>
              <Link href="/dashboard">
                <motion.button
                  whileHover={{
                    scale: 1.05,
                    boxShadow: '0px 0px 20px rgba(59, 130, 246, 0.7)',
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-lg shadow-blue-500/20"
                >
                  Dashboard
                </motion.button>
              </Link>

              <UserButton
                afterSignOutUrl="/"
                userProfileMode="navigation"
                userProfileUrl="/profile"
                appearance={{
                  baseTheme: dark,
                  variables: {
                    colorPrimary: '#00ff88',
                    colorBackground: '#000000',
                    colorText: '#ffffff',
                    colorInputBackground: '#111111',
                    colorInputText: '#ffffff',
                  },
                }}
              />
            </SignedIn>
          </div>
        </div>
      </div>
    </motion.header>
  );
}