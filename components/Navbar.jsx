'use client';

import Link from 'next/link';
import { UserButton, SignedIn, SignedOut, SignInButton, SignUpButton } from '@clerk/nextjs';
import { motion } from 'framer-motion';

// Mock Clerk components for preview environments where @clerk/nextjs isn't installed.
// In your actual project, you can remove these mocks.
const MockClerkComponent = ({ children }) => <div>{children}</div>;
const SignedInMock = MockClerkComponent;
const SignedOutMock = MockClerkComponent;
const UserButtonMock = () => <div className="w-8 h-8 bg-gray-600 rounded-full"></div>;
const SignInButtonMock = ({ children }) => <div>{children}</div>;
const SignUpButtonMock = ({ children }) => <div>{children}</div>;

export default function Navbar() {
  // Gracefully fall back to mocks if Clerk components are not available.
  const ClerkSignedIn = typeof SignedIn === 'undefined' ? SignedInMock : SignedIn;
  const ClerkSignedOut = typeof SignedOut === 'undefined' ? SignedOutMock : SignedOut;
  const ClerkUserButton = typeof UserButton === 'undefined' ? UserButtonMock : UserButton;
  const ClerkSignInButton = typeof SignInButton === 'undefined' ? SignInButtonMock : SignInButton;
  const ClerkSignUpButton = typeof SignUpButton === 'undefined' ? SignUpButtonMock : SignUpButton;

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
            <img src="https://framerusercontent.com/images/rZ69z1xaFyAlaWj5xMpvc6uUxc4.jpg" alt="Forenotes Logo" className="h-8 w-auto" />
            <span className="text-2xl font-bold text-white">Forenotes</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link key={link.name} href={link.href} className="text-gray-300 hover:text-white transition-colors">
                {link.name}
              </Link>
            ))}
          </nav>
          
          {/* Auth Actions */}
          <div className="flex items-center gap-4">
            <ClerkSignedOut>
              <ClerkSignInButton mode="modal">
                <button className="text-gray-300 hover:text-white transition-colors">
                  Sign In
                </button>
              </ClerkSignInButton>
              <ClerkSignUpButton mode="modal">
                 <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-lg shadow-blue-500/20">
                  Sign Up
                </button>
              </ClerkSignUpButton>
            </ClerkSignedOut>
            <ClerkSignedIn>
              <Link href="/dashboard">
                <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-lg shadow-blue-500/20">
                  Dashboard
                </button>
              </Link>
              <ClerkUserButton afterSignOutUrl="/" />
            </ClerkSignedIn>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
