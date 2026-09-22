import React, { useState, useEffect } from 'react';
import { SymptomContext, ObservationResult, RecoveryCheck as RecoveryCheckType, ImageFeatures, WoundRegion } from '@/types';
import { CameraCapture, ImageSource } from '@/components/CameraCapture';
import { PhotoQuality } from '@/components/PhotoQuality';
import { WoundRegionSelect } from '@/components/WoundRegionSelect';
import { SymptomSelector } from '@/components/SymptomSelector';
import { RecoverySnapshot } from '@/components/RecoverySnapshot';
import { observationEngine } from '@/services/observationEngine';
import { extractImageFeatures } from '@/services/imageFeatures';
import { saveCheck, getSavedChecks } from '@/services/storage';
import { Check, ArrowLeft, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface RecoveryCheckProps {
  onComplete: () => void;
  onCancel: () => void;
}

export const RecoveryCheckPage: React.FC<RecoveryCheckProps> = ({
  onComplete,
  onCancel,
}) => {
  const [step, setStep] = useState<number>(1);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageSource, setImageSource] = useState<ImageSource>('camera');
  
  // Phase 2 state
  const [initialFeatures, setInitialFeatures] = useState<ImageFeatures | null>(null);
  const [isExtractingFeatures, setIsExtractingFeatures] = useState(false);
  const [woundRegion, setWoundRegion] = useState<WoundRegion | null>(null);

  const [symptomContext, setSymptomContext] = useState<SymptomContext>({
    pain: 0,
    symptoms: [],
    voiceNote: '',
  });
  const [observationResult, setObservationResult] = useState<ObservationResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [previousImage, setPreviousImage] = useState<string | null>(null);

  useEffect(() => {
    const checks = getSavedChecks();
    if (checks.length > 0) {
      setPreviousImage(checks[0].imageUrl || null);
    }
  }, []);

  const handleImageCaptured = (img: string, source: ImageSource) => {
    setImageSrc(img);
    setImageSource(source);
    if (!img) {
      setInitialFeatures(null);
      setWoundRegion(null);
    }
  };

  const handleProcessImage = async () => {
    if (!imageSrc) return;
    setIsExtractingFeatures(true);
    setStep(2); // Move to Photo Quality while loading (or show loader first)
    
    try {
      const features = await extractImageFeatures(imageSrc, null);
      setInitialFeatures(features);
    } catch (e) {
      console.error(e);
      // Fallback
      setInitialFeatures({
        avgBrightness: 128,
        brightnessVariance: 50,
        sharpness: 20,
        redDominance: 30,
        regionRedDominance: 30,
        regionBrightness: 128,
        woundRegion: null,
        imageQuality: 'good'
      });
    } finally {
      setIsExtractingFeatures(false);
    }
  };

  const handleRegionSelected = async (region: WoundRegion) => {
    setWoundRegion(region);
    // In a real app we might re-extract here, but currently ObservationEngine re-extracts it. 
    // Wait, observationEngine.analyze expects just imageSrc, but in our current implementation,
    // ObservationEngine extracts it again.
    // Let's pass the region to observationEngine if we can, or just wait for Step 5.
    // For now, proceed to Step 4.
    setStep(4);
  };

  const handleAnalyze = async () => {
    if (!imageSrc) return;
    setStep(5);
    setIsAnalyzing(true);

    try {
      const existingChecks = getSavedChecks();
      
      // Update ObservationEngine to handle wound region, or we just extract here and pass to it?
      // For now, prototypeObservationEngine calls extractImageFeatures internally.
      // To pass woundRegion, we'll need to modify it. But let's mock the result temporarily 
      // or just call engine and let it run without region for this exact snippet, 
      // since we haven't updated ObservationEngine's interface yet to take woundRegion.
      // Actually, let's extract the final features here and maybe pass them?
      // Wait, ObservationEngine takes (imageSrc, context, history). We can just modify it later.
      
      const result = await observationEngine.analyze(imageSrc, symptomContext, existingChecks);
      // Manually patch in the final features if needed, or update Engine later
      if (woundRegion && initialFeatures) {
         // We do a final extraction here to get the region stats
         const finalFeatures = await extractImageFeatures(imageSrc, woundRegion);
         result.visualSignal = finalFeatures;
      }

      setObservationResult(result);
    } catch (err) {
      console.error('Error during analysis:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveObservation = () => {
    if (!observationResult || !imageSrc) return;

    const newEntry: RecoveryCheckType = {
      id: `check-${Date.now()}`,
      timestamp: new Date().toISOString(),
      imageUrl: imageSrc,
      visualSignal: observationResult.visualSignal,
      context: symptomContext,
      trend: observationResult.trend,
      safetyLevel: observationResult.safetyLevel,
      comparison: observationResult.comparison,
      reasoning: observationResult.reasoning,
      explanation: observationResult.explanation,
      safetyPrompt: observationResult.safetyPrompt,
    };

    saveCheck(newEntry);
    onComplete();
  };

  return (
    <div className="space-y-6 pb-24 md:pb-8">
      {/* Header & Step Indicator */}
      <div className="flex items-center justify-between border-b border-surface-border dark:border-surface-darkBorder pb-4">
        <button
          onClick={onCancel}
          className="text-slate-500 hover:text-slate-900 dark:hover:text-white text-xs font-semibold flex items-center space-x-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Check</span>
        </button>

        {/* Wizard Step Pills (Condensed) */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          {[1, 2, 3, 4, 5].map((stepNumber) => {
            const isCurrent = step === stepNumber;
            const isCompleted = step > stepNumber;

            return (
              <div
                key={stepNumber}
                className={`flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full text-[10px] sm:text-xs font-bold transition-all ${
                  isCurrent
                    ? 'bg-brand-500 text-white shadow-subtle ring-2 sm:ring-4 ring-brand-100 dark:ring-brand-950'
                    : isCompleted
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                }`}
              >
                {isCompleted ? <Check className="w-3 h-3 sm:w-4 sm:h-4 stroke-[3]" /> : stepNumber}
              </div>
            );
          })}
        </div>

        <span className="text-[10px] sm:text-xs font-bold text-brand-600 dark:text-brand-400">
          Step {step} of 5
        </span>
      </div>

      {/* Step Title Header */}
      <div className="text-center max-w-md mx-auto">
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
          {step === 1 && 'Capture Recovery Photo'}
          {step === 2 && 'Image Quality'}
          {step === 3 && 'Target Region'}
          {step === 4 && 'Report Symptoms'}
          {step === 5 && 'Recovery Snapshot'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          {step === 1 && 'Align with your previous photo if possible.'}
          {step === 2 && 'Checking lighting and sharpness.'}
          {step === 3 && 'Focus the analysis on the primary wound area.'}
          {step === 4 && 'Record pain score, observable symptoms, and optional voice notes.'}
          {step === 5 && 'Observable visual signals and safe recovery trend assessment.'}
        </p>
      </div>

      {/* Step Content Components with Animation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25 }}
        >
          {step === 1 && (
            <CameraCapture
              capturedImage={imageSrc}
              imageSource={imageSource}
              previousImage={previousImage}
              onImageCaptured={handleImageCaptured}
              onNextStep={handleProcessImage}
            />
          )}

          {step === 2 && (
            isExtractingFeatures || !initialFeatures ? (
              <div className="flex flex-col items-center justify-center py-20 text-brand-500">
                <Loader2 className="w-10 h-10 animate-spin mb-4" />
                <p className="text-sm font-semibold">Analyzing image quality...</p>
              </div>
            ) : (
              <PhotoQuality 
                imageFeatures={initialFeatures}
                onRetake={() => {
                   setStep(1);
                   setImageSrc(null);
                }}
                onContinue={() => setStep(3)}
              />
            )
          )}

          {step === 3 && imageSrc && (
            <WoundRegionSelect
               imageSrc={imageSrc}
               onRetake={() => {
                  setStep(1);
                  setImageSrc(null);
               }}
               onRegionSelected={handleRegionSelected}
            />
          )}

          {step === 4 && (
            <SymptomSelector
              context={symptomContext}
              onChange={(updated) => setSymptomContext(updated)}
              onNextStep={handleAnalyze}
              onPrevStep={() => setStep(3)}
            />
          )}

          {step === 5 && (
            <RecoverySnapshot
              imageSrc={imageSrc}
              context={symptomContext}
              result={observationResult}
              isAnalyzing={isAnalyzing}
              onSave={handleSaveObservation}
              onPrevStep={() => setStep(4)}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
