import { NextResponse } from 'next/server';
import {connectDB} from '@/lib/db';
import Trade from '@/models/Trade';
import Strategy from '@/models/Strategy';

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
<<<<<<< HEAD
  console.log('GET /api/trades called');
  
  try {
    await connectDB();
    console.log('Database connected');
=======
  console.log('🔍 GET /api/trades called');
  
  try {
    await connectDB();
    console.log('✅ Database connected');
>>>>>>> 872783775954250fb4507e913143326e5a2232e0
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const strategyId = searchParams.get('strategyId');
    
<<<<<<< HEAD
    console.log('Query params:', { id, strategyId });
=======
    console.log('📋 Query params:', { id, strategyId });
>>>>>>> 872783775954250fb4507e913143326e5a2232e0
    
    // Get authenticated user
    const userId = await getAuthenticatedUser(request);
    console.log('👤 Using userId:', userId);
    
    if (id) {
<<<<<<< HEAD
      console.log('Fetching single trade:', id);
      const trade = await Trade.findOne({ _id: id, userId }).populate('strategy');
      if (!trade) {
        console.log('Trade not found');
        return NextResponse.json({ error: 'Trade not found' }, { status: 404 });
      }
      console.log('Trade found');
=======
      console.log('🔍 Fetching single trade:', id);
      const trade = await Trade.findOne({ _id: id, userId }).populate('strategy');
      if (!trade) {
        console.log('❌ Trade not found');
        return NextResponse.json({ error: 'Trade not found' }, { status: 404 });
      }
      console.log('✅ Trade found');
>>>>>>> 872783775954250fb4507e913143326e5a2232e0
      return NextResponse.json(trade);
    }
    
    let query = { userId };
    if (strategyId) {
      query.strategy = strategyId;
    }
    
<<<<<<< HEAD
    console.log('Fetching trades with query:', query);
    const trades = await Trade.find(query).populate('strategy').sort({ createdAt: -1 });
    console.log(`Found ${trades.length} trades`);
=======
    console.log('🔍 Fetching trades with query:', query);
    const trades = await Trade.find(query).populate('strategy').sort({ createdAt: -1 });
    console.log(`✅ Found ${trades.length} trades`);
>>>>>>> 872783775954250fb4507e913143326e5a2232e0
    
    return NextResponse.json(trades);
  } catch (error) {
    console.error('❌ GET /api/trades error:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json({ 
      error: 'Failed to fetch trades',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}

export async function POST(request) {
<<<<<<< HEAD
  console.log('POST /api/trades called');
  
  try {
    await connectDB();
    console.log(' Database connected');

    // Get authenticated user
    const userId = await getAuthenticatedUser(request);
    console.log('Using userId:', userId);

    // Get raw body and ALWAYS strip _id to prevent duplicate key errors
    const rawBody = await request.json();
    console.log('Raw body received:', Object.keys(rawBody));
=======
  console.log('📝 POST /api/trades called');
  
  try {
    await connectDB();
    console.log('✅ Database connected');

    // Get authenticated user
    const userId = await getAuthenticatedUser(request);
    console.log('👤 Using userId:', userId);

    // Get raw body and ALWAYS strip _id to prevent duplicate key errors
    const rawBody = await request.json();
    console.log('📄 Raw body received:', Object.keys(rawBody));
>>>>>>> 872783775954250fb4507e913143326e5a2232e0
    
    const body = { ...rawBody };
    delete body._id;

    // Auto-set session if not provided
    if (!body.session && !body.sessionId) {
      const currentSession = getCurrentSession();
      body.session = currentSession.sessionName;
      if (!body.pair) {
        body.pair = currentSession.pair;
      }
      console.log('🕐 Auto-set session:', currentSession);
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

    console.log('💾 Final trade data keys:', Object.keys(tradeData));

    // If strategy is provided, populate strategy fields
    if (tradeData.strategy) {
      console.log('🎯 Looking up strategy:', tradeData.strategy);
      const strategy = await Strategy.findOne({ _id: tradeData.strategy, userId });
      if (strategy) {
        console.log('✅ Strategy found, populating fields');
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
      } else {
        console.log('⚠️ Strategy not found or access denied');
      }
    }

    const trade = new Trade(tradeData);
    await trade.save();
    console.log('✅ Trade saved with ID:', trade._id);

    const populatedTrade = await Trade.findById(trade._id).populate('strategy');
    console.log('✅ Trade populated and ready to return');
    
    return NextResponse.json(populatedTrade, { status: 201 });
  } catch (error) {
    console.error('❌ POST /api/trades error:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json({ 
      error: 'Failed to create trade',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}

export async function PUT(request) {
  console.log('✏️ PUT /api/trades called');
  
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();
    
    if (!id) {
      return NextResponse.json({ error: 'Trade ID is required' }, { status: 400 });
    }
    
    console.log('📝 Updating trade:', id);
    
    // Get authenticated user
    const userId = await getAuthenticatedUser(request);
    console.log('👤 Using userId:', userId);
    
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
        console.log('✅ Strategy found for update');
      }
    }
    
    const trade = await Trade.findOneAndUpdate(
      { _id: id, userId },
      updateData,
      { new: true, runValidators: true }
    ).populate('strategy');
    
    if (!trade) {
      console.log('❌ Trade not found for update');
      return NextResponse.json({ error: 'Trade not found' }, { status: 404 });
    }
    
    console.log('✅ Trade updated successfully');
    return NextResponse.json(trade);
  } catch (error) {
    console.error('❌ PUT /api/trades error:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json({ 
      error: 'Failed to update trade',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}

export async function PATCH(request) {
  console.log('🔧 PATCH /api/trades called');
  
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
    console.log('👤 Using userId:', userId);
    
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
        console.log('✅ Strategy found for patch');
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
    
    console.log('✅ Trade patched successfully');
    return NextResponse.json(trade);
  } catch (error) {
    console.error('❌ PATCH /api/trades error:', error);
    return NextResponse.json({ 
      error: 'Failed to update trade',
      details: error.message 
    }, { status: 500 });
  }
}

export async function DELETE(request) {
  console.log('🗑️ DELETE /api/trades called');
  
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Trade ID is required' }, { status: 400 });
    }
    
    // Get authenticated user
    const userId = await getAuthenticatedUser(request);
    console.log('👤 Using userId:', userId);
    
    const trade = await Trade.findOneAndDelete({ _id: id, userId });
    
    if (!trade) {
      return NextResponse.json({ error: 'Trade not found' }, { status: 404 });
    }
    
    console.log('✅ Trade deleted successfully');
    return NextResponse.json({ message: 'Trade deleted successfully' });
  } catch (error) {
    console.error('❌ DELETE /api/trades error:', error);
    return NextResponse.json({ 
      error: 'Failed to delete trade',
      details: error.message 
    }, { status: 500 });
  }
}