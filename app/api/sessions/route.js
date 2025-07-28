import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Session from '@/models/Session';
import Trade from '@/models/Trade';
import { auth } from '@clerk/nextjs/server'; // ✅ Correct import for App Router
import { nanoid } from 'nanoid';

export async function GET() {
  try {
    await connectDB();
    const { userId } = await auth(); // ✅ Add await for auth()
    
    console.log('GET /api/sessions - userId:', userId); // Debug log
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sessions = await Session.find({ userId }).sort({ createdAt: -1 });
    console.log('Found sessions:', sessions.length); // Debug log
    
    return NextResponse.json(sessions);
  } catch (err) {
    console.error('GET /api/sessions error:', err.message, err.stack);
    return NextResponse.json({ 
      error: 'Server error', 
      details: err.message,
      message: 'Failed to fetch sessions'
    }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const { userId } = await auth(); // ✅ Add await for auth()
    
    console.log('POST /api/sessions - userId:', userId); // Debug log
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { sessionName, balance, pair, description } = body;

    console.log('POST body:', body); // Debug input

    // Validation
    if (!sessionName?.trim()) {
      return NextResponse.json({ 
        error: 'Session name is required',
        message: 'Session name is required'
      }, { status: 400 });
    }
    
    if (!pair?.trim()) {
      return NextResponse.json({ 
        error: 'Pair is required',
        message: 'Pair is required'
      }, { status: 400 });
    }
    
    if (typeof balance !== 'number' || balance <= 0) {
      return NextResponse.json({ 
        error: 'Balance must be a positive number',
        message: 'Balance must be a positive number'
      }, { status: 400 });
    }

    const newSession = await Session.create({
      userId,
      sessionName,
      balance,
      pair,
      description,
    });

    // Create initial trade record
    await Trade.create({
      userId,
      session: newSession._id,
      tradeId: nanoid(),
      balance,
      pair,
      type: 'initial',
      description: 'Initial balance setup',
    });

    console.log('Created session:', newSession._id); // Debug log
    return NextResponse.json(newSession);
    
  } catch (err) {
    console.error('POST /api/sessions error:', err.message, err.stack);
    return NextResponse.json({ 
      error: 'Server error', 
      details: err.message,
      message: 'Failed to create session'
    }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    await connectDB();
    const { userId } = await auth(); // ✅ Add await for auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ 
        error: 'Missing session ID',
        message: 'Session ID is required'
      }, { status: 400 });
    }

    const body = await req.json();
    console.log('PATCH body:', body, 'for session:', id); // Debug log

    const updated = await Session.findOneAndUpdate(
      { _id: id, userId },
      body,
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ 
        error: 'Session not found',
        message: 'Session not found or unauthorized'
      }, { status: 404 });
    }

    return NextResponse.json(updated);
    
  } catch (err) {
    console.error('PATCH /api/sessions error:', err.message, err.stack);
    return NextResponse.json({ 
      error: 'Server error', 
      details: err.message,
      message: 'Failed to update session'
    }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    await connectDB();
    const { userId } = await auth(); // ✅ Add await for auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ 
        error: 'Missing session ID',
        message: 'Session ID is required'
      }, { status: 400 });
    }

    const deleted = await Session.findOneAndDelete({ _id: id, userId });
    
    if (!deleted) {
      return NextResponse.json({ 
        error: 'Session not found',
        message: 'Session not found or unauthorized'
      }, { status: 404 });
    }

    // Delete related trades
    await Trade.deleteMany({ session: id });
    console.log('Deleted session:', id); // Debug log

    return NextResponse.json({ success: true, message: 'Session deleted successfully' });
    
  } catch (err) {
    console.error('DELETE /api/sessions error:', err.message, err.stack);
    return NextResponse.json({ 
      error: 'Server error', 
      details: err.message,
      message: 'Failed to delete session'
    }, { status: 500 });
  }
}