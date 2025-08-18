import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Strategy from '@/models/Strategy';
import { auth } from '@clerk/nextjs/server';

// --- GET all strategies for the logged-in user ---
export async function GET() {
  try {
    await connectDB();
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const strategies = await Strategy.find({ userId }).sort({ createdAt: -1 });
    return NextResponse.json(strategies);
  } catch (err) {
    console.error('GET /api/strategies error:', err.message);
    return NextResponse.json({ message: 'Failed to fetch strategies' }, { status: 500 });
  }
}

// --- POST a new strategy ---
export async function POST(req) {
  try {
    await connectDB();
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await req.json();
    const { 
      strategyName, strategyType, strategyDescription,
      tradingPairs, timeframes, setupType, confluences, entryType,
      initialBalance, riskPerTrade 
    } = body;

    // --- Enhanced Validation ---
    if (!strategyName?.trim()) return NextResponse.json({ message: 'Strategy name is required' }, { status: 400 });
    if (typeof initialBalance !== 'number' || initialBalance <= 0) return NextResponse.json({ message: 'Initial balance must be a positive number' }, { status: 400 });
    if (typeof riskPerTrade !== 'number' || riskPerTrade <= 0) return NextResponse.json({ message: 'Risk per trade must be a positive number' }, { status: 400 });
    
    // Validate arrays
    if (!Array.isArray(tradingPairs) || tradingPairs.length === 0) {
      return NextResponse.json({ message: 'At least one trading pair is required' }, { status: 400 });
    }
    if (!Array.isArray(timeframes) || timeframes.length === 0) {
      return NextResponse.json({ message: 'At least one timeframe is required' }, { status: 400 });
    }

    const newStrategy = await Strategy.create({
      userId, strategyName, strategyType, strategyDescription,
      tradingPairs, timeframes, setupType, confluences, entryType,
      initialBalance, riskPerTrade,
    });
    
    // Return the newly created strategy with all fields populated
    return NextResponse.json(newStrategy, { status: 201 });
  } catch (err) {
    console.error('POST /api/strategies error:', err.message);
    if (err.name === 'ValidationError') {
      // Parse validation errors for better user feedback
      const validationErrors = Object.values(err.errors).map(error => error.message);
      return NextResponse.json({ 
        error: 'Validation Error', 
        message: validationErrors.join(', '),
        details: err.message 
      }, { status: 400 });
    }
    return NextResponse.json({ message: 'Failed to create strategy' }, { status: 500 });
  }
}

// --- PATCH (update) an existing strategy ---
export async function PATCH(req) {
  try {
    await connectDB();
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ message: 'Strategy ID is required' }, { status: 400 });
    }
    const body = await req.json();

    // Enhanced validation for update
    const updateData = {};
    
    // Only include fields that are provided and valid
    if (body.strategyName !== undefined) {
      if (!body.strategyName?.trim()) {
        return NextResponse.json({ message: 'Strategy name cannot be empty' }, { status: 400 });
      }
      updateData.strategyName = body.strategyName.trim();
    }
    
    if (body.strategyType !== undefined) updateData.strategyType = body.strategyType;
    if (body.strategyDescription !== undefined) updateData.strategyDescription = body.strategyDescription;
    
    if (body.tradingPairs !== undefined) {
      if (!Array.isArray(body.tradingPairs) || body.tradingPairs.length === 0) {
        return NextResponse.json({ message: 'At least one trading pair is required' }, { status: 400 });
      }
      updateData.tradingPairs = body.tradingPairs;
    }
    
    if (body.timeframes !== undefined) {
      if (!Array.isArray(body.timeframes) || body.timeframes.length === 0) {
        return NextResponse.json({ message: 'At least one timeframe is required' }, { status: 400 });
      }
      updateData.timeframes = body.timeframes;
    }
    
    if (body.setupType !== undefined) updateData.setupType = body.setupType;
    if (body.confluences !== undefined) updateData.confluences = Array.isArray(body.confluences) ? body.confluences : [];
    if (body.entryType !== undefined) updateData.entryType = Array.isArray(body.entryType) ? body.entryType : [];
    
    if (body.initialBalance !== undefined) {
      if (typeof body.initialBalance !== 'number' || body.initialBalance <= 0) {
        return NextResponse.json({ message: 'Initial balance must be a positive number' }, { status: 400 });
      }
      updateData.initialBalance = body.initialBalance;
    }
    
    if (body.riskPerTrade !== undefined) {
      if (typeof body.riskPerTrade !== 'number' || body.riskPerTrade <= 0) {
        return NextResponse.json({ message: 'Risk per trade must be a positive number' }, { status: 400 });
      }
      updateData.riskPerTrade = body.riskPerTrade;
    }

    // Use MongoDB's $set operator for a safe and targeted update
    const updatedStrategy = await Strategy.findOneAndUpdate(
      { _id: id, userId },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedStrategy) {
      return NextResponse.json({ message: 'Strategy not found or unauthorized' }, { status: 404 });
    }
    
    return NextResponse.json(updatedStrategy);
  } catch (err) {
    console.error('PATCH /api/strategies error:', err.message);
    if (err.name === 'ValidationError') {
        const validationErrors = Object.values(err.errors).map(error => error.message);
        return NextResponse.json({ 
          message: 'Validation failed', 
          details: validationErrors.join(', ')
        }, { status: 400 });
    }
    if (err.name === 'CastError') {
        return NextResponse.json({ message: 'Invalid strategy ID format' }, { status: 400 });
    }
    return NextResponse.json({ message: 'Failed to update strategy' }, { status: 500 });
  }
}

// --- DELETE a strategy ---
export async function DELETE(req) {
  try {
    await connectDB();
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ message: 'Strategy ID is required' }, { status: 400 });
    }
    
    const deletedStrategy = await Strategy.findOneAndDelete({ _id: id, userId });
    if (!deletedStrategy) {
      return NextResponse.json({ message: 'Strategy not found or unauthorized' }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Strategy deleted successfully',
      deletedStrategy: {
        id: deletedStrategy._id,
        name: deletedStrategy.strategyName
      }
    });
  } catch (err) {
    console.error('DELETE /api/strategies error:', err.message);
    if (err.name === 'CastError') {
        return NextResponse.json({ message: 'Invalid strategy ID format' }, { status: 400 });
    }
    return NextResponse.json({ message: 'Failed to delete strategy' }, { status: 500 });
  }
}