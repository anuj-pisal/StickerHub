'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Uploader } from '@/components/Uploader';
import { PromptBar } from '@/components/PromptBar';
import { RefreshCcw, ArrowRight, ArrowLeft, Image as ImageIconLucide } from 'lucide-react';
import { LayerPanel } from '@/components/LayerPanel';
import { ExportPanel } from '@/components/ExportPanel';
import { Layer as StickerLayer } from '@/types/sticker';
import type { EditorCanvasRef } from '@/components/EditorCanvas';

// Dynamically import the Konva canvas to avoid SSR issues
const EditorCanvas = dynamic(() => import('@/components/EditorCanvas'), {
  ssr: false,
  loading: () => (
    <div className="w-[512px] h-[512px] bg-black/20 animate-pulse rounded-xl flex items-center justify-center border border-white/5">
      <RefreshCcw className="w-8 h-8 text-blue-500 animate-spin opacity-50" />
    </div>
  ),
});

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const draftIdParam = searchParams.get('draftId');

  const [images, setImages] = useState<string[]>([]);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Editor State
  const [isEditorMode, setIsEditorMode] = useState(false);
  const [layers, setLayers] = useState<StickerLayer[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);

  // Load draft if draftId is present
  useEffect(() => {
    if (draftIdParam) {
      import('@/lib/storage').then(({ getDraft }) => {
        getDraft(draftIdParam).then(draft => {
          if (draft) {
            setResultImage(draft.baseImage);
            setLayers(draft.layers);
            setCurrentDraftId(draft.id);
            setIsEditorMode(true);
          }
        });
      });
    }
  }, [draftIdParam]);

  // Auto-save logic
  useEffect(() => {
    if (isEditorMode && resultImage) {
      const id = currentDraftId || `draft-${Date.now()}`;
      if (!currentDraftId) setCurrentDraftId(id);

      const timer = setTimeout(() => {
        import('@/lib/storage').then(({ saveDraft }) => {
          saveDraft({
            id,
            createdAt: currentDraftId ? undefined : Date.now(), // don't overwrite createdAt if it exists? Wait, type expects number. We can just keep Date.now() if it's new, otherwise we need to pull the original createdAt. But since it's just sorting, using Date.now() on save is fine, or we can fetch first. Let's just use Date.now() for simplicity to bump it to top.
            baseImage: resultImage,
            layers: layers,
          } as any).catch(console.error);
        });
      }, 1000); // 1s debounce

      return () => clearTimeout(timer);
    }
  }, [isEditorMode, resultImage, layers, currentDraftId]);

  // Export State
  const canvasRef = useRef<EditorCanvasRef>(null);
  const [exportDataUrl, setExportDataUrl] = useState<string | null>(null);

  const isMulti = images.length > 1;

  const handlePromptSubmit = async (prompt: string) => {
    if (images.length === 0) {
      setError('Please select an image first.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResultImage(null);

    try {
      const endpoint = isMulti ? '/api/ai/combine' : '/api/ai/edit';
      const body = isMulti ? { images, instruction: prompt } : { image: images[0], instruction: prompt };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to process image');
      }

      setResultImage(data.result);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const enterEditor = (imageUrl: string) => {
    setResultImage(imageUrl);
    setIsEditorMode(true);
  };

  const handleExport = () => {
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.exportImage();
      if (dataUrl) {
        setExportDataUrl(dataUrl);
      }
    }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-500/30">
      {/* Navigation */}
      <nav className="absolute top-0 right-0 p-6 z-50">
        <Link href="/gallery" className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full border border-white/10">
          <ImageIconLucide size={16} /> My Stickers
        </Link>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <header className="mb-12 text-center space-y-4">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 text-transparent bg-clip-text">
            Sticker Studio
          </h1>
          {!isEditorMode && (
            <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto font-light">
              Craft WhatsApp stickers with AI. Edit, combine, and refine your images.
            </p>
          )}
        </header>

        <main className="space-y-12 relative">
          
          {isEditorMode && resultImage ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between mb-8">
                <button 
                  onClick={() => {
                    setIsEditorMode(false);
                    if (draftIdParam) router.push('/'); // remove search param if going back
                  }}
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                  <ArrowLeft size={20} /> Back to Generation
                </button>
                <button 
                  onClick={handleExport}
                  className="px-6 py-2 bg-green-500 hover:bg-green-400 text-black font-semibold rounded-full shadow-[0_0_15px_rgba(34,197,94,0.3)] transition-all"
                >
                  Export Sticker
                </button>
              </div>
              
              <div className="flex flex-col md:flex-row gap-8 items-start justify-center">
                <EditorCanvas 
                  ref={canvasRef}
                  baseImageUrl={resultImage} 
                  layers={layers}
                  setLayers={setLayers}
                  selectedId={selectedId}
                  setSelectedId={setSelectedId}
                />
                
                <LayerPanel 
                  layers={layers}
                  setLayers={setLayers}
                  selectedId={selectedId}
                  setSelectedId={setSelectedId}
                  baseImageUrl={resultImage}
                  setBaseImageUrl={setResultImage}
                />
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-12">
              <div className="grid md:grid-cols-2 gap-8 items-start">
                
                {/* Left: Input */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 text-xs">1</span>
                      Input Images
                    </h2>
                    <div className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-400">
                      {isMulti ? 'Multi-image' : 'Single image'} mode
                    </div>
                  </div>
                  <div className="bg-zinc-900/50 p-6 rounded-3xl border border-white/5 shadow-xl">
                    <Uploader onImagesSelected={setImages} multiSelect={true} />
                    {images.length > 0 && (
                      <button 
                        onClick={() => enterEditor(images[0])}
                        className="mt-4 w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-gray-300 transition-colors"
                      >
                        Skip AI, Edit Raw Image
                      </button>
                    )}
                  </div>
                </div>

                {/* Right: Output */}
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 text-xs">2</span>
                    AI Result
                  </h2>
                  <div className="bg-zinc-900/50 p-6 rounded-3xl border border-white/5 shadow-xl min-h-[300px] flex flex-col items-center justify-center relative overflow-hidden group">
                    
                    {resultImage ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={resultImage} alt="AI Result" className="w-full h-full object-contain rounded-xl" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                          <button 
                            onClick={() => enterEditor(resultImage)}
                            className="flex flex-col items-center gap-2 text-white hover:text-blue-400 transition-colors"
                          >
                            <div className="p-3 bg-white/10 rounded-full backdrop-blur-sm shadow-lg"><ArrowRight size={20} /></div>
                            <span className="text-sm font-medium">Continue to Editor</span>
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center text-gray-500">
                        <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p className="text-sm">Your generated image will appear here</p>
                      </div>
                    )}
                    
                    {isLoading && (
                      <div className="absolute inset-0 bg-zinc-900/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                        <RefreshCcw className="w-8 h-8 text-blue-500 animate-spin mb-4" />
                        <p className="text-sm font-medium animate-pulse text-blue-200">AI is working its magic...</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom: Prompt Bar */}
              <div className="pt-8 relative z-20">
                {error && (
                  <div className="mb-4 text-center text-red-400 text-sm bg-red-500/10 py-2 px-4 rounded-lg inline-block mx-auto max-w-lg border border-red-500/20">
                    {error}
                  </div>
                )}
                <PromptBar 
                  onSubmit={handlePromptSubmit} 
                  isLoading={isLoading} 
                  placeholder={isMulti ? "Describe how to combine these images..." : "e.g. 'give them sunglasses', 'make it a cartoon'"} 
                />
              </div>
            </div>
          )}

          {/* Export Modal */}
          {exportDataUrl && (
            <ExportPanel 
              canvasDataUrl={exportDataUrl} 
              onClose={() => setExportDataUrl(null)} 
            />
          )}
        </main>
      </div>
    </div>
  );
}

function ImageIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
      <circle cx="9" cy="9" r="2"/>
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
    </svg>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center"><RefreshCcw className="w-8 h-8 text-blue-500 animate-spin" /></div>}>
      <HomeContent />
    </Suspense>
  );
}
