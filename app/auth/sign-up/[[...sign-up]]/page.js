import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Create your account
          </h2>
          <p className="text-gray-600">
            Get started with your free account today.
          </p>
        </div>
        <div className="flex justify-center">
          <SignUp 
            appearance={{
              elements: {
                formButtonPrimary: 
                  "bg-blue-600 hover:bg-blue-700 text-sm normal-case",
                card: "shadow-lg",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
              },
            }}
          />
        </div>
      </div>
    </div>
  )
}