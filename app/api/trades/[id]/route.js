import { connectDB } from '@/lib/db';
import Trade from '@/models/Trade';

// PUT /api/trades/:id
export async function PUT(req, { params }) {
  try {
    await connectDB();
    const updates = await req.json();
    const { id } = params;

    if (!id) {
      return new Response(JSON.stringify({ message: 'Missing ID' }), { status: 400 });
    }

    delete updates._id;
    delete updates.__v;

    const updatedTrade = await Trade.findOneAndUpdate({ id }, updates, { new: true });

    if (!updatedTrade) {
      return new Response(JSON.stringify({ message: 'Trade not found' }), { status: 404 });
    }

    return new Response(JSON.stringify(updatedTrade), { status: 200 });
  } catch (err) {
    console.error('PUT error:', err);
    return new Response(JSON.stringify({ message: 'Error updating trade' }), { status: 500 });
  }
}

// DELETE /api/trades/:id
export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = params;

    if (!id) {
      return new Response(JSON.stringify({ message: 'Missing ID' }), { status: 400 });
    }

    const deleted = await Trade.findOneAndDelete({ id });

    if (!deleted) {
      return new Response(JSON.stringify({ message: 'Trade not found' }), { status: 404 });
    }

    return new Response(JSON.stringify({ message: 'Trade deleted' }), { status: 200 });
  } catch (err) {
    console.error('DELETE error:', err);
    return new Response(JSON.stringify({ message: 'Error deleting trade' }), { status: 500 });
  }
}
