import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Strategy from '@/models/Strategy';
import Trade from '@/models/Trade';

const DEFAULT_USER_ID = 'default-user';

export async function GET(request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (id) {
      const strategy = await Strategy.findById(id);
      if (!strategy) {
        return NextResponse.json({ error: 'Strategy not found' }, { status: 404 });
      }
      return NextResponse.json(strategy);
    }
    
    const strategies = await Strategy.find({ userId: DEFAULT_USER_ID }).sort({ createdAt: -1 });
    return NextResponse.json(strategies);
  } catch (error) {
    console.error('GET /api/strategies error:', error);
    return NextResponse.json({ error: 'Failed to fetch strategies' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const strategyData = {
      ...body,
      userId: DEFAULT_USER_ID
    };
    
    const strategy = new Strategy(strategyData);
    await strategy.save();
    
    return NextResponse.json(strategy, { status: 201 });
  } catch (error) {
    console.error('POST /api/strategies error:', error);
    return NextResponse.json({ error: 'Failed to create strategy' }, { status: 500 });
  }
}

// Helper function to update related trades when strategy changes
async function updateRelatedTrades(strategyId, updatedStrategy) {
  try {
    // Find all trades that use this strategy
    const relatedTrades = await Trade.find({ 
      strategy: strategyId,
      userId: DEFAULT_USER_ID 
    });

    if (relatedTrades.length === 0) {
      return;
    }

    // Prepare update object for trades
    const tradeUpdates = {};
    
    // Update strategy-related fields in trades
    if (updatedStrategy.setupType) {
      tradeUpdates.setupType = updatedStrategy.setupType;
    }
    
    if (updatedStrategy.confluences && updatedStrategy.confluences.length > 0) {
      tradeUpdates.confluences = Array.isArray(updatedStrategy.confluences) 
        ? updatedStrategy.confluences.join(', ')
        : updatedStrategy.confluences;
    }
    
    if (updatedStrategy.entryType && updatedStrategy.entryType.length > 0) {
      tradeUpdates.entryType = Array.isArray(updatedStrategy.entryType)
        ? updatedStrategy.entryType.join(', ')
        : updatedStrategy.entryType;
    }
    
    if (updatedStrategy.timeframes && updatedStrategy.timeframes.length > 0) {
      tradeUpdates.timeFrame = Array.isArray(updatedStrategy.timeframes)
        ? updatedStrategy.timeframes[0]
        : updatedStrategy.timeframes;
    }
    
    if (updatedStrategy.tradingPairs && updatedStrategy.tradingPairs.length > 0) {
      // Only update pair if the trade doesn't have a custom pair set
      // You might want to always update or make this configurable
      const tradesWithoutCustomPairs = relatedTrades.filter(trade => 
        !trade.pair || 
        (updatedStrategy.tradingPairs && updatedStrategy.tradingPairs.includes(trade.pair))
      );
      
      if (tradesWithoutCustomPairs.length > 0) {
        tradeUpdates.pair = Array.isArray(updatedStrategy.tradingPairs)
          ? updatedStrategy.tradingPairs[0]
          : updatedStrategy.tradingPairs;
      }
    }

    // Update all related trades if there are updates to apply
    if (Object.keys(tradeUpdates).length > 0) {
      await Trade.updateMany(
        { 
          strategy: strategyId,
          userId: DEFAULT_USER_ID 
        },
        { $set: tradeUpdates }
      );
      
      console.log(`Updated ${relatedTrades.length} trades with strategy changes for strategy ${strategyId}`);
    }
  } catch (error) {
    console.error('Error updating related trades:', error);
    // Don't throw error here to avoid breaking strategy update
  }
}

export async function PUT(request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();
    
    if (!id) {
      return NextResponse.json({ error: 'Strategy ID is required' }, { status: 400 });
    }
    
    const strategy = await Strategy.findByIdAndUpdate(
      id,
      { ...body, userId: DEFAULT_USER_ID },
      { new: true, runValidators: true }
    );
    
    if (!strategy) {
      return NextResponse.json({ error: 'Strategy not found' }, { status: 404 });
    }
    
    // Update related trades with new strategy data
    await updateRelatedTrades(id, strategy);
    
    return NextResponse.json(strategy);
  } catch (error) {
    console.error('PUT /api/strategies error:', error);
    return NextResponse.json({ error: 'Failed to update strategy' }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();
    
    if (!id) {
      return NextResponse.json({ error: 'Strategy ID is required' }, { status: 400 });
    }
    
    const strategy = await Strategy.findByIdAndUpdate(
      id,
      { ...body, userId: DEFAULT_USER_ID },
      { new: true, runValidators: true }
    );
    
    if (!strategy) {
      return NextResponse.json({ error: 'Strategy not found' }, { status: 404 });
    }
    
    // Update related trades with new strategy data
    await updateRelatedTrades(id, strategy);
    
    return NextResponse.json(strategy);
  } catch (error) {
    console.error('PATCH /api/strategies error:', error);
    return NextResponse.json({ error: 'Failed to update strategy' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Strategy ID is required' }, { status: 400 });
    }

    // First, check if the strategy exists
    const strategy = await Strategy.findById(id);
    
    if (!strategy) {
      return NextResponse.json({ error: 'Strategy not found' }, { status: 404 });
    }

    // Find all trades that use this strategy before deleting
    const relatedTrades = await Trade.find({ 
      strategy: id,
      userId: DEFAULT_USER_ID 
    });

    // Delete all related trades first
    const deletedTradesResult = await Trade.deleteMany({ 
      strategy: id,
      userId: DEFAULT_USER_ID 
    });

    // Then delete the strategy
    await Strategy.findByIdAndDelete(id);

    console.log(`Deleted strategy ${id} and ${deletedTradesResult.deletedCount} related trades`);
    
    return NextResponse.json({ 
      message: 'Strategy deleted successfully',
      deletedTrades: deletedTradesResult.deletedCount,
      strategyName: strategy.strategyName
    });
  } catch (error) {
    console.error('DELETE /api/strategies error:', error);
    return NextResponse.json({ error: 'Failed to delete strategy' }, { status: 500 });
  }
}