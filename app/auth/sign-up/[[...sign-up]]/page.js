"use client";

import { SignUp } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
}

export default function SignUpPage() {
  const [referralCode, setReferralCode] = useState(null);

  useEffect(() => {
    const code = getCookie('ref');
    if (code) {
      setReferralCode(code);
    }
  }, []);

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
          {referralCode && (
            <p className="mt-2 text-sm text-green-500 font-medium">
              🎉 You were referred by a friend!
            </p>
          )}
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
            unsafeMetadata={referralCode ? { referredBy: referralCode } : undefined}
          />
        </div>
      </div>
    </div>
  );
}