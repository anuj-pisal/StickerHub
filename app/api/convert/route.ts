import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

export async function POST(req: NextRequest) {
  try {
    const { image } = await req.json();

    if (!image) {
      return NextResponse.json({ error: 'No image provided.' }, { status: 400 });
    }

    // Extract base64 part
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Desired constraints
    const MAX_SIZE_BYTES = 100 * 1024; // 100 KB
    const DIMENSION = 512;

    let quality = 80;
    let webpBuffer: Buffer | null = null;
    
    // Attempt up to 4 compression loops
    for (let attempts = 0; attempts < 4; attempts++) {
      webpBuffer = await sharp(buffer)
        .resize(DIMENSION, DIMENSION, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 } // Transparent padding
        })
        .webp({ quality })
        .toBuffer();
        
      if (webpBuffer.length <= MAX_SIZE_BYTES) {
        break; // Within limits
      }
      quality -= 20; // Step down quality
    }

    if (!webpBuffer || webpBuffer.length > MAX_SIZE_BYTES) {
      return NextResponse.json({ 
        error: 'Image is too complex to compress under 100KB for WhatsApp. Try removing some layers or simplifying.',
        size: webpBuffer ? webpBuffer.length : 0 
      }, { status: 413 }); // Payload Too Large
    }

    // Return as base64 so client can reconstruct it easily, or return raw buffer?
    // Using base64 inside JSON is easiest for client to handle natively in JS.
    const resultBase64 = `data:image/webp;base64,${webpBuffer.toString('base64')}`;

    return NextResponse.json({
      result: resultBase64,
      size: webpBuffer.length,
      dimensions: { width: DIMENSION, height: DIMENSION }
    });

  } catch (error: any) {
    console.error('Export Error:', error);
    return NextResponse.json({ error: 'Failed to convert image.' }, { status: 500 });
  }
}
