import { connectDB } from '@/lib/db';
import Trade from '@/models/Trade';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  await connectDB();
  const { userId } = auth();
  const trades = await Trade.find({ userId }).populate('session').sort({ createdAt: -1 });
  return new Response(JSON.stringify(trades), { status: 200 });
}

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { userId } = auth();
    const updates = await req.json();
    const { id } = params;

    if (!id) {
      return new Response(JSON.stringify({ message: 'Missing ID' }), { status: 400 });
    }

    delete updates._id;
    delete updates.__v;

    const updatedTrade = await Trade.findOneAndUpdate(
      { id, userId },
      updates,
      { new: true }
    );

    if (!updatedTrade) {
      return new Response(JSON.stringify({ message: 'Trade not found' }), { status: 404 });
    }

    return new Response(JSON.stringify(updatedTrade), { status: 200 });
  } catch (err) {
    console.error('PUT error:', err);
    return new Response(JSON.stringify({ message: 'Error updating trade' }), { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { userId } = auth();
    const { id } = params;

    if (!id) {
      return new Response(JSON.stringify({ message: 'Missing ID' }), { status: 400 });
    }

    const deleted = await Trade.findOneAndDelete({ id, userId });

    if (!deleted) {
      return new Response(JSON.stringify({ message: 'Trade not found' }), { status: 404 });
    }

    return new Response(JSON.stringify({ message: 'Trade deleted' }), { status: 200 });
  } catch (err) {
    console.error('DELETE error:', err);
    return new Response(JSON.stringify({ message: 'Error deleting trade' }), { status: 500 });
  }
}