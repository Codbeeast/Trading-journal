import { NextResponse } from 'next/server';
import {connectDB} from '@/lib/db';
import Trade from '@/models/Trade';

const DEFAULT_USER_ID = 'default-user';

export async function GET(request, { params }) {
  try {
    await connectDB();
    
    const { strategyId } = await params;
    
    if (!strategyId) {
      return NextResponse.json({ error: 'Strategy ID is required' }, { status: 400 });
    }
    
    const trades = await Trade.find({ 
      userId: DEFAULT_USER_ID,
      strategy: strategyId 
    }).populate('strategy').sort({ createdAt: -1 });
    
    return NextResponse.json(trades);
  } catch (error) {
    console.error('GET /api/trades/by-strategy/[strategyId] error:', error);
    return NextResponse.json({ error: 'Failed to fetch trades by strategy' }, { status: 500 });
  }
}
