'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getDrafts, deleteDraft } from '@/lib/storage';
import { Draft } from '@/types/sticker';
import { Trash2, ArrowLeft, Edit3, Image as ImageIcon } from 'lucide-react';

export default function GalleryPage() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadDrafts();
  }, []);

  const loadDrafts = async () => {
    setIsLoading(true);
    try {
      const data = await getDrafts();
      setDrafts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this draft?')) {
      await deleteDraft(id);
      await loadDrafts();
    }
  };

  const openDraft = (id: string) => {
    router.push(`/?draftId=${id}`);
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-500/30">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <header className="mb-12 flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold tracking-tight">My Stickers</h1>
            <p className="text-gray-400">Your recent drafts and creations.</p>
          </div>
          <Link 
            href="/"
            className="flex items-center gap-2 text-sm font-medium text-white transition-colors bg-white/10 hover:bg-white/20 px-5 py-2.5 rounded-full border border-white/10"
          >
            <ArrowLeft size={16} /> Back to Studio
          </Link>
        </header>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        ) : drafts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-zinc-900/50 rounded-3xl border border-white/5 border-dashed">
            <ImageIcon className="w-16 h-16 text-gray-600 mb-4" />
            <h2 className="text-xl font-semibold mb-2">No stickers yet</h2>
            <p className="text-gray-400 text-sm mb-6">Create your first sticker in the studio to see it here.</p>
            <Link 
              href="/"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-full font-medium transition-colors"
            >
              Start Creating
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {drafts.map(draft => (
              <div 
                key={draft.id}
                onClick={() => openDraft(draft.id)}
                className="group relative bg-zinc-900 rounded-2xl border border-white/10 overflow-hidden cursor-pointer hover:border-white/30 transition-all hover:-translate-y-1 shadow-lg"
              >
                <div className="aspect-square relative p-4 flex items-center justify-center bg-black/40">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={draft.baseImage} 
                    alt="Draft" 
                    className="max-w-full max-h-full object-contain drop-shadow-lg"
                  />
                  {/* Overlay for layers summary */}
                  <div className="absolute bottom-2 left-2 right-2 flex justify-between items-end">
                    <span className="text-[10px] uppercase font-bold bg-black/60 px-2 py-1 rounded text-white/70">
                      {draft.layers.length} Layers
                    </span>
                  </div>
                </div>
                
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                  <button 
                    onClick={(e) => handleDelete(e, draft.id)}
                    className="p-1.5 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-colors backdrop-blur-md"
                    title="Delete Draft"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                  <div className="flex items-center gap-2 bg-blue-600 px-4 py-2 rounded-full font-semibold shadow-xl translate-y-4 group-hover:translate-y-0 transition-transform">
                    <Edit3 size={16} /> Edit
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
