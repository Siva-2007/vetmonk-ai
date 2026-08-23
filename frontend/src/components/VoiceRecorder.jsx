import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const VoiceRecorder = ({ onTranscript, onAudioPlaybackStart, onAudioPlaybackEnd }) => {
  const { language } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      // Map app language to speech recognition locale
      const langMap = {
        en: 'en-US',
        ta: 'ta-IN',
        hi: 'hi-IN',
        te: 'te-IN',
        ml: 'ml-IN',
        kn: 'kn-IN',
      };
      recognition.lang = langMap[language] || 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript && onTranscript) {
          onTranscript(transcript);
        }
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      setSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [language, onTranscript]);

  const toggleListening = () => {
    if (!supported || !recognitionRef.current) {
      alert("Web Speech recognition is not supported by your current browser. Please use standard text input.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.warn("Could not start recognition:", err);
      }
    }
  };

  const speakText = (text) => {
    if (!window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const langMap = {
      en: 'en-US',
      ta: 'ta-IN',
      hi: 'hi-IN',
      te: 'te-IN',
      ml: 'ml-IN',
      kn: 'kn-IN',
    };
    utterance.lang = langMap[language] || 'en-US';

    utterance.onstart = () => {
      setIsSpeaking(true);
      if (onAudioPlaybackStart) onAudioPlaybackStart();
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      if (onAudioPlaybackEnd) onAudioPlaybackEnd();
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  return {
    isListening,
    isSpeaking,
    supported,
    toggleListening,
    speakText,
    stopSpeaking,
    VoiceButton: () => (
      <button
        type="button"
        onClick={toggleListening}
        className={`p-3 rounded-full transition-all duration-300 shadow-md ${
          isListening
            ? 'bg-rose-600 text-white animate-pulse ring-4 ring-rose-300 scale-105'
            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
        }`}
        title={isListening ? "Listening... Click to stop" : "Tap to Speak (Voice Query)"}
      >
        {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
      </button>
    ),
    SpeechOutputButton: ({ text }) => (
      <button
        type="button"
        onClick={() => (isSpeaking ? stopSpeaking() : speakText(text))}
        className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-brand-50 transition"
        title={isSpeaking ? "Stop Speaking" : "Read response aloud (Voice output)"}
      >
        {isSpeaking ? <VolumeX className="w-4 h-4 text-rose-500 animate-pulse" /> : <Volume2 className="w-4 h-4" />}
      </button>
    )
  };
};
