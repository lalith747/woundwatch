import React, { useState, useEffect } from 'react';
import { CameraCapture, ImageSource } from '@/components/CameraCapture';
import { SymptomSelector } from '@/components/SymptomSelector';
import { observationEngine } from '@/services/observationEngine';
import { saveCheck, getSavedChecks } from '@/services/storage';
import { RecoveryCheck, SymptomContext, ObservationResult } from '@/types';
import { X, CheckCircle2, ScanFace, Activity, ShieldAlert, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  onComplete: () => void;
  onCancel: () => void;
}

type ScanStage = 'capture' | 'scanning' | 'symptoms' | 'result';

export function RecoveryScanner({ onComplete, onCancel }: Props) {
  const [stage, setStage] = useState<ScanStage>('capture');
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  
  // Scanning animation steps
  const [scanProgress, setScanProgress] = useState(0);
  const scanTasks = [
    'Checking image quality',
    'Mapping selected region',
    'Extracting visual signals',
    'Comparing trajectory',
    'Checking recent changes'
  ];

  const [symptomContext, setSymptomContext] = useState<SymptomContext>({
    pain: 0,
    symptoms: [],
    voiceNote: '',
  });

  const [result, setResult] = useState<ObservationResult | null>(null);

  const handleCapture = (img: string, source: ImageSource) => {
    setImageSrc(img);
  };

  const startScan = () => {
    if (!imageSrc) return;
    setStage('scanning');
    
    let progress = 0;
    const interval = setInterval(() => {
      progress += 1;
      setScanProgress(progress);
      if (progress >= scanTasks.length) {
        clearInterval(interval);
        setTimeout(() => setStage('symptoms'), 600);
      }
    }, 500); // 500ms per task for deliberate pacing
  };

  const handleAnalyze = async () => {
    if (!imageSrc) return;
    const existingChecks = getSavedChecks();
    const analysis = await observationEngine.analyze(imageSrc, symptomContext, existingChecks);
    setResult(analysis);
    setStage('result');
  };

  const handleSave = () => {
    if (!result || !imageSrc) return;
    
    const newEntry: RecoveryCheck = {
      id: `check-${Date.now()}`,
      timestamp: new Date().toISOString(),
      imageUrl: imageSrc,
      visualSignal: result.visualSignal,
      context: symptomContext,
      trend: result.trend,
      safetyLevel: result.safetyLevel,
      comparison: result.comparison,
      reasoning: result.reasoning,
      explanation: result.explanation,
      safetyPrompt: result.safetyPrompt,
      expectedRange: result.expectedRange,
      anomalies: result.anomalies,
    };

    saveCheck(newEntry);
    onComplete();
  };

  return (
    <div className="h-full flex flex-col max-w-2xl mx-auto pb-24 bg-slate-950 text-slate-200">
      {/* Header */}
      <header className="p-4 flex justify-between items-center relative z-20">
        <div className="flex items-center gap-2 text-slate-400 text-sm font-bold tracking-widest">
          <ScanFace className="w-5 h-5" />
          RECOVERY SCAN
        </div>
        <button onClick={onCancel} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </header>

      <main className="flex-1 flex flex-col relative">
        <AnimatePresence mode="wait">
          
          {/* STAGE 1: CAPTURE */}
          {stage === 'capture' && (
            <motion.div 
              key="capture"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex-1 p-4 flex flex-col"
            >
              <CameraCapture 
                capturedImage={imageSrc}
                imageSource="camera"
                onImageCaptured={handleCapture}
                onNextStep={startScan}
              />
            </motion.div>
          )}

          {/* STAGE 2: SCANNING */}
          {stage === 'scanning' && imageSrc && (
            <motion.div 
              key="scanning"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center p-6"
            >
              <div className="w-full max-w-sm space-y-6 text-sm font-medium">
                {scanTasks.map((task, index) => {
                  const isComplete = scanProgress > index;
                  const isActive = scanProgress === index;
                  
                  return (
                    <motion.div 
                      key={index} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: isComplete || isActive ? 1 : 0.2, x: 0 }}
                      className="flex justify-between items-center"
                    >
                      <span className={`${isComplete ? 'text-slate-300' : isActive ? 'text-blue-400 font-bold' : 'text-slate-700'}`}>
                        {task}
                      </span>
                      {isComplete && <Check className="w-5 h-5 text-emerald-400" />}
                      {isActive && <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />}
                    </motion.div>
                  );
                })}
                
                {scanProgress >= scanTasks.length && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-12 pt-6 border-t border-slate-800 text-center"
                  >
                    <h2 className="text-2xl font-extrabold text-white">Scan complete</h2>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* STAGE 3: SYMPTOMS */}
          {stage === 'symptoms' && (
            <motion.div 
              key="symptoms"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="flex-1 p-4 flex flex-col"
            >
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 lg:p-8 flex-1 flex flex-col shadow-2xl">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-extrabold text-white mb-2">How does it feel?</h2>
                  <p className="text-slate-400">Provide context for the latest scan.</p>
                </div>
                
                <div className="flex-1 overflow-y-auto hide-scrollbar">
                  <SymptomSelector 
                    context={symptomContext}
                    onChange={setSymptomContext}
                    onNextStep={handleAnalyze}
                    onPrevStep={() => {}} // one-way flow
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* STAGE 4: RESULT */}
          {stage === 'result' && result && (
            <motion.div 
              key="result"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="flex-1 p-4 flex flex-col items-center justify-center text-center"
            >
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-sm w-full shadow-2xl relative overflow-hidden">
                <div className="relative z-10">
                  {result.safetyLevel === 'normal' ? (
                    <CheckCircle2 className="w-20 h-20 text-emerald-400 mx-auto mb-6" />
                  ) : result.safetyLevel === 'monitor' ? (
                    <Activity className="w-20 h-20 text-amber-400 mx-auto mb-6" />
                  ) : (
                    <ShieldAlert className="w-20 h-20 text-red-400 mx-auto mb-6" />
                  )}

                  <h2 className="text-3xl font-extrabold text-white mb-2">Analysis Complete</h2>
                  
                  <div className="bg-slate-950 rounded-2xl p-5 my-8 text-left border border-slate-800">
                    <p className="text-sm text-slate-300 font-medium leading-relaxed">{result.explanation}</p>
                  </div>

                  <button
                    onClick={handleSave}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-900/30 transition-transform active:scale-[0.98]"
                  >
                    Save to Trajectory
                  </button>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}
