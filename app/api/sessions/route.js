import { NextResponse } from 'next/server';
import { connectDB } from "@/lib/db";
import Session from '@/models/Session';
import Trade from '@/models/Trade';
import { auth } from '@clerk/nextjs/server';
import { nanoid } from 'nanoid';

export async function GET() {
  await connectDB();
  const { userId } = auth();
  const sessions = await Session.find({ userId }).sort({ createdAt: -1 });
  return NextResponse.json(sessions);
}

export async function POST(req) {
  await connectDB();
  const { userId } = auth();
  const body = await req.json();

  try {
    // Create session
    const newSession = await Session.create({ ...body, userId });

    // Auto-create trade with session reference
    const tradeData = {
      userId,
      id: nanoid(), // Unique trade ID
      session: newSession._id,
      pair: newSession.pair,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toISOString().split('T')[1].slice(0, 5),
      notes: `Auto-generated trade for session "${newSession.sessionName}"`,
    };

    await Trade.create(tradeData);

    return NextResponse.json(newSession, { status: 201 });
  } catch (err) {
    console.error('Session POST error:', err);
    return NextResponse.json({ error: 'Failed to create session and trade' }, { status: 500 });
  }
}