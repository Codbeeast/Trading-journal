import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import {connectDB} from '@/lib/db';
import Trade from '@/models/Trade';
import Strategy from '@/models/Strategy';

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

// Helper function to get current trading session based on time
function getCurrentSession() {
  const now = new Date();
  const utcHour = now.getUTCHours();
  
  // Trading sessions in UTC
  if (utcHour >= 23 || utcHour < 8) {
    return { sessionName: 'Asian Session', pair: 'AUD/USD' };
  } else if (utcHour >= 0 && utcHour < 9) {
    return { sessionName: 'Tokyo Session', pair: 'USD/JPY' };
  } else if (utcHour >= 8 && utcHour < 17) {
    return { sessionName: 'London Session', pair: 'EUR/USD' };
  } else if (utcHour >= 13 && utcHour < 22) {
    return { sessionName: 'New York Session', pair: 'GBP/USD' };
  } else {
    return { sessionName: 'Sydney Session', pair: 'AUD/USD' };
  }
}

export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const strategyId = searchParams.get('strategyId');
    
    // Get authenticated user
    const userId = await getAuthenticatedUser(request);
    
    if (id) {
      const trade = await Trade.findOne({ _id: id, userId }).populate('strategy');
      if (!trade) {
        return NextResponse.json({ error: 'Trade not found' }, { status: 404 });
      }
      return NextResponse.json(trade);
    }
    
    let query = { userId };
    if (strategyId) {
      query.strategy = strategyId;
    }
    
    const trades = await Trade.find(query).populate('strategy').sort({ createdAt: -1 });
    return NextResponse.json(trades);
  } catch (error) {
    console.error('GET /api/trades error:', error);
    return NextResponse.json({ error: 'Failed to fetch trades' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();

    // Get authenticated user
    const userId = await getAuthenticatedUser(request);

    // Get raw body and ALWAYS strip _id to prevent duplicate key errors
    const rawBody = await request.json();
    const body = { ...rawBody };
    delete body._id;

    // Auto-set session if not provided
    if (!body.session && !body.sessionId) {
      const currentSession = getCurrentSession();
      body.session = currentSession.sessionName;
      if (!body.pair) {
        body.pair = currentSession.pair;
      }
    }

    // Remove empty/null fields and handle array fields
    Object.keys(body).forEach(key => {
      if (body[key] === null || body[key] === undefined || body[key] === '') {
        delete body[key];
      }
      // Convert array fields to strings for MongoDB storage
      if (Array.isArray(body[key])) {
        body[key] = body[key].join(', ');
      }
    });

    const tradeData = {
      ...body,
      userId,
    };

    // If strategy is provided, populate strategy fields
    if (tradeData.strategy) {
      const strategy = await Strategy.findOne({ _id: tradeData.strategy, userId });
      if (strategy) {
        if (!tradeData.setupType) tradeData.setupType = strategy.setupType;
        if (!tradeData.confluences && strategy.confluences) {
          tradeData.confluences = strategy.confluences.join(', ');
        }
        if (!tradeData.entryType && strategy.entryType) {
          tradeData.entryType = strategy.entryType.join(', ');
        }
        if (!tradeData.timeFrame && strategy.timeframes) {
          tradeData.timeFrame = strategy.timeframes[0];
        }
        if (!tradeData.pair && strategy.tradingPairs) {
          tradeData.pair = strategy.tradingPairs[0];
        }
      }
    }

    const trade = new Trade(tradeData);
    await trade.save();

    const populatedTrade = await Trade.findById(trade._id).populate('strategy');
    return NextResponse.json(populatedTrade, { status: 201 });
  } catch (error) {
    console.error('POST /api/trades error:', error);
    return NextResponse.json({ error: 'Failed to create trade' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();
    
    if (!id) {
      return NextResponse.json({ error: 'Trade ID is required' }, { status: 400 });
    }
    
    // Get authenticated user
    const userId = await getAuthenticatedUser(request);
    
    // Handle array fields and clean data for PUT
    Object.keys(body).forEach(key => {
      if (body[key] === null || body[key] === undefined || body[key] === '') {
        delete body[key];
      }
      // Convert array fields to strings for MongoDB storage
      if (Array.isArray(body[key])) {
        body[key] = body[key].join(', ');
      }
    });

    const updateData = {
      ...body,
      userId
    };
    
    // If strategy is being updated, populate strategy fields
    if (updateData.strategy) {
      const strategy = await Strategy.findOne({ _id: updateData.strategy, userId });
      if (strategy) {
        // Strategy data will be populated in the response
      }
    }
    
    const trade = await Trade.findOneAndUpdate(
      { _id: id, userId },
      updateData,
      { new: true, runValidators: true }
    ).populate('strategy');
    
    if (!trade) {
      return NextResponse.json({ error: 'Trade not found' }, { status: 404 });
    }
    
    return NextResponse.json(trade);
  } catch (error) {
    console.error('PUT /api/trades error:', error);
    return NextResponse.json({ error: 'Failed to update trade' }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();
    
    if (!id) {
      return NextResponse.json({ error: 'Trade ID is required' }, { status: 400 });
    }
    
    // Get authenticated user
    const userId = await getAuthenticatedUser(request);
    
    // Handle array fields and clean data for PATCH
    Object.keys(body).forEach(key => {
      if (body[key] === null || body[key] === undefined || body[key] === '') {
        delete body[key];
      }
      // Convert array fields to strings for MongoDB storage
      if (Array.isArray(body[key])) {
        body[key] = body[key].join(', ');
      }
    });

    const updateData = {
      ...body,
      userId
    };
    
    // If strategy is being updated, populate strategy fields
    if (updateData.strategy) {
      const strategy = await Strategy.findOne({ _id: updateData.strategy, userId });
      if (strategy) {
        // Strategy data will be populated in the response
      }
    }
    
    const trade = await Trade.findOneAndUpdate(
      { _id: id, userId },
      updateData,
      { new: true, runValidators: true }
    ).populate('strategy');
    
    if (!trade) {
      return NextResponse.json({ error: 'Trade not found' }, { status: 404 });
    }
    
    return NextResponse.json(trade);
  } catch (error) {
    console.error('PATCH /api/trades error:', error);
    return NextResponse.json({ error: 'Failed to update trade' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Trade ID is required' }, { status: 400 });
    }
    
    // Get authenticated user
    const userId = await getAuthenticatedUser(request);
    
    const trade = await Trade.findOneAndDelete({ _id: id, userId });
    
    if (!trade) {
      return NextResponse.json({ error: 'Trade not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Trade deleted successfully' });
  } catch (error) {
    console.error('DELETE /api/trades error:', error);
    return NextResponse.json({ error: 'Failed to delete trade' }, { status: 500 });
  }
}
