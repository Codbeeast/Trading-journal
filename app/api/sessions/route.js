import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Session from '@/models/Session';
import Trade from '@/models/Trade';
import { auth } from '@clerk/nextjs/server';
import { nanoid } from 'nanoid';

export async function GET(req) {
  try {
    await connectDB();
    const { userId } = auth(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const sessions = await Session.find({ userId }).sort({ createdAt: -1 });
    return NextResponse.json(sessions);
  } catch (err) {
    console.error('GET /api/sessions error:', err);
    return NextResponse.json({ error: 'Server error', details: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const { userId } = auth(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { sessionName, balance, pair, description } = body;

    if (!sessionName || !balance || !pair) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newSession = await Session.create({
      userId,
      sessionName,
      balance,
      pair,
      description,
    });

    // Create initial trade entry
    await Trade.create({
      userId,
      session: newSession._id,
      tradeId: nanoid(),
      balance,
      pair,
      type: 'initial',
      description: 'Initial balance setup',
    });

    return NextResponse.json(newSession);
  } catch (err) {
    console.error('POST /api/sessions error:', err);
    return NextResponse.json({ error: 'Server error', details: err.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    await connectDB();
    const { userId } = auth(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing session ID' }, { status: 400 });

    const body = await req.json();
    const updated = await Session.findOneAndUpdate(
      { _id: id, userId },
      body,
      { new: true }
    );

    if (!updated) return NextResponse.json({ error: 'Session not found' }, { status: 404 });

    return NextResponse.json(updated);
  } catch (err) {
    console.error('PATCH /api/sessions error:', err);
    return NextResponse.json({ error: 'Server error', details: err.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    await connectDB();
    const { userId } = auth(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing session ID' }, { status: 400 });

    const deleted = await Session.findOneAndDelete({ _id: id, userId });
    if (!deleted) return NextResponse.json({ error: 'Session not found' }, { status: 404 });

    // Optionally delete related trades
    await Trade.deleteMany({ sessionId: id });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/sessions error:', err);
    return NextResponse.json({ error: 'Server error', details: err.message }, { status: 500 });
  }
}