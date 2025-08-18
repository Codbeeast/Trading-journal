import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Trade from '@/models/Trade';
import Strategy from '@/models/Strategy';

const DEFAULT_USER_ID = 'default-user';

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
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const strategyId = searchParams.get('strategyId');
    
    if (id) {
      const trade = await Trade.findById(id).populate('strategy');
      if (!trade) {
        return NextResponse.json({ error: 'Trade not found' }, { status: 404 });
      }
      return NextResponse.json(trade);
    }
    
    let query = { userId: DEFAULT_USER_ID };
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
    await dbConnect();

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
      userId: DEFAULT_USER_ID,
    };

    // If strategy is provided, populate strategy fields
    if (tradeData.strategy) {
      const strategy = await Strategy.findById(tradeData.strategy);
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
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();
    
    if (!id) {
      return NextResponse.json({ error: 'Trade ID is required' }, { status: 400 });
    }
    
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
      userId: DEFAULT_USER_ID
    };
    
    // If strategy is being updated, populate strategy fields
    if (updateData.strategy) {
      const strategy = await Strategy.findById(updateData.strategy);
      if (strategy) {
        // Strategy data will be populated in the response
      }
    }
    
    const trade = await Trade.findByIdAndUpdate(
      id,
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
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();
    
    if (!id) {
      return NextResponse.json({ error: 'Trade ID is required' }, { status: 400 });
    }
    
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
      userId: DEFAULT_USER_ID
    };
    
    // If strategy is being updated, populate strategy fields
    if (updateData.strategy) {
      const strategy = await Strategy.findById(updateData.strategy);
      if (strategy) {
        // Strategy data will be populated in the response
      }
    }
    
    const trade = await Trade.findByIdAndUpdate(
      id,
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
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Trade ID is required' }, { status: 400 });
    }
    
    const trade = await Trade.findByIdAndDelete(id);
    
    if (!trade) {
      return NextResponse.json({ error: 'Trade not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Trade deleted successfully' });
  } catch (error) {
    console.error('DELETE /api/trades error:', error);
    return NextResponse.json({ error: 'Failed to delete trade' }, { status: 500 });
  }
}
