import { NextResponse } from 'next/server';
import { uploadImage, deleteImage, generateSignedUploadParams } from '@/lib/cloudinary';

// Handle file uploads
export async function POST(request) {
  try {
    console.log('Upload API called');
    
    // Check environment variables first
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error('Missing Cloudinary environment variables');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cloudinary configuration missing',
          details: 'Please check CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables'
        },
        { status: 500 }
      );
    }
    
    // Get form data
    const formData = await request.formData();
    const file = formData.get('file');
    const folder = formData.get('folder') || 'trade_journal';
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    console.log('Processing file:', {
      name: file.name,
      type: file.type,
      size: file.size
    });

    // Convert file to base64 for Cloudinary upload
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64String = `data:${file.type};base64,${buffer.toString('base64')}`;

    console.log('File converted to base64, uploading to Cloudinary...');

    // Upload to Cloudinary
    const result = await uploadImage(base64String, folder);
    
    if (result.success) {
      console.log('Upload successful:', result.url);
      return NextResponse.json({
        success: true,
        url: result.url,
        public_id: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes
      });
    } else {
      console.error('Upload failed:', result.error);
      return NextResponse.json(
        { success: false, error: result.error || 'Upload failed' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Upload API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Upload failed', 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// Handle file deletions
export async function DELETE(request) {
  try {
    console.log('Delete API called');
    
    const body = await request.json();
    const { publicId } = body;
    
    if (!publicId) {
      return NextResponse.json(
        { success: false, error: 'No public ID provided' },
        { status: 400 }
      );
    }

    const result = await deleteImage(publicId);
    
    if (result.success) {
      console.log('Delete successful:', publicId);
      return NextResponse.json({
        success: true,
        message: 'Image deleted successfully'
      });
    } else {
      console.error('Delete failed:', result.error);
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Delete API error:', error);
    return NextResponse.json(
      { success: false, error: 'Delete failed', details: error.message },
      { status: 500 }
    );
  }
}

// Generate signed upload parameters for client-side uploads
export async function GET(request) {
  try {
    console.log('Signed params API called');
    
    const { searchParams } = new URL(request.url);
    const folder = searchParams.get('folder') || 'trade_journal';
    
    const result = await generateSignedUploadParams(folder);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        params: result.params
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Signed params API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate signed params', details: error.message },
      { status: 500 }
    );
  }
}