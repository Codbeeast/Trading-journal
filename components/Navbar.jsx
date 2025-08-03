import { UserButton, SignedIn, SignedOut, SignInButton } from '@clerk/nextjs'
import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="bg-[#131034] shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-white">
            Forenotes
          </Link>
          
          
          
          {/* Auth Actions */}
          <div className="flex items-center space-x-4">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="text-gray-50 hover:text-blue-600 transition-colors">
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton 
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8"
                  }
                }}
              />
            </SignedIn>
          </div>
        </div>
      </div>
    </nav>
  )
}