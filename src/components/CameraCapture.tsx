import React, { useRef, useState, useEffect } from 'react';
import { Camera, Upload, RefreshCw, AlertCircle, CheckCircle2, ArrowRight, Shield, X } from 'lucide-react';
import { DEMO_CHECKS } from '@/data/demoCase';

export type ImageSource = 'camera' | 'upload';

interface CameraCaptureProps {
  capturedImage: string | null;
  imageSource?: ImageSource;
  previousImage?: string | null;
  onImageCaptured: (imageSrc: string, source: ImageSource) => void;
  onNextStep: () => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({
  capturedImage,
  imageSource,
  previousImage,
  onImageCaptured,
  onNextStep,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<'choose' | 'camera' | 'captured'>('choose');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [showOverlay, setShowOverlay] = useState(true);

  useEffect(() => {
    if (capturedImage) setMode('captured');
  }, [capturedImage]);

  useEffect(() => {
    return () => { stopCamera(); };
  }, []);

  const stopCamera = () => {
    stream?.getTracks().forEach(t => t.stop());
    setStream(null);
  };

  const startCamera = async () => {
    setCameraError(null);
    setMode('camera');
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera not supported in this browser.');
      }
      const ms = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      setStream(ms);
      if (videoRef.current) {
        videoRef.current.srcObject = ms;
        await videoRef.current.play();
      }
    } catch (err: any) {
      setCameraError(
        err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError'
          ? 'Camera permission denied. Enable it in browser settings, or use Upload Image instead.'
          : 'Could not access camera. Use Upload Image instead.'
      );
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      onImageCaptured(dataUrl, 'camera');
      stopCamera();
      setMode('captured');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Reset so same file can be re-selected
    e.target.value = '';
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        onImageCaptured(ev.target.result as string, 'upload');
        stopCamera();
        setMode('captured');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRetake = () => {
    onImageCaptured('', 'camera');
    stopCamera();
    setMode('choose');
    setCameraError(null);
  };

  // ── Captured preview ──────────────────────────────────────────────────────
  if (mode === 'captured' && capturedImage) {
    const isSynthetic = capturedImage.includes('SYNTHETIC') || capturedImage.includes('Day+');
    const isUpload = imageSource === 'upload';

    return (
      <div className="space-y-4 max-w-xl mx-auto">
        <canvas ref={canvasRef} className="hidden" />

        <div className="relative w-full rounded-2xl overflow-hidden bg-slate-950 border border-surface-border dark:border-surface-darkBorder" style={{ aspectRatio: '4/3' }}>
          <img src={capturedImage} alt="Recovery Observation" className="w-full h-full object-cover" />

          {/* Synthetic watermark */}
          {isSynthetic && (
            <div className="absolute bottom-0 left-0 right-0 bg-brand-950/90 text-brand-300 text-[10px] font-bold text-center py-2 tracking-wider">
              SYNTHETIC DEMO IMAGE — NOT A REAL CLINICAL PHOTO
            </div>
          )}

          {/* Upload source badge */}
          {isUpload && !isSynthetic && (
            <div className="absolute top-2 left-2 bg-amber-500/90 text-white px-2.5 py-1 rounded-md text-[10px] font-bold flex items-center gap-1">
              <Upload className="w-3 h-3" />
              Uploaded Image
            </div>
          )}

          <div className="absolute top-2 right-2 bg-emerald-600/90 text-white px-2.5 py-1 rounded-md text-[10px] font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Ready
          </div>
        </div>

        {/* Upload confidence warning */}
        {isUpload && !isSynthetic && (
          <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3 text-xs text-amber-800 dark:text-amber-300 space-y-1">
            <div className="font-bold">⚠ Uploaded image</div>
            <p>This image was uploaded rather than captured using WoundWatch's camera guide. Photo-to-photo consistency may be reduced, which can affect comparison confidence.</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleRetake}
            className="flex-1 py-3 px-4 rounded-xl border border-surface-border dark:border-surface-darkBorder bg-white dark:bg-surface-darkSoft text-slate-700 dark:text-slate-200 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Retake / Change
          </button>
          <button
            onClick={onNextStep}
            className="flex-1 py-3 px-4 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors"
          >
            Start Scan
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // ── Live camera ───────────────────────────────────────────────────────────
  if (mode === 'camera') {
    return (
      <div className="space-y-4 max-w-xl mx-auto">
        <canvas ref={canvasRef} className="hidden" />
        <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileUpload} className="hidden" />

        <div className="relative w-full rounded-2xl overflow-hidden bg-black border border-surface-border dark:border-surface-darkBorder" style={{ aspectRatio: '4/3' }}>
          {cameraError ? (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-6 text-center">
              <AlertCircle className="w-10 h-10 text-amber-400" />
              <p className="text-xs text-amber-200 max-w-xs">{cameraError}</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-brand-500 hover:bg-brand-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors"
              >
                <Upload className="w-4 h-4" />
                Upload Image Instead
              </button>
            </div>
          ) : (
            <>
              <video ref={videoRef} playsInline muted className="w-full h-full object-cover" />

              {/* Same-shot alignment overlay */}
              {previousImage && showOverlay && (
                <div className="absolute inset-0 pointer-events-none opacity-30 mix-blend-overlay">
                  <img src={previousImage} alt="Alignment guide" className="w-full h-full object-cover grayscale" />
                </div>
              )}

              {/* Framing corners */}
              <div className="absolute top-4 left-4 w-5 h-5 border-t-2 border-l-2 border-brand-400 pointer-events-none" />
              <div className="absolute top-4 right-4 w-5 h-5 border-t-2 border-r-2 border-brand-400 pointer-events-none" />
              <div className="absolute bottom-14 left-4 w-5 h-5 border-b-2 border-l-2 border-brand-400 pointer-events-none" />
              <div className="absolute bottom-14 right-4 w-5 h-5 border-b-2 border-r-2 border-brand-400 pointer-events-none" />

              <div className="absolute top-3 left-3 bg-black/60 text-white px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Live
              </div>

              {previousImage && (
                <button
                  onClick={() => setShowOverlay(!showOverlay)}
                  className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1.5 rounded-full text-[10px] font-semibold"
                >
                  {showOverlay ? 'Hide alignment guide' : 'Show alignment guide'}
                </button>
              )}
            </>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => { stopCamera(); setMode('choose'); setCameraError(null); }}
            className="py-3 px-4 rounded-xl border border-surface-border dark:border-surface-darkBorder bg-white dark:bg-surface-darkSoft text-slate-600 dark:text-slate-300 font-semibold text-sm flex items-center gap-2 hover:bg-slate-50 transition-colors"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
          {!cameraError && (
            <button
              onClick={capturePhoto}
              className="flex-1 py-3 px-4 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-sm flex items-center justify-center gap-2 transition-colors"
            >
              <Camera className="w-4 h-4" />
              Capture Photo
            </button>
          )}
          {!cameraError && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="py-3 px-4 rounded-xl border border-surface-border dark:border-surface-darkBorder bg-white dark:bg-surface-darkSoft text-slate-600 dark:text-slate-300 font-semibold text-sm flex items-center gap-2 hover:bg-slate-50 transition-colors"
            >
              <Upload className="w-4 h-4" />
            </button>
          )}
        </div>
        <input type="file" ref={fileInputRef} accept="image/jpeg,image/png,image/webp" onChange={handleFileUpload} className="hidden" />
      </div>
    );
  }

  // ── Choose screen (default) ───────────────────────────────────────────────
  return (
    <div className="space-y-4 max-w-xl mx-auto">
      <canvas ref={canvasRef} className="hidden" />
      <input type="file" ref={fileInputRef} accept="image/jpeg,image/png,image/webp" onChange={handleFileUpload} className="hidden" />

      <div className="text-center space-y-1 pb-2">
        <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Add today's wound image</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">Choose how you'd like to provide the image.</p>
      </div>

      {/* Two first-class options */}
      <div className="space-y-3">
        <button
          onClick={startCamera}
          className="w-full group bg-white dark:bg-surface-darkSoft border-2 border-surface-border dark:border-surface-darkBorder hover:border-brand-500 dark:hover:border-brand-500 rounded-2xl p-6 text-left transition-colors"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-950 flex items-center justify-center shrink-0 group-hover:bg-brand-100 transition-colors">
              <Camera className="w-6 h-6 text-brand-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-extrabold text-slate-900 dark:text-white text-sm">📷 Take Photo</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Use your camera with the same-shot alignment guide and quality checks for best comparison accuracy.
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                <span className="text-[10px] bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 px-2 py-0.5 rounded-full font-semibold">Alignment guide</span>
                <span className="text-[10px] bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 px-2 py-0.5 rounded-full font-semibold">Best consistency</span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-brand-500 shrink-0 mt-1 transition-colors" />
          </div>
        </button>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
          <span className="text-xs font-semibold text-slate-400">or</span>
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full group bg-white dark:bg-surface-darkSoft border-2 border-surface-border dark:border-surface-darkBorder hover:border-brand-500 dark:hover:border-brand-500 rounded-2xl p-6 text-left transition-colors"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center shrink-0 group-hover:bg-brand-50 transition-colors">
              <Upload className="w-6 h-6 text-slate-500 group-hover:text-brand-500 transition-colors" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-extrabold text-slate-900 dark:text-white text-sm">↑ Upload Image</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Use an existing photo from your device. The same quality analysis and wound region selection apply.
              </div>
              <div className="text-[10px] text-slate-400 mt-2 font-medium">JPG · PNG · WEBP</div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-brand-500 shrink-0 mt-1 transition-colors" />
          </div>
        </button>
      </div>

      {/* Privacy note */}
      <div className="flex items-center gap-2 text-[10px] text-slate-400 justify-center pt-1">
        <Shield className="w-3 h-3 shrink-0" />
        <span>Images stay on your device. Nothing is uploaded to any server.</span>
      </div>
    </div>
  );
};
