'use client';

import React, { useState, useEffect } from 'react';
import { Download, Share2, AlertCircle, CheckCircle2, Loader2, X } from 'lucide-react';

interface ExportPanelProps {
  canvasDataUrl: string;
  onClose: () => void;
}

export function ExportPanel({ canvasDataUrl, onClose }: ExportPanelProps) {
  const [isProcessing, setIsProcessing] = useState(true);
  const [webpData, setWebpData] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function processImage() {
      try {
        const res = await fetch('/api/convert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: canvasDataUrl }),
        });
        
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Export failed');
        }

        setWebpData(data.result);
        setFileSize(data.size);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsProcessing(false);
      }
    }

    processImage();
  }, [canvasDataUrl]);

  // Convert base64 to File object for sharing/downloading
  const dataURLtoFile = (dataurl: string, filename: string) => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const handleDownload = () => {
    if (!webpData) return;
    const link = document.createElement('a');
    link.href = webpData;
    link.download = `sticker_${Date.now()}.webp`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    if (!webpData) return;
    const file = dataURLtoFile(webpData, `sticker_${Date.now()}.webp`);
    
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: 'My Sticker',
          text: 'Made with Sticker Studio'
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      alert("Native sharing isn't supported on this browser. Use the Download button instead and attach it in WhatsApp.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 border border-white/10 rounded-3xl max-w-md w-full p-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-bold mb-6 text-center">Export Sticker</h2>

        <div className="bg-black/40 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[200px] mb-6 border border-white/5">
          {isProcessing ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              <p className="text-sm text-gray-400">Optimizing for WhatsApp...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-3 text-red-400 text-center">
              <AlertCircle className="w-10 h-10 mb-2" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={webpData!} alt="Final Sticker" className="w-48 h-48 object-contain drop-shadow-xl" />
              
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full text-xs font-medium">
                <CheckCircle2 size={14} />
                WhatsApp Ready ({(fileSize / 1024).toFixed(1)} KB)
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleDownload}
            disabled={isProcessing || !!error}
            className="flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-medium transition-colors disabled:opacity-50"
          >
            <Download size={18} />
            Download
          </button>
          <button
            onClick={handleShare}
            disabled={isProcessing || !!error}
            className="flex items-center justify-center gap-2 py-3 bg-green-500 hover:bg-green-400 text-black shadow-[0_0_15px_rgba(34,197,94,0.3)] rounded-xl font-bold transition-all disabled:opacity-50 disabled:shadow-none"
          >
            <Share2 size={18} />
            Share
          </button>
        </div>
        
        {!isProcessing && !error && (
          <div className="mt-6 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-sm text-blue-200/80">
            <h3 className="font-semibold text-blue-400 mb-1">How to use in WhatsApp Web:</h3>
            <ol className="list-decimal pl-4 space-y-1 text-xs">
              <li>Click <strong>Download</strong> above to save the image.</li>
              <li>Open a chat in WhatsApp Web.</li>
              <li>Click the <strong>+ (Attach)</strong> icon next to the chat box.</li>
              <li>Select <strong>Sticker</strong> and choose your downloaded file.</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}
