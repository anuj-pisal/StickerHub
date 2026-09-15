import { NextRequest, NextResponse } from 'next/server';
import { HfInference } from '@huggingface/inference';
import sharp from 'sharp';

const hf = new HfInference(process.env.HF_TOKEN);

export async function POST(req: NextRequest) {
  try {
    const { images, instruction } = await req.json();

    if (!images || !Array.isArray(images) || images.length < 2 || !instruction) {
      return NextResponse.json({ error: 'At least 2 images and an instruction are required' }, { status: 400 });
    }

    if (!process.env.HF_TOKEN) {
      return NextResponse.json({ error: 'Missing HF_TOKEN in environment variables' }, { status: 500 });
    }

    // Process images into buffers
    const buffers = images.map((img: string) => {
      const base64Data = img.split(',')[1] || img;
      return Buffer.from(base64Data, 'base64');
    });

    // 1. Get dimensions of the first image to standardize size
    const firstImgMeta = await sharp(buffers[0]).metadata();
    const width = firstImgMeta.width || 512;
    const height = firstImgMeta.height || 512;

    // 2. Resize all images to the same height and calculate total width
    const resizedBuffers = await Promise.all(buffers.map(b => 
      sharp(b).resize({ height }).toBuffer()
    ));

    const totalWidth = width * resizedBuffers.length;

    // 3. Composite side-by-side using sharp
    const compositeOptions = resizedBuffers.map((buf, i) => ({
      input: buf,
      left: width * i,
      top: 0
    }));

    const compositedBuffer = await sharp({
      create: {
        width: totalWidth,
        height: height,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      }
    })
    .composite(compositeOptions)
    .png()
    .toBuffer();

    const blob = new Blob([compositedBuffer], { type: 'image/png' });

    // 4. Send composite to Hugging Face
    const resultBlob = await hf.imageToImage({
      model: 'timbrooks/instruct-pix2pix',
      inputs: blob,
      parameters: {
        prompt: instruction
      }
    });

    // Convert Blob to base64
    const arrayBuffer = await resultBlob.arrayBuffer();
    const resultBuffer = Buffer.from(arrayBuffer);
    const resultImage = `data:${resultBlob.type};base64,${resultBuffer.toString('base64')}`;

    return NextResponse.json({ result: resultImage });
  } catch (error: any) {
    console.error('AI Combine Error:', error);

    // Check if it's a quota/429 error or a provider error
    const errorMsg = error.message || '';
    if (errorMsg.includes('429') || errorMsg.includes('Quota exceeded') || errorMsg.includes('RESOURCE_EXHAUSTED')) {
      return NextResponse.json({ 
        error: 'Your Hugging Face API token is rate-limited. Please wait or use "Skip AI, Edit Raw Image".' 
      }, { status: 429 });
    }
    
    if (errorMsg.includes('No Inference Provider available')) {
      return NextResponse.json({ 
        error: 'Hugging Face free servers are currently offline for this model. Please click "Skip AI, Edit Raw Image" below to continue without AI.' 
      }, { status: 503 });
    }

    return NextResponse.json({ error: errorMsg || 'Failed to process images' }, { status: 500 });
  }
}
