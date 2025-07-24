import { NextResponse } from 'next/server';
import { connectDB } from "@/lib/db";
import Session from '@/models/Session';

export async function GET() {
  await connectDB();
  const sessions = await Session.find().sort({ createdAt: -1 });
  return NextResponse.json(sessions);
}

export async function POST(req) {
  await connectDB();
  const body = await req.json();
  try {
    const newSession = await Session.create(body);
    return NextResponse.json(newSession, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }
}
