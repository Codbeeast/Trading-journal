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

    // --- Validation ---
    if (!strategyName?.trim()) return NextResponse.json({ message: 'Strategy name is required' }, { status: 400 });
    if (typeof initialBalance !== 'number' || initialBalance <= 0) return NextResponse.json({ message: 'Initial balance must be a positive number' }, { status: 400 });
    if (typeof riskPerTrade !== 'number' || riskPerTrade <= 0) return NextResponse.json({ message: 'Risk per trade must be a positive number' }, { status: 400 });

    const newStrategy = await Strategy.create({
      userId, strategyName, strategyType, strategyDescription,
      tradingPairs, timeframes, setupType, confluences, entryType,
      initialBalance, riskPerTrade,
    });
    return NextResponse.json(newStrategy, { status: 201 });
  } catch (err) {
    console.error('POST /api/strategies error:', err.message);
    if (err.name === 'ValidationError') return NextResponse.json({ error: 'Validation Error', details: err.message }, { status: 400 });
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

    // ✅ FIX: Use MongoDB's $set operator for a safe and targeted update.
    // This ensures only the fields provided in the body are changed,
    // preventing other data from being accidentally erased.
    const updatedStrategy = await Strategy.findOneAndUpdate(
      { _id: id, userId },
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!updatedStrategy) {
      return NextResponse.json({ message: 'Strategy not found or unauthorized' }, { status: 404 });
    }
    return NextResponse.json(updatedStrategy);
  } catch (err) {
    console.error('PATCH /api/strategies error:', err.message);
    if (err.name === 'ValidationError') {
        return NextResponse.json({ message: 'Validation failed. Please check your inputs.' }, { status: 400 });
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
    return NextResponse.json({ success: true, message: 'Strategy deleted successfully' });
  } catch (err) {
    console.error('DELETE /api/strategies error:', err.message);
    return NextResponse.json({ message: 'Failed to delete strategy' }, { status: 500 });
  }
}
