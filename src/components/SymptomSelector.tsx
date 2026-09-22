import React, { useState, useEffect, useRef } from 'react';
import { SymptomContext } from '@/types';
import { Mic, MicOff, Check, Activity, Edit3, Volume2 } from 'lucide-react';
import { createSpeechRecognizer, isSpeechRecognitionSupported } from '@/services/voice';
import { motion } from 'framer-motion';

interface SymptomSelectorProps {
  context: SymptomContext;
  onChange: (updatedContext: SymptomContext) => void;
  onNextStep: () => void;
  onPrevStep: () => void;
}

const AVAILABLE_SYMPTOMS = [
  'More pain',
  'Swelling',
  'Warmth',
  'Discharge',
  'Fever',
  'No new symptoms',
];

const PAIN_PRESETS = [
  { val: 0, label: '0 (None)' },
  { val: 2, label: '2 (Mild)' },
  { val: 4, label: '4 (Moderate)' },
  { val: 7, label: '7 (Severe)' },
  { val: 10, label: '10 (Worst)' },
];

export const SymptomSelector: React.FC<SymptomSelectorProps> = ({
  context,
  onChange,
  onNextStep,
  onPrevStep,
}) => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [speechError, setSpeechError] = useState<string | null>(null);

  // Persistent ref for active SpeechRecognition instance
  const recognizerRef = useRef<{ start: () => void; stop: () => void } | null>(null);
  // Baseline draft note stored when dictation starts to preserve & append text
  const baseNoteRef = useRef<string>('');
  // Context ref to ensure latest context is available without closure race conditions
  const contextRef = useRef<SymptomContext>(context);
  contextRef.current = context;

  const speechSupported = isSpeechRecognitionSupported();

  // Cleanup active recognition session on unmount
  useEffect(() => {
    return () => {
      if (recognizerRef.current) {
        try {
          recognizerRef.current.stop();
        } catch (e) {
          // Ignore unmount stop errors
        }
        recognizerRef.current = null;
      }
    };
  }, []);

  const handlePainChange = (value: number) => {
    onChange({
      ...context,
      pain: value,
    });
  };

  const toggleSymptom = (symptom: string) => {
    let updatedSymptoms: string[];

    if (symptom === 'No new symptoms') {
      updatedSymptoms = ['No new symptoms'];
    } else {
      const currentFiltered = context.symptoms.filter(
        (s) => s !== 'No new symptoms'
      );
      if (currentFiltered.includes(symptom)) {
        updatedSymptoms = currentFiltered.filter((s) => s !== symptom);
      } else {
        updatedSymptoms = [...currentFiltered, symptom];
      }
    }

    onChange({
      ...context,
      symptoms: updatedSymptoms.length > 0 ? updatedSymptoms : ['No new symptoms'],
    });
  };

  const toggleVoiceRecording = () => {
    setSpeechError(null);

    // If currently recording, stop active instance cleanly
    if (isRecording) {
      if (recognizerRef.current) {
        try {
          recognizerRef.current.stop();
        } catch (e) {
          // Ignore
        }
        recognizerRef.current = null;
      }
      setIsRecording(false);
      return;
    }

    // Capture existing text before starting dictation
    baseNoteRef.current = contextRef.current.voiceNote || '';

    const recognizer = createSpeechRecognizer(
      (transcript) => {
        const base = baseNoteRef.current ? baseNoteRef.current.trim() : '';
        const cleanTranscript = transcript.trim();
        let combinedText = cleanTranscript;

        if (base) {
          const endsWithPunctuation = /[.!?]$/.test(base);
          combinedText = endsWithPunctuation
            ? `${base} ${cleanTranscript}`
            : `${base}. ${cleanTranscript}`;
        }

        onChange({
          ...contextRef.current,
          voiceNote: combinedText,
        });
      },
      (errorMsg) => {
        if (errorMsg) {
          setSpeechError(errorMsg);
        }
        setIsRecording(false);
        recognizerRef.current = null;
      },
      () => {
        setIsRecording(false);
        recognizerRef.current = null;
      }
    );

    if (recognizer) {
      recognizerRef.current = recognizer;
      setIsRecording(true);
      recognizer.start();
    } else {
      setSpeechError('Web Speech API is not supported in this browser. Please type your notes below.');
    }
  };

  // Color helper for pain slider
  const getPainColorClass = (pain: number) => {
    if (pain <= 3) return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800';
    if (pain <= 6) return 'text-amber-500 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800';
    return 'text-rose-500 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800';
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      {/* 1. Pain Scale Slider & Quick Preset Buttons */}
      <div className="bg-white dark:bg-surface-darkSoft p-5 rounded-3xl border border-surface-border dark:border-surface-darkBorder shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
            <Activity className="w-4 h-4 text-brand-500" />
            <span>Reported Pain Score</span>
          </label>
          <span
            className={`px-3 py-1 rounded-full text-xs font-extrabold border ${getPainColorClass(
              context.pain
            )}`}
          >
            {context.pain} / 10
          </span>
        </div>

        {/* Quick Pain Preset Tap Buttons */}
        <div className="grid grid-cols-5 gap-1.5 pt-1">
          {PAIN_PRESETS.map((preset) => (
            <button
              key={preset.val}
              type="button"
              onClick={() => handlePainChange(preset.val)}
              className={`py-1.5 rounded-xl text-[11px] font-bold border transition-all ${
                context.pain === preset.val
                  ? 'bg-brand-500 text-white border-brand-600 shadow-sm'
                  : 'bg-surface-soft dark:bg-surface-dark border-surface-border dark:border-surface-darkBorder text-slate-600 dark:text-slate-400 hover:border-brand-300'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <input
          type="range"
          min="0"
          max="10"
          value={context.pain}
          onChange={(e) => handlePainChange(parseInt(e.target.value, 10))}
          className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-500"
        />

        <div className="flex justify-between text-[11px] font-semibold text-slate-400">
          <span>0 (No Pain)</span>
          <span>5 (Moderate)</span>
          <span>10 (Severe)</span>
        </div>
      </div>

      {/* 2. Symptom Selectable Chips */}
      <div className="bg-white dark:bg-surface-darkSoft p-5 rounded-3xl border border-surface-border dark:border-surface-darkBorder shadow-sm space-y-3">
        <label className="text-sm font-bold text-slate-900 dark:text-slate-100 block">
          Observable Symptoms
        </label>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Select any changes or feelings observed around the recovery site:
        </p>

        <div className="flex flex-wrap gap-2 pt-1">
          {AVAILABLE_SYMPTOMS.map((symptom) => {
            const isSelected = context.symptoms.includes(symptom);

            return (
              <motion.button
                key={symptom}
                whileTap={{ scale: 0.96 }}
                onClick={() => toggleSymptom(symptom)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-semibold flex items-center space-x-2 transition-all border ${
                  isSelected
                    ? 'bg-brand-500 text-white border-brand-600'
                    : 'bg-surface-soft dark:bg-surface-dark border-surface-border dark:border-surface-darkBorder text-slate-700 dark:text-slate-300 hover:border-brand-300'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                    isSelected ? 'bg-white text-brand-600 font-bold' : 'border border-slate-400'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <span>{symptom}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* 3. Voice Note & Text Fallback */}
      <div className="bg-white dark:bg-surface-darkSoft p-5 rounded-3xl border border-surface-border dark:border-surface-darkBorder shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
            <Volume2 className="w-4 h-4 text-brand-500" />
            <span>Voice Note / Observations</span>
          </label>
          {speechSupported && (
            <button
              type="button"
              onClick={toggleVoiceRecording}
              className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                isRecording
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 border border-brand-200 dark:border-brand-800'
              }`}
            >
              {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-brand-500" />}
              <span>{isRecording ? 'Listening...' : 'Record Voice'}</span>
            </button>
          )}
        </div>

        {speechError && (
          <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
            {speechError}
          </p>
        )}

        <div className="relative">
          <textarea
            value={context.voiceNote || ''}
            onChange={(e) => onChange({ ...context, voiceNote: e.target.value })}
            placeholder="Tap 'Record Voice' or type your notes here (e.g. 'Dressed with clean gauze this morning, felt slight tightness...')"
            rows={3}
            className="w-full p-3.5 rounded-2xl bg-surface-soft dark:bg-surface-dark border border-surface-border dark:border-surface-darkBorder text-slate-900 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
          />
          <Edit3 className="w-4 h-4 text-slate-400 absolute bottom-3 right-3 pointer-events-none" />
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center space-x-3">
        <button
          type="button"
          onClick={onPrevStep}
          className="flex-1 py-3 px-4 rounded-2xl border border-surface-border dark:border-surface-darkBorder bg-white dark:bg-surface-darkSoft text-slate-700 dark:text-slate-200 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onNextStep}
          className="flex-1 py-3 px-4 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm transition-all"
        >
          Analyze Recovery
        </button>
      </div>
    </div>
  );
};
