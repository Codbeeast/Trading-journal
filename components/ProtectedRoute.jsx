'use client'

import { useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function ProtectedRoute({ children, fallback = null }) {
  const { isLoaded, userId } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded && !userId) {
      router.push('/auth/sign-in')
    }
  }, [isLoaded, userId, router])

  // Show loading state while checking authentication
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Show fallback or nothing if not authenticated
  if (!userId) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600">
            Please sign in to view this page.
          </p>
        </div>
      </div>
    )
  }

  // Render children if authenticated
  return children
}

// Usage example:
// 
// import ProtectedRoute from '../components/ProtectedRoute'
// 
// export default function SomePage() {
//   return (
//     <ProtectedRoute>
//       <div>This content is protected!</div>
//     </ProtectedRoute>
//   )
// }