import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Trade from '@/models/Trade';

const DEFAULT_USER_ID = 'default-user';

// Simplified authentication function with better error handling
async function getAuthenticatedUser(request) {
  try {
    console.log('🔐 Starting authentication...');
    
    // Try server-side auth first
    try {
      const { auth } = await import('@clerk/nextjs/server');
      const { userId } = auth();
      
      if (userId) {
        console.log('✅ Server-side auth successful:', userId);
        return userId;
      }
      console.log('⚠️ No server-side userId, trying client auth...');
    } catch (authImportError) {
      console.log('⚠️ Server-side auth failed:', authImportError.message);
    }

    // Check for Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('⚠️ No auth header, using default user');
      return DEFAULT_USER_ID;
    }

    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      console.log('⚠️ Empty token, using default user');
      return DEFAULT_USER_ID;
    }

    // Try token verification
    try {
      const { verifyToken } = await import('@clerk/backend');
      const payload = await verifyToken(token, {
        jwtKey: process.env.CLERK_JWT_KEY,
        secretKey: process.env.CLERK_SECRET_KEY,
      });
      
      if (payload && payload.sub) {
        console.log('✅ Token verification successful:', payload.sub);
        return payload.sub;
      }
    } catch (tokenError) {
      console.log('⚠️ Token verification failed:', tokenError.message);
    }

    console.log('⚠️ All auth methods failed, using default user');
    return DEFAULT_USER_ID;
    
  } catch (error) {
    console.error('❌ Authentication error:', error);
    console.log('⚠️ Falling back to default user');
    return DEFAULT_USER_ID;
  }
}

export async function GET(request, { params }) {
  console.log('🔍 GET /api/trades/by-strategy/[strategyId] called');
  
  try {
    await connectDB();
    console.log('✅ Database connected');
    
    const { strategyId } = params;
    
    if (!strategyId) {
      console.log('❌ Strategy ID is required');
      return NextResponse.json({ error: 'Strategy ID is required' }, { status: 400 });
    }
    
    console.log('📋 Strategy ID:', strategyId);
    
    // Get authenticated user
    const userId = await getAuthenticatedUser(request);
    console.log('👤 Using userId:', userId);
    
    const query = {
      userId,
      strategy: strategyId
    };
    
    console.log('🔍 Fetching trades with query:', query);
    const trades = await Trade.find(query).populate('strategy').sort({ createdAt: -1 });
    console.log(`✅ Found ${trades.length} trades for strategy ${strategyId}`);
    
    return NextResponse.json(trades);
  } catch (error) {
    console.error('❌ GET /api/trades/by-strategy/[strategyId] error:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json({ 
      error: 'Failed to fetch trades by strategy',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}
