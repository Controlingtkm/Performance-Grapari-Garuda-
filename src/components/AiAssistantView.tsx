import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  User, 
  Bot, 
  Loader2, 
  BookOpen, 
  MessageSquare, 
  ShieldAlert,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { apiService } from '../services/api';

interface AiAssistantViewProps {
  userRole: string;
}

export default function AiAssistantView({ userRole }: AiAssistantViewProps) {
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string }>>([
    { 
      sender: 'bot', 
      text: 'Halo! Saya adalah **Asisten AI Grapari Garuda**. Saya dilatih khusus untuk membantu Anda dalam pelayanan pelanggan, operasional lapangan, pemahaman SOP, penyusunan skrip percakapan, dan penanganan gangguan secara real-time.' 
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Quick suggestions for the Grapari context
  const suggestions = [
    { label: 'SOP Ganti Kartu Hilang', query: 'Tolong jelaskan langkah-langkah SOP ganti kartu hilang di Grapari.' },
    { label: 'SLA Gangguan No Signal', query: 'Berapa jam SLA penyelesaian keluhan "No Signal" oleh tim FOS?' },
    { label: 'Skrip Mengatasi Komplain Keras', query: 'Tuliskan draf skrip CS pembuka yang sopan saat menghadapi pelanggan komplain keras.' },
    { label: 'Sinyal Optik Indihome Ideal', query: 'Berapa nilai redaman dBm yang ideal untuk koneksi IndiHome?' }
  ];

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isAiLoading) return;

    setChatMessages(prev => [...prev, { sender: 'user', text: textToSend }]);
    setIsAiLoading(true);

    try {
      // Call standard Gemini-grounded Express endpoint
      const response = await apiService.askAiAssistant(textToSend, userRole);
      setChatMessages(prev => [...prev, { sender: 'bot', text: response }]);
    } catch (err) {
      setChatMessages(prev => [
        ...prev, 
        { 
          sender: 'bot', 
          text: 'Maaf, terjadi gangguan koneksi ke server AI Grapari Garuda. Mohon coba beberapa saat lagi atau pastikan koneksi internet stabil.' 
        }
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    const msg = inputMessage;
    setInputMessage('');
    handleSendMessage(msg);
  };

  const handleReset = () => {
    setChatMessages([
      { 
        sender: 'bot', 
        text: 'Halo! Saya adalah **Asisten AI Grapari Garuda**. Sesi obrolan telah direset. Silakan tanyakan hal-hal terkait SOP operasional, skrip penawaran, maupun standar kualifikasi layanan.' 
      }
    ]);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-left animate-fade-in">
      
      {/* 1. View Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-150 dark:border-zinc-900 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400 border border-red-500/10 mb-2.5 text-[10px] font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI ENGINE ACTIVE</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">Asisten AI Grapari Garuda</h2>
          <p className="text-xs text-gray-500 mt-1">Konsultasikan keluhan pelanggan, draf penawaran, standar teknis redaman IndiHome, dan panduan SOP layanan secara instan.</p>
        </div>
        
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 border border-gray-200 dark:border-zinc-800 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-900 cursor-pointer text-gray-600 dark:text-gray-300 transition-colors shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset Sesi Chat</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Side: Instructions & Suggested prompts */}
        <div className="space-y-4 lg:col-span-1">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/50 border border-gray-150 dark:border-zinc-850 space-y-3.5">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-red-500" />
              <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Topik Rekomendasi</h3>
            </div>
            
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Asisten AI dilatih dengan basis pengetahuan lokal Grapari Garuda, termasuk standar redaman fiber optik, tata cara ganti kartu, dan limit kontrol Halo+.
            </p>

            <div className="space-y-2 pt-2">
              {suggestions.map((sg, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(sg.query)}
                  disabled={isAiLoading}
                  className="w-full text-left p-2.5 rounded-xl border border-gray-200 dark:border-zinc-850 hover:border-red-500/30 hover:bg-red-50/5 dark:hover:bg-red-950/10 text-[10px] text-gray-600 dark:text-gray-400 font-semibold transition-all cursor-pointer group flex items-center justify-between gap-1.5"
                >
                  <span className="truncate">{sg.label}</span>
                  <ArrowRight className="w-3 h-3 text-gray-400 group-hover:translate-x-0.5 group-hover:text-red-500 transition-all shrink-0" />
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-yellow-500/15 bg-yellow-50/15 text-[10px] text-amber-800 dark:text-amber-400/80 leading-relaxed flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <span>Asisten AI ini khusus untuk konsumsi staf internal. Seluruh respon yang diberikan tunduk pada kepatuhan data pelanggan & etika pelayanan Grapari.</span>
          </div>
        </div>

        {/* Right Side: Main Chat Interface */}
        <div className="lg:col-span-3 apple-glass rounded-2xl p-5 border border-gray-150 dark:border-zinc-900 flex flex-col justify-between h-[520px]">
          
          {/* Active Title bar */}
          <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-zinc-900/60 text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-red-500" />
              <span className="font-bold text-gray-800 dark:text-white">Live Conversation Sesi</span>
            </div>
            <span className="text-[10px] font-mono bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400 px-2 py-0.5 rounded-full font-bold">
              Gemini 3.5 Flash
            </span>
          </div>

          {/* Chat Bubble List */}
          <div className="flex-1 overflow-y-auto space-y-4 p-2 my-4 scrollbar-thin scrollbar-thumb-zinc-200">
            {chatMessages.map((msg, index) => (
              <div 
                key={index} 
                className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                  msg.sender === 'user' 
                    ? 'bg-red-600 text-white' 
                    : 'bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-red-600'
                }`}>
                  {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className={`p-4 rounded-2xl text-xs text-left leading-relaxed shadow-xs ${
                  msg.sender === 'user' 
                    ? 'bg-red-600 text-white rounded-tr-none' 
                    : 'bg-slate-50 dark:bg-zinc-900/50 text-slate-800 dark:text-zinc-200 border border-gray-150 dark:border-zinc-900/60 rounded-tl-none markdown-body'
                }`}>
                  {/* Process markdown in a simple way or raw text with safe linebreaks */}
                  <div className="whitespace-pre-line prose prose-sm dark:prose-invert">
                    {msg.text.split('\n').map((line, lIdx) => {
                      // Basic bold matching for display
                      if (line.startsWith('### ')) {
                        return <h3 key={lIdx} className="text-sm font-extrabold text-slate-900 dark:text-white mt-3 mb-1.5">{line.replace('### ', '')}</h3>;
                      }
                      if (line.startsWith('- ')) {
                        return <div key={lIdx} className="pl-3 py-0.5 flex items-start gap-1.5">
                          <span className="text-red-500 shrink-0">•</span>
                          <span>{line.substring(2)}</span>
                        </div>;
                      }
                      return <p key={lIdx} className="mb-1.5 last:mb-0">{line}</p>;
                    })}
                  </div>
                </div>
              </div>
            ))}
            
            {isAiLoading && (
              <div className="flex gap-3 max-w-[85%] mr-auto items-center">
                <div className="w-8 h-8 rounded-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-red-600 flex items-center justify-center shrink-0 shadow-sm">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="flex items-center gap-2 p-3.5 rounded-2xl text-xs bg-slate-50 dark:bg-zinc-900/50 border border-gray-150 dark:border-zinc-900/60 text-gray-500 font-mono">
                  <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                  <span>Sedang merumuskan panduan SOP terbaik...</span>
                </div>
              </div>
            )}
          </div>

          {/* Active Input form */}
          <form onSubmit={onSubmit} className="flex gap-2.5 border-t border-gray-100 dark:border-zinc-900 pt-3.5">
            <input
              id="input-ai-view-chat"
              type="text"
              required
              disabled={isAiLoading}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Tanyakan standard SOP, skrip, draf respon keluhan..."
              className="flex-1 px-4 py-3 border border-gray-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 text-xs focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none text-slate-800 dark:text-white placeholder-gray-400"
            />
            <button 
              id="btn-send-ai-view-chat"
              type="submit"
              disabled={isAiLoading}
              className="px-5 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl cursor-pointer transition-all flex items-center justify-center shadow-md shrink-0 font-semibold text-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>

      </div>

    </div>
  );
}
