// app/api/trades/route.js
import { connectDB } from "@/lib/db";
import Trade from "@/models/Trade";
import { v4 as uuidv4 } from "uuid";
import { NextResponse } from 'next/server';

// GET all trades
export async function GET() {
  try {
    await connectDB();
    const trades = await Trade.find({}).sort({ createdAt: -1 });
    return new Response(JSON.stringify(trades), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: "Failed to fetch trades" }), { status: 500 });
  }
}
// POST all trades
export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();

    if (!body || typeof body !== 'object') {
      return new Response(JSON.stringify({ message: "Invalid payload" }), { status: 400 });
    }

    const trades = Array.isArray(body.trades) ? body.trades : [body];

    const formattedTrades = trades.map(trade => ({
      ...trade,
      id: trade.id || uuidv4(),
      entryPrice: Number(trade.entryPrice ?? 0),
      exitPrice: Number(trade.exitPrice ?? 0),
      pnl: Number(trade.pnl ?? 0),
      pipsLostCaught: Number(trade.pipsLostCaught ?? 0),
      riskPerTrade: Number(trade.riskPerTrade ?? 0),
      rFactor: Number(trade.rFactor ?? 0),
      fearToGreed: Number(trade.fearToGreed ?? 5),
      fomoRating: Number(trade.fomoRating ?? 5),
      executionRating: Number(trade.executionRating ?? 5),
    }));

    const savedTrades = await Trade.insertMany(formattedTrades);
    return new Response(JSON.stringify({ trades: savedTrades }), { status: 201 });
  } catch (err) {
    console.error("POST /api/trades error:", err);
    return new Response(JSON.stringify({ message: "Error saving trades" }), { status: 500 });
  }
}

// PUT /api/trades/:id → update one trade// /api/trades/route.js or route.ts
export async function PUT(req) {
  try {
    const updates = await req.json();
    const id = updates.id;

    if (!id) {
      return new Response(JSON.stringify({ message: "Missing ID" }), { status: 400 });
    }

    // ❌ DO NOT include _id or __v in the update object
    delete updates._id;
    delete updates.__v;

    const updatedTrade = await Trade.findOneAndUpdate(
      { id },
      updates,
      { new: true }
    );

    if (!updatedTrade) {
      return new Response(JSON.stringify({ message: "Trade not found" }), { status: 404 });
    }

    return new Response(JSON.stringify(updatedTrade), { status: 200 });
  } catch (err) {
    console.error("PUT error:", err);
    return new Response(JSON.stringify({ message: "Error updating trade" }), { status: 500 });
  }
}



// DELETE /api/trades/:id → delete one trade
export async function DELETE(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return new Response(JSON.stringify({ message: "Missing ID" }), { status: 400 });
    }

    const deleted = await Trade.findOneAndDelete({ id });

    if (!deleted) {
      return new Response(JSON.stringify({ message: "Trade not found" }), { status: 404 });
    }

    return new Response(JSON.stringify({ message: "Trade deleted" }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ message: "Error deleting trade" }), { status: 500 });
  }
}
