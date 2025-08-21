//chats/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Chat from '@/models/Chat';

// Fixed GET function in /api/chats/route.js
export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 20;
    const sessionId = searchParams.get('sessionId');
    const userId = searchParams.get('userId');
    const page = parseInt(searchParams.get('page')) || 1;
    const offset = (page - 1) * limit;

    console.log('Retrieving chat list:', { limit, sessionId, userId, page });

    // userId is required for fetching chats
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    // Build query - always filter by userId
    const query = { 
      isActive: true, 
      userId: userId // Filter chats by userId
    };
    
    // Optionally filter by sessionId as well
    if (sessionId) {
      query.sessionId = sessionId;
    }

    // Get total count for pagination
    const totalCount = await Chat.countDocuments(query);

    // Get chats with proper message count using aggregation
    const chats = await Chat.aggregate([
      { $match: query },
      {
        $addFields: {
          messageCount: { $size: "$messages" }, // Get actual message count
          lastMessage: { $arrayElemAt: ["$messages", -1] } // Get last message
        }
      },
      {
        $project: {
          chatId: 1,
          title: 1,
          userId: 1,
          sessionId: 1,
          tradeDataSummary: 1,
          createdAt: 1,
          updatedAt: 1,
          messageCount: 1, // Include the calculated count
          lastMessage: 1 // Include the last message
        }
      },
      { $sort: { updatedAt: -1 } },
      { $skip: offset },
      { $limit: limit }
    ]);

    // Format for frontend sidebar
    const formattedChats = chats.map(chat => {
      const messageCount = chat.messageCount || 0; // Use the calculated count
      const lastMessage = chat.lastMessage;
      const preview = lastMessage ? 
        (lastMessage.content.length > 60 ? 
          lastMessage.content.substring(0, 60) + '...' : 
          lastMessage.content) : 
        'No messages yet';

      return {
        chatId: chat.chatId,
        title: chat.title,
        userId: chat.userId,
        sessionId: chat.sessionId,
        preview,
        messageCount, // Now this will be the correct count
        lastMessageType: lastMessage?.role || 'user',
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
        tradeDataSummary: chat.tradeDataSummary
      };
    });

    console.log(`Retrieved ${formattedChats.length} chats for user ${userId}`);

    return NextResponse.json({
      success: true,
      chats: formattedChats,
      pagination: {
        total: totalCount,
        page: page,
        limit: limit,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page < Math.ceil(totalCount / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Error retrieving chat list:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve chats', details: error.message },
      { status: 500 }
    );
  }
}

// POST: Create new chat with userId
export async function POST(request) {
  try {
    await connectDB();
    
    const { chatId, title, sessionId, userId, tradeDataSummary } = await request.json();

    if (!chatId || !sessionId || !userId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: chatId, sessionId, and userId' },
        { status: 400 }
      );
    }

    // Check if chat already exists
    const existingChat = await Chat.findOne({ chatId });
    if (existingChat) {
      return NextResponse.json(
        { success: false, error: 'Chat already exists' },
        { status: 409 }
      );
    }

    const chat = new Chat({
      chatId,
      title: title || 'New Chat',
      userId, // Include userId when creating chat
      sessionId,
      messages: [],
      tradeDataSummary: tradeDataSummary || {}
    });

    await chat.save();

    console.log('Created new chat:', chat.title, 'for user:', userId);

    return NextResponse.json({
      success: true,
      chat: {
        chatId: chat.chatId,
        title: chat.title,
        userId: chat.userId,
        sessionId: chat.sessionId,
        createdAt: chat.createdAt
      }
    });

  } catch (error) {
    console.error('Error creating chat:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create chat', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE: Soft delete all chats for a user (optional bulk operation)
export async function DELETE(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const chatId = searchParams.get('chatId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    let result;
    if (chatId) {
      // Delete specific chat for user
      result = await Chat.findOneAndUpdate(
        { chatId, userId },
        { isActive: false },
        { new: true }
      );
    } else {
      // Soft delete all chats for user
      result = await Chat.updateMany(
        { userId, isActive: true },
        { isActive: false }
      );
    }

    console.log(`Deleted chats for user ${userId}:`, result);

    return NextResponse.json({
      success: true,
      message: chatId ? 'Chat deleted successfully' : 'All chats deleted successfully',
      result
    });

  } catch (error) {
    console.error('Error deleting chats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete chats', details: error.message },
      { status: 500 }
    );
  }
}