import { connectDB } from "@/lib/db";
import Trade from "@/models/Trade";
import { auth } from "@clerk/nextjs/server";
import { v4 as uuidv4 } from "uuid";
import { NextResponse } from "next/server";

// GET all trades for logged-in user
export async function GET() {
  try {
    await connectDB();
    const { userId } = auth();

    const trades = await Trade.find({ userId })
      .populate("session") // Include session details
      .sort({ createdAt: -1 });

    return new Response(JSON.stringify(trades), { status: 200 });
  } catch (error) {
    console.error("GET /api/trades error:", error);
    return new Response(JSON.stringify({ message: "Failed to fetch trades" }), { status: 500 });
  }
}

// POST one or many trades
export async function POST(request) {
  try {
    await connectDB();
    const { userId } = auth();
    const body = await request.json();

    if (!body || typeof body !== "object") {
      return new Response(JSON.stringify({ message: "Invalid payload" }), { status: 400 });
    }

    const trades = Array.isArray(body.trades) ? body.trades : [body];

    const formattedTrades = trades.map((trade) => ({
      ...trade,
      userId,
      id: trade.id || uuidv4(),
      session: trade.sessionId, // Must be a valid Session _id
      positionType: trade.positionType,
      entry: Number(trade.entry ?? 0),
      exit: Number(trade.exit ?? 0),
      setupType: trade.setupType,
      confluences: trade.confluences,
      entryType: trade.entryType,
      timeFrame: trade.timeFrame,
      risk: Number(trade.risk ?? 0),
      rFactor: Number(trade.rFactor ?? 0),
      rulesFollowed: trade.rulesFollowed,
      pipsLost: Number(trade.pipsLost ?? 0),
      pipsGain: Number(trade.pipsGain ?? 0),
      pnl: Number(trade.pnl ?? 0),
      image: trade.image,
      notes: trade.notes,
    }));

    const savedTrades = await Trade.insertMany(formattedTrades);
    return new Response(JSON.stringify({ trades: savedTrades }), { status: 201 });
  } catch (err) {
    console.error("POST /api/trades error:", err);
    return new Response(JSON.stringify({ message: "Error saving trades" }), { status: 500 });
  }
}