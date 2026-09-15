import { removeBackground as imglyRemoveBackground } from '@imgly/background-removal';

/**
 * Removes the background from an image source (URL, Blob, or File).
 * Returns a URL representing the processed image (blob URL).
 */
export async function removeBackground(imageSource: string | Blob | File): Promise<string> {
  try {
    const blob = await imglyRemoveBackground(imageSource);
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Background removal failed:', error);
    throw new Error('Failed to remove background.');
  }
}
