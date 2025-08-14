import { connectDB } from "@/lib/db";
import Session from "@/models/Session";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// GET all sessions for logged-in user
export async function GET() {
  try {
    await connectDB();
    const { userId } = auth();

    if (!userId) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
    }

    const sessions = await Session.find({ userId })
      .populate("strategies")
      .sort({ createdAt: -1 });

    return new Response(JSON.stringify(sessions), { status: 200 });
  } catch (error) {
    console.error("GET /api/sessions error:", error);
    return new Response(JSON.stringify({ message: "Failed to fetch sessions" }), { status: 500 });
  }
}

// POST create a new session
export async function POST(request) {
  try {
    await connectDB();
    const { userId } = auth();
    const body = await request.json();

    if (!userId) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
    }

    if (!body.sessionName || !body.pair) {
      return new Response(JSON.stringify({ message: "Session name and pair are required" }), { status: 400 });
    }

    const session = new Session({
      ...body,
      userId,
    });

    const savedSession = await session.save();
    return new Response(JSON.stringify(savedSession), { status: 201 });
  } catch (err) {
    console.error("POST /api/sessions error:", err);
    return new Response(JSON.stringify({ message: "Error creating session" }), { status: 500 });
  }
}
