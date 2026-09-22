import React, { useState } from 'react';
import { BookOpen, ShieldAlert, ChevronDown, ChevronUp, Camera, HelpCircle, AlertTriangle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FAQItem {
  question: string;
  answer: string;
  category: 'Safety' | 'Guidance' | 'Limitations';
}

const FAQS: FAQItem[] = [
  {
    question: 'Can a phone image confirm infection?',
    answer:
      'No. A phone image alone cannot confirm whether bacteria or another pathogen is present. WoundWatch tracks observable changes and user-reported symptoms. If symptoms worsen or you are concerned, seek qualified medical care.',
    category: 'Safety',
  },
  {
    question: 'Why take images from the same angle?',
    answer:
      'Consistent lighting, distance and angle make visual comparisons more meaningful. WoundWatch is designed to help observe change over time rather than interpret one image in isolation.',
    category: 'Guidance',
  },
  {
    question: 'What does WoundWatch not do?',
    answer:
      'It does not diagnose infection, identify pathogens, prescribe medication, recommend antibiotics, or replace professional clinical decision-making.',
    category: 'Limitations',
  },
  {
    question: 'Why does reported pain score matter?',
    answer:
      'Pain trends over time provide essential context alongside visual signals. Sudden increases in pain or swelling often indicate a need for professional evaluation.',
    category: 'Guidance',
  },
];

export const CareGuidePage: React.FC = () => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="space-y-6 pb-24 md:pb-8 max-w-2xl mx-auto">
      {/* Page Header */}
      <div className="bg-white dark:bg-surface-darkSoft p-6 rounded-3xl border border-surface-border dark:border-surface-darkBorder shadow-sm space-y-2">
        <div className="flex items-center space-x-2">
          <BookOpen className="w-6 h-6 text-indigo-500" />
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Educational CareGuide
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Clear safety guidelines, photography best practices, and educational answers.
        </p>
      </div>

      {/* Safety Notice Banner */}
      <div className="bg-amber-50 dark:bg-amber-950/40 p-5 rounded-3xl border border-amber-200 dark:border-amber-800 space-y-2">
        <div className="flex items-center space-x-2 text-amber-900 dark:text-amber-200">
          <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
          <h3 className="font-bold text-sm">Important Safety Notice</h3>
        </div>
        <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
          WoundWatch AI is strictly an observation & tracking companion. If you experience fever, rapidly spreading redness, foul discharge, or severe pain, please consult a qualified healthcare provider immediately.
        </p>
      </div>

      {/* Accordion List */}
      <div className="space-y-3">
        {FAQS.map((faq, index) => {
          const isExpanded = expandedIndex === index;

          return (
            <div
              key={index}
              className="bg-white dark:bg-surface-darkSoft rounded-2xl border border-surface-border dark:border-surface-darkBorder overflow-hidden shadow-sm transition-colors"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full p-4 text-left flex items-center justify-between font-bold text-sm text-slate-900 dark:text-white hover:text-brand-500 transition-colors"
              >
                <span className="flex items-center space-x-2">
                  <HelpCircle className="w-4 h-4 text-brand-500 shrink-0" />
                  <span>{faq.question}</span>
                </span>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                )}
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="p-4 pt-0 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800 bg-surface-soft/50 dark:bg-surface-dark/50">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Photography Tips Card */}
      <div className="bg-white dark:bg-surface-darkSoft p-5 rounded-3xl border border-surface-border dark:border-surface-darkBorder shadow-sm space-y-3">
        <div className="flex items-center space-x-2 text-brand-600 dark:text-brand-400">
          <Camera className="w-5 h-5" />
          <h3 className="font-bold text-sm">Best Practices for Consistent Checks</h3>
        </div>

        <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-2 list-disc list-inside leading-relaxed">
          <li>Keep light source bright and consistent (avoid harsh dark shadows).</li>
          <li>Hold phone approximately 15–20 cm away at a 90° straight-on angle.</li>
          <li>Log observations around the same time each day (e.g. morning check).</li>
          <li>Record pain level honestly to build an accurate longitudinal history.</li>
        </ul>
      </div>
    </div>
  );
};
