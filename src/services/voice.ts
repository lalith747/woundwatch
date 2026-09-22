// Web Speech API interface declarations
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

export function isSpeechRecognitionSupported(): boolean {
  return typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
}

export function createSpeechRecognizer(
  onResult: (transcript: string) => void,
  onError: (error: string | null) => void,
  onEnd: () => void
): { start: () => void; stop: () => void } | null {
  if (!isSpeechRecognitionSupported()) {
    return null;
  }

  const windowWithSpeech = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  };

  const SpeechRecognitionClass = windowWithSpeech.SpeechRecognition || windowWithSpeech.webkitSpeechRecognition;

  if (!SpeechRecognitionClass) {
    return null;
  }

  try {
    const recognition = new SpeechRecognitionClass();
    recognition.continuous = true;  // Keep mic open until user explicitly stops
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      // Only accumulate final (not interim) segments to prevent duplicated text
      // when continuous mode delivers multiple result chunks.
      let finalTranscript = '';
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript.trim()) {
        onResult(finalTranscript);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      const err = event.error;
      // Handle non-fatal pause events silently without surfacing technical strings
      if (err === 'no-speech' || err === 'aborted') {
        onError(null); // Silent handling
      } else if (err === 'not-allowed' || err === 'service-not-allowed') {
        onError('Microphone permission denied. Please allow microphone access in browser settings.');
      } else if (err === 'audio-capture') {
        onError('No microphone hardware detected.');
      } else {
        onError('Speech input interrupted. Please try speaking again or type your note.');
      }
    };

    recognition.onend = () => {
      onEnd();
    };

    return {
      start: () => {
        try {
          recognition.start();
        } catch (e) {
          onError('Could not start speech input.');
        }
      },
      stop: () => {
        try {
          recognition.stop();
        } catch (e) {
          // Ignore stop errors if already stopped
        }
      },
    };
  } catch (err) {
    return null;
  }
}
