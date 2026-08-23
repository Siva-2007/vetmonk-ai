import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  Dog,
  Shield,
  AlertTriangle,
  BookOpen,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Globe,
  Info,
  Clock,
  HeartHandshake
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { VoiceRecorder } from '../components/VoiceRecorder';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { LanguageSelector } from '../components/LanguageSelector';
import api from '../services/api';

export const AiChatPage = () => {
  const { user } = useAuth();
  const { error } = useToast();
  const { language, t } = useLanguage();

  const [pets, setPets] = useState([]);
  const [selectedPetId, setSelectedPetId] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello! I am your VetMonk AI Veterinary Healthcare Assistant. I can assist with pet care education, explaining clinical terminology, nutrition, and vaccination protocols.\n\n*How may I assist you and your pet today?*`,
      triageLevel: 'LOW',
      groundedSources: ['WSAVA Global Veterinary Guidelines', 'AAHA Preventive Care Guidelines'],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [emergencyAlert, setEmergencyAlert] = useState(null);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    const fetchPets = async () => {
      try {
        const res = await api.get('/pets');
        setPets(res.data);
      } catch (err) {
        // Non-fatal if staff or no pets yet
      }
    };
    fetchPets();
  }, []);

  // Web Speech Voice Recorder integration
  const { isListening, isSpeaking, toggleListening, speakText, stopSpeaking, supported } = VoiceRecorder({
    onTranscript: (transcript) => {
      setInput(transcript);
    }
  });

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userQuery = input.trim();
    setInput('');
    setEmergencyAlert(null);

    const newMessages = [
      ...messages,
      {
        role: 'user',
        content: userQuery,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
    setMessages(newMessages);
    setLoading(true);

    try {
      const payload = {
        message: userQuery,
        petId: selectedPetId ? Number(selectedPetId) : null,
        language: language || 'en',
        history: newMessages.slice(-6).map(m => ({ role: m.role, content: m.content }))
      };

      const res = await api.post('/ai/chat', payload);

      const aiResponse = {
        role: 'assistant',
        content: res.data.response,
        triageLevel: res.data.triageLevel,
        emergencyAlert: res.data.emergencyAlert,
        groundedSources: res.data.groundedSources,
        suggestedAction: res.data.suggestedAction,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, aiResponse]);

      if (res.data.emergencyAlert) {
        setEmergencyAlert(res.data.response);
      }

      // Auto read aloud if voice synthesis is active
      if (isSpeaking) {
        speakText(res.data.response);
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Unable to communicate with AI Assistant. Please try again.';
      error(errMsg);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'I apologize, but I encountered an error processing your request. Please try asking again.',
          triageLevel: 'LOW',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col h-[calc(100vh-140px)] min-h-[580px] bg-white rounded-3xl border border-slate-200/80 shadow-md overflow-hidden">
      {/* Chat Header */}
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/70 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-emerald-400 text-white flex items-center justify-center shadow-md shadow-brand-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-slate-900 leading-none">
                VetMonk AI Healthcare Assistant
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                RAG Active
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Multi-tier safety triage • Grounded veterinary knowledge • Multilingual
            </p>
          </div>
        </div>

        {/* Pet Context Selector & Language Picker */}
        <div className="flex items-center gap-3">
          {pets.length > 0 && (
            <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs text-xs font-semibold text-slate-700">
              <Dog className="w-3.5 h-3.5 text-brand-600 shrink-0" />
              <select
                value={selectedPetId}
                onChange={(e) => setSelectedPetId(e.target.value)}
                aria-label="Attach pet medical context"
                className="bg-transparent focus:outline-none cursor-pointer pr-1 text-xs"
              >
                <option value="">No Pet Context</option>
                {pets.map((p) => (
                  <option key={p.id} value={p.id}>
                    Patient: {p.name} ({p.species})
                  </option>
                ))}
              </select>
            </div>
          )}

          <LanguageSelector variant="compact" />
        </div>
      </div>

      {/* Emergency Alert Banner if Triggered */}
      {emergencyAlert && (
        <div className="p-4 bg-rose-600 text-white flex items-start gap-3.5 shadow-md animate-in slide-in-from-top duration-300">
          <AlertTriangle className="w-6 h-6 text-white shrink-0 mt-0.5 animate-bounce" />
          <div className="text-xs sm:text-sm">
            <p className="font-extrabold uppercase tracking-wider">CRITICAL EMERGENCY TRIAGE</p>
            <p className="mt-0.5 leading-relaxed font-medium">{emergencyAlert}</p>
          </div>
        </div>
      )}

      {/* Messages Scroll Container */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/40">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'} space-y-1`}
          >
            <div className="flex items-center gap-2 px-1 text-[11px] font-semibold text-slate-400">
              <span>{m.role === 'user' ? user?.name || 'You' : 'VetMonk AI'}</span>
              <span>•</span>
              <span>{m.timestamp}</span>
              {m.triageLevel && m.role === 'assistant' && (
                <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                  m.triageLevel === 'HIGH' ? 'bg-rose-100 text-rose-800' : 'bg-slate-200 text-slate-700'
                }`}>
                  Triage: {m.triageLevel}
                </span>
              )}
            </div>

            <div
              className={`max-w-2xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-xs ${
                m.role === 'user'
                  ? 'bg-brand-600 text-white rounded-br-xs'
                  : m.triageLevel === 'HIGH'
                  ? 'bg-rose-50 border border-rose-200 text-rose-950 rounded-bl-xs'
                  : 'bg-white border border-slate-200/80 text-slate-800 rounded-bl-xs'
              }`}
            >
              <p className="whitespace-pre-line">{m.content}</p>

              {/* RAG Knowledge Source Citations */}
              {m.groundedSources && m.groundedSources.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-200/60 text-[11px] text-slate-500">
                  <div className="flex items-center gap-1 font-bold text-slate-700 mb-1">
                    <BookOpen className="w-3 h-3 text-brand-600" />
                    <span>Grounded Veterinary Sources:</span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-600">
                    {m.groundedSources.map((src, sIdx) => (
                      <li key={sIdx}>{src}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Read Aloud Voice Output Button */}
              {m.role === 'assistant' && (
                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-end">
                  <button
                    onClick={() => speakText(m.content)}
                    className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-brand-600 transition"
                    title="Read aloud"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Read Aloud</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 animate-spin-slow" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-4 text-xs font-medium text-slate-500 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
              <span>Analyzing query with RAG knowledge grounding and clinical safety guardrails...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-100">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2 sm:gap-3">
          {/* Voice Mic Button */}
          <button
            type="button"
            onClick={toggleListening}
            className={`p-3 rounded-2xl transition duration-200 shrink-0 ${
              isListening
                ? 'bg-rose-600 text-white animate-pulse ring-4 ring-rose-200'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
            title={isListening ? "Listening... click to stop" : "Voice input (Speak to ask)"}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isListening ? "Listening to your voice..." : t('askAiPlaceholder')}
            disabled={loading}
            className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
          />

          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="p-3 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl shadow-md shadow-brand-500/20 transition duration-200 disabled:opacity-50 shrink-0"
            title="Send question"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>

        <p className="text-[10px] text-slate-400 text-center mt-2">
          {t('disclaimer')}
        </p>
      </div>
    </div>
  );
};
