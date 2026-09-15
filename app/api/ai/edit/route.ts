import { NextRequest, NextResponse } from 'next/server';
import { HfInference } from '@huggingface/inference';

const hf = new HfInference(process.env.HF_TOKEN);

export async function POST(req: NextRequest) {
  try {
    const { image, instruction } = await req.json();

    if (!image || !instruction) {
      return NextResponse.json({ error: 'Image and instruction are required' }, { status: 400 });
    }

    if (!process.env.HF_TOKEN) {
      return NextResponse.json({ error: 'Missing HF_TOKEN in environment variables' }, { status: 500 });
    }

    // Extract base64
    const base64Data = image.split(',')[1] || image;
    const mimeType = image.split(';')[0].split(':')[1] || 'image/png';
    const buffer = Buffer.from(base64Data, 'base64');
    const blob = new Blob([buffer], { type: mimeType });

    // Call Hugging Face API
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
    console.error('AI Edit Error:', error);
    
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

    return NextResponse.json({ error: errorMsg || 'Failed to process image' }, { status: 500 });
  }
}
