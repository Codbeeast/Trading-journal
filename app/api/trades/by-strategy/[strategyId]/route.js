import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import dbConnect from '@/lib/dbConnect';
import Trade from '@/models/Trade';

const DEFAULT_USER_ID = 'default-user';

// Helper function to get user from request (same as in strategies API)
async function getAuthenticatedUser(request) {
  try {
    // First try to get user from server-side auth
    const { userId } = auth();
    
    if (userId) {
      return userId;
    }

    // If server-side auth fails, try to get from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // Fallback to default user for backward compatibility
      return DEFAULT_USER_ID;
    }

    // For client-side requests, we need to verify the JWT token with Clerk
    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      return DEFAULT_USER_ID;
    }

    // Import Clerk's JWT verification
    const { verifyToken } = await import('@clerk/backend');
    
    try {
      // Verify the token and extract the payload
      const payload = await verifyToken(token, {
        jwtKey: process.env.CLERK_JWT_KEY,
        secretKey: process.env.CLERK_SECRET_KEY,
      });
      
      if (payload && payload.sub) {
        return payload.sub; // sub contains the user ID
      }
    } catch (tokenError) {
      console.error('Token verification failed:', tokenError);
      
      // Fallback: try to extract userId from token payload without verification
      // This is less secure but works for development
      try {
        const base64Payload = token.split('.')[1];
        const decodedPayload = JSON.parse(atob(base64Payload));
        if (decodedPayload.sub) {
          console.warn('Using unverified token payload - not recommended for production');
          return decodedPayload.sub;
        }
      } catch (parseError) {
        console.error('Failed to parse token payload:', parseError);
      }
    }

    // Final fallback to default user
    return DEFAULT_USER_ID;
  } catch (error) {
    console.error('Authentication error:', error);
    // Return default user instead of throwing error to maintain compatibility
    return DEFAULT_USER_ID;
  }
}

export async function GET(request, { params }) {
  try {
    await dbConnect();
    
    const { strategyId } = params;
    
    if (!strategyId) {
      return NextResponse.json({ error: 'Strategy ID is required' }, { status: 400 });
    }

    // Get authenticated user (with fallback to default user)
    const userId = await getAuthenticatedUser(request);
    
    console.log(`Fetching trades for strategy ${strategyId} and user ${userId}`);
    
    const trades = await Trade.find({
      userId: userId,
      strategy: strategyId
    }).populate('strategy').sort({ createdAt: -1 });
    
    return NextResponse.json(trades);
  } catch (error) {
    console.error('GET /api/trades/by-strategy/[strategyId] error:', error);
    return NextResponse.json({ error: 'Failed to fetch trades by strategy' }, { status: 500 });
  }
}
