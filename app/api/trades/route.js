import { connectDB } from "@/lib/db";
import Trade from "@/models/Trade";
import Session from "@/models/Session";
import { auth } from "@clerk/nextjs/server";
import { v4 as uuidv4 } from "uuid";
import { NextResponse } from "next/server";

// GET all trades for logged-in user
export async function GET() {
  try {
    await connectDB();
    const { userId } = await auth(); // ✅ Add await for auth()
    
    console.log('GET /api/trades - userId:', userId);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const trades = await Trade.find({ userId })
      .populate({
        path: "session",
        select: "sessionName pair balance description" // Only get needed fields
      })
      .sort({ createdAt: -1 });

    console.log('Found trades:', trades.length);
    
    // Transform the data to include session info in a more usable format
    const transformedTrades = trades.map(trade => ({
      ...trade.toObject(),
      sessionId: trade.session?._id || null,
      sessionName: trade.session?.sessionName || '',
      sessionPair: trade.session?.pair || '',
    }));

    return NextResponse.json(transformedTrades);
  } catch (error) {
    console.error("GET /api/trades error:", error.message, error.stack);
    return NextResponse.json({ 
      error: "Failed to fetch trades", 
      message: "Failed to fetch trades",
      details: error.message 
    }, { status: 500 });
  }
}

// POST one or many trades
export async function POST(request) {
  try {
    await connectDB();
    const { userId } = await auth(); // ✅ Add await for auth()
    
    console.log('POST /api/trades - userId:', userId);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('POST body:', body);

    if (!body || typeof body !== "object") {
      return NextResponse.json({ 
        error: "Invalid payload",
        message: "Invalid payload" 
      }, { status: 400 });
    }

    const trades = Array.isArray(body.trades) ? body.trades : [body];

    // Validate and format trades
    const formattedTrades = [];
    
    for (let trade of trades) {
      // Validate session if provided
      if (trade.sessionId) {
        const session = await Session.findOne({ 
          _id: trade.sessionId, 
          userId 
        });
        
        if (!session) {
          return NextResponse.json({ 
            error: "Invalid session",
            message: `Session not found: ${trade.sessionId}` 
          }, { status: 400 });
        }
      }

      const formattedTrade = {
        ...trade,
        userId,
        id: trade.id || uuidv4(),
        session: trade.sessionId || null, // Reference to Session document
        // Ensure numeric fields are properly converted
        entryPrice: Number(trade.entryPrice ?? 0),
        exitPrice: Number(trade.exitPrice ?? 0),
        pnl: Number(trade.pnl ?? 0),
        pipsLostCaught: Number(trade.pipsLostCaught ?? 0),
        riskPerTrade: Number(trade.riskPerTrade ?? 0),
        rFactor: Number(trade.rFactor ?? 0),
        fearToGreed: Number(trade.fearToGreed ?? 5),
        fomoRating: Number(trade.fomoRating ?? 5),
        executionRating: Number(trade.executionRating ?? 5),
      };

      formattedTrades.push(formattedTrade);
    }

    console.log('Formatted trades for save:', formattedTrades.length);

    const savedTrades = await Trade.insertMany(formattedTrades);
    
    // Populate session data for response
    const populatedTrades = await Trade.find({
      _id: { $in: savedTrades.map(t => t._id) }
    }).populate({
      path: "session",
      select: "sessionName pair balance description"
    });

    console.log('Trades saved successfully:', populatedTrades.length);

    return NextResponse.json({ 
      trades: populatedTrades,
      message: "Trades saved successfully"
    }, { status: 201 });
    
  } catch (err) {
    console.error("POST /api/trades error:", err.message, err.stack);
    return NextResponse.json({ 
      error: "Error saving trades",
      message: "Failed to save trades",
      details: err.message 
    }, { status: 500 });
  }
}

// PUT update a single trade
export async function PUT(request) {
  try {
    await connectDB();
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { pathname } = new URL(request.url);
    const tradeId = pathname.split('/').pop();
    
    if (!tradeId) {
      return NextResponse.json({ 
        error: "Trade ID is required",
        message: "Trade ID is required" 
      }, { status: 400 });
    }

    const body = await request.json();
    console.log('PUT trade:', tradeId, 'with data:', body);

    // Validate session if provided
    if (body.sessionId) {
      const session = await Session.findOne({ 
        _id: body.sessionId, 
        userId 
      });
      
      if (!session) {
        return NextResponse.json({ 
          error: "Invalid session",
          message: `Session not found: ${body.sessionId}` 
        }, { status: 400 });
      }
    }

    const updateData = {
      ...body,
      session: body.sessionId || null,
      // Ensure numeric fields are properly converted
      entryPrice: Number(body.entryPrice ?? 0),
      exitPrice: Number(body.exitPrice ?? 0),
      pnl: Number(body.pnl ?? 0),
      pipsLostCaught: Number(body.pipsLostCaught ?? 0),
      riskPerTrade: Number(body.riskPerTrade ?? 0),
      rFactor: Number(body.rFactor ?? 0),
      fearToGreed: Number(body.fearToGreed ?? 5),
      fomoRating: Number(body.fomoRating ?? 5),
      executionRating: Number(body.executionRating ?? 5),
    };

    const updatedTrade = await Trade.findOneAndUpdate(
      { _id: tradeId, userId },
      updateData,
      { new: true }
    ).populate({
      path: "session",
      select: "sessionName pair balance description"
    });

    if (!updatedTrade) {
      return NextResponse.json({ 
        error: "Trade not found",
        message: "Trade not found or unauthorized" 
      }, { status: 404 });
    }

    console.log('Trade updated successfully:', tradeId);
    return NextResponse.json(updatedTrade);
    
  } catch (err) {
    console.error("PUT /api/trades error:", err.message, err.stack);
    return NextResponse.json({ 
      error: "Error updating trade",
      message: "Failed to update trade",
      details: err.message 
    }, { status: 500 });
  }
}

// DELETE a single trade
export async function DELETE(request) {
  try {
    await connectDB();
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { pathname } = new URL(request.url);
    const tradeId = pathname.split('/').pop();
    
    if (!tradeId) {
      return NextResponse.json({ 
        error: "Trade ID is required",
        message: "Trade ID is required" 
      }, { status: 400 });
    }

    const deletedTrade = await Trade.findOneAndDelete({ 
      _id: tradeId, 
      userId 
    });

    if (!deletedTrade) {
      return NextResponse.json({ 
        error: "Trade not found",
        message: "Trade not found or unauthorized" 
      }, { status: 404 });
    }

    console.log('Trade deleted successfully:', tradeId);
    return NextResponse.json({ 
      success: true,
      message: "Trade deleted successfully" 
    });
    
  } catch (err) {
    console.error("DELETE /api/trades error:", err.message, err.stack);
    return NextResponse.json({ 
      error: "Error deleting trade",
      message: "Failed to delete trade",
      details: err.message 
    }, { status: 500 });
  }
}