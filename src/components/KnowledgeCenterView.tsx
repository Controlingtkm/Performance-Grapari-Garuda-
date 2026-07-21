import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Send, 
  User, 
  Bot, 
  Loader2, 
  Bookmark, 
  FileCheck, 
  CornerDownRight,
  Sparkles
} from 'lucide-react';
import { apiService } from '../services/api';

interface KnowledgeCenterViewProps {
  userRole: string;
}

export default function KnowledgeCenterView({ userRole }: KnowledgeCenterViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'faq' | 'sop' | 'script' | 'ai'>('faq');
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(null);

  // AI chat states
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string }>>([
    { sender: 'bot', text: 'Halo! Saya adalah Asisten AI Grapari Garuda. Silakan tanyakan informasi mengenai SOP Ganti Kartu, PSB Indihome, SLA Lapangan, atau panduan kerja harian.' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Static Enterprise Knowledge Base data
  const faqs = [
    {
      id: 'faq-1',
      question: 'Bagaimana prosedur penanganan kartu Telkomsel hilang?',
      answer: 'Pelanggan wajib menunjukkan e-KTP fisik asli, melampirkan Surat Keterangan Hilang dari Kepolisian (jika nomor belum terdaftar biometrik/KTP baru), dan mengisi formulir pernyataan kepemilikan nomor di Grapari. Petugas CS wajib melakukan audit wajah/identitas visual.'
    },
    {
      id: 'faq-2',
      question: 'Apa syarat utama migrasi paket prabayar ke Halo?',
      answer: 'E-KTP yang valid, alamat email aktif, nomor kontak alternatif, dan deposit awal sebesar paket pilihan (bisa dikecualikan untuk pelanggan lama dengan rekam jejak loyalitas > 1 tahun).'
    },
    {
      id: 'faq-3',
      question: 'Berapa SLA penyelesaian keluhan tipe "No Signal" (Indihome)?',
      answer: 'Sesuai komitmen Grapari Garuda, keluhan tipe Technical (No Signal / Kabel Putus) memiliki SLA maksimal 12 jam kerja lapangan oleh tim FOS.'
    },
    {
      id: 'faq-4',
      question: 'Apa yang harus dilakukan jika nomor pelanggan terblokir karena salah PIN?',
      answer: 'Lakukan reset PUK via portal internal atau instruksikan pelanggan mengakses *116# dari nomor alternatif atau asisten Veronika.'
    }
  ];

  const sops = [
    {
      title: 'SOP 01: Ganti Kartu Hilang (Replacement)',
      steps: [
        'Verifikasi e-KTP fisik menggunakan reader kartu jika tersedia.',
        'Lakukan audit wajah pelanggan dan cocokkan dengan foto database.',
        'Input nomor MSISDN pada portal internal Grapari.',
        'Verifikasi 3 nomor terakhir yang sering dihubungi dalam 1 bulan terakhir.',
        'Cetak kartu SIM baru dan lakukan aktivasi profil.',
        'Simpan formulir fisik & digital ke Google Drive Arsip.'
      ]
    },
    {
      title: 'SOP 02: Instalasi Baru Indihome (PSB)',
      steps: [
        'Survey ketersediaan ODP di lokasi pelanggan.',
        'Lakukan penarikan dropcore maksimal 150 meter dari ODP terdekat.',
        'Instalasi ONT dan Set Top Box (STB) di dalam rumah pelanggan.',
        'Lakukan konfigurasi sinyal optik dengan standar dBm terbaik (-18 s/d -23 dBm).',
        'Pandu pelanggan melakukan sign-in MyIndihome untuk validasi aktivasi.',
        'Ambil foto bukti pemasangan dan koordinat GPS untuk pelaporan.'
      ]
    }
  ];

  const scripts = [
    {
      title: 'Skrip Pembuka Layanan CS (Greeting)',
      dialogue: '"Selamat pagi/siang/sore, selamat datang di Grapari Garuda Telkomsel Group. Dengan saya [Nama CS], ada yang bisa saya bantu untuk kenyamanan layanan Anda hari ini?"'
    },
    {
      title: 'Skrip Mengatasi Pelanggan Komplain Keras (De-eskalasi)',
      dialogue: '"Saya sangat memahami kekecewaan Bapak/Ibu mengenai kendala jaringan ini. Kami mohon maaf atas ketidaknyamanan yang terjadi. Mari kita periksa bersama status jaringannya, saya akan pastikan tim teknis kami memprioritaskan penyelesaian aduan ini hari ini."'
    },
    {
      title: 'Skrip Penawaran Migrasi Halo (Upselling)',
      dialogue: '"Melihat pemakaian kuota bulanan Bapak/Ibu yang tinggi, kami merekomendasikan paket Telkomsel Halo. Selain tagihan tetap, Bapak/Ibu akan mendapatkan prioritas jaringan 5G terluas tanpa khawatir kehabisan kuota."'
    }
  ];

  // Search filtering
  const filteredFaqs = faqs.filter(item => 
    item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSops = sops.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.steps.some(step => step.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredScripts = scripts.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.dialogue.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Submit message to AI
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isAiLoading) return;

    const userText = inputMessage;
    setChatMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setInputMessage('');
    setIsAiLoading(true);

    try {
      // Call standard Gemini-grounded Express endpoint
      const response = await apiService.askAiAssistant(userText, userRole);
      setChatMessages(prev => [...prev, { sender: 'bot', text: response }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { sender: 'bot', text: 'Maaf, terjadi gangguan koneksi ke server AI Grapari Garuda. Mohon coba beberapa saat lagi.' }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">Knowledge Center Grapari</h2>
        <p className="text-xs text-gray-500 mt-1">Pusat edukasi agen. Temukan jawaban FAQ, SOP Pelayanan, skrip percakapan, dan konsultasi dengan Asisten AI.</p>
      </div>

      {/* Subtab Navigation (Apple Style Segmented Control) */}
      <div className="flex bg-gray-100/80 dark:bg-zinc-900/50 p-1 rounded-xl max-w-md">
        <button
          id="btn-tab-faq"
          onClick={() => setActiveTab('faq')}
          className={`flex-1 text-center py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            activeTab === 'faq' 
              ? 'bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-xs' 
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-900'
          }`}
        >
          FAQ
        </button>
        <button
          id="btn-tab-sop"
          onClick={() => setActiveTab('sop')}
          className={`flex-1 text-center py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            activeTab === 'sop' 
              ? 'bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-xs' 
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-900'
          }`}
        >
          SOP Kerja
        </button>
        <button
          id="btn-tab-script"
          onClick={() => setActiveTab('script')}
          className={`flex-1 text-center py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            activeTab === 'script' 
              ? 'bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-xs' 
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-900'
          }`}
        >
          Skrip CS
        </button>
        <button
          id="btn-tab-ai"
          onClick={() => setActiveTab('ai')}
          className={`flex-1 text-center py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
            activeTab === 'ai' 
              ? 'bg-red-500 text-white shadow-xs' 
              : 'text-red-500 hover:bg-red-50/50 dark:hover:bg-red-950/10'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Asisten AI</span>
        </button>
      </div>

      {/* RENDER ACTIVE TAB */}
      {activeTab !== 'ai' ? (
        <div className="space-y-6">
          
          {/* SEARCH BOX FOR STATIC KNOWLEDGE */}
          <div className="apple-glass rounded-apple p-4 apple-shadow">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                id="input-search-knowledge"
                type="text"
                placeholder="Masukkan kata kunci pencarian SOP / FAQ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-100 dark:border-zinc-800 rounded-xl bg-white/50 dark:bg-zinc-900/40 text-xs focus:ring-1 focus:ring-red-500 outline-none"
              />
            </div>
          </div>

          {/* TAB FAQ PANEL */}
          {activeTab === 'faq' && (
            <div className="space-y-3">
              {filteredFaqs.map((faq) => {
                const isExpanded = expandedFaqId === faq.id;
                return (
                  <div 
                    key={faq.id} 
                    className="apple-glass rounded-apple p-4 apple-shadow border-l-4 border-l-gray-300 dark:border-l-zinc-800 text-left transition-all"
                  >
                    <button 
                      id={`btn-faq-toggle-${faq.id}`}
                      onClick={() => setExpandedFaqId(isExpanded ? null : faq.id)}
                      className="w-full flex justify-between items-center font-semibold text-xs text-gray-900 dark:text-white cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <HelpCircle className="w-4 h-4 text-red-500" />
                        <span>{faq.question}</span>
                      </div>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </button>
                    {isExpanded && (
                      <p className="mt-3.5 pl-6 text-xs text-gray-500 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-zinc-900 pt-3">
                        {faq.answer}
                      </p>
                    )}
                  </div>
                );
              })}
              {filteredFaqs.length === 0 && (
                <p className="text-center text-xs text-gray-400 py-12">Tidak menemukan FAQ.</p>
              )}
            </div>
          )}

          {/* TAB SOP PANEL */}
          {activeTab === 'sop' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              {filteredSops.map((sop, idx) => (
                <div key={idx} className="apple-glass rounded-apple p-5 apple-shadow space-y-4">
                  <div className="flex items-center gap-2 border-b border-gray-100 dark:border-zinc-900 pb-3">
                    <Bookmark className="w-4 h-4 text-red-500" />
                    <h3 className="text-xs font-bold text-gray-900 dark:text-white">{sop.title}</h3>
                  </div>
                  <ol className="space-y-3">
                    {sop.steps.map((step, sIdx) => (
                      <li key={sIdx} className="flex items-start gap-2.5 text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-red-50 text-red-500 dark:bg-red-950/20 dark:text-red-400 flex items-center justify-center font-mono text-[10px] font-bold">
                          {sIdx + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
              {filteredSops.length === 0 && (
                <p className="text-center text-xs text-gray-400 col-span-2 py-12">Tidak menemukan SOP.</p>
              )}
            </div>
          )}

          {/* TAB SCRIPTS PANEL */}
          {activeTab === 'script' && (
            <div className="space-y-4 text-left">
              {filteredScripts.map((sc, idx) => (
                <div key={idx} className="apple-glass rounded-apple p-5 apple-shadow">
                  <div className="flex items-center gap-2 border-b border-gray-100 dark:border-zinc-900 pb-2.5 mb-3">
                    <FileCheck className="w-4 h-4 text-blue-500" />
                    <h3 className="text-xs font-bold text-gray-900 dark:text-white">{sc.title}</h3>
                  </div>
                  <div className="flex gap-2 bg-blue-500/5 dark:bg-blue-500/10 p-3 rounded-xl border border-blue-500/10 italic text-xs text-gray-700 dark:text-gray-300 font-mono leading-relaxed">
                    <CornerDownRight className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <p>{sc.dialogue}</p>
                  </div>
                </div>
              ))}
              {filteredScripts.length === 0 && (
                <p className="text-center text-xs text-gray-400 py-12">Tidak menemukan skrip percakapan.</p>
              )}
            </div>
          )}

        </div>
      ) : (
        /* TAB AI CHAT ASSISTANT PANEL */
        <div className="apple-glass rounded-apple p-5 apple-shadow flex flex-col justify-between h-[480px]">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-900 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-red-500 animate-pulse" />
              <div className="text-left">
                <h3 className="text-xs font-bold text-gray-900 dark:text-white">Asisten AI Grapari Garuda</h3>
                <p className="text-[10px] text-gray-400">Grounded in local SOPs & FAQ repository</p>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-50 text-red-500 font-bold">
              Gemini 3.5 Flash
            </span>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 p-2 my-4">
            {chatMessages.map((msg, index) => (
              <div key={index} className={`flex gap-2.5 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                  msg.sender === 'user' ? 'bg-red-500 text-white' : 'bg-gray-100 dark:bg-zinc-800 text-red-500'
                }`}>
                  {msg.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                </div>
                <div className={`p-3 rounded-2xl text-xs text-left leading-relaxed ${
                  msg.sender === 'user' 
                    ? 'bg-red-500 text-white rounded-tr-none shadow-xs' 
                    : 'bg-gray-50 dark:bg-zinc-900/60 text-gray-800 dark:text-gray-300 border border-gray-100 dark:border-zinc-900/40 rounded-tl-none shadow-xs'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            
            {isAiLoading && (
              <div className="flex gap-2.5 max-w-[85%] mr-auto items-center">
                <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-zinc-800 text-red-500 flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="flex items-center gap-1.5 p-3 rounded-2xl text-xs bg-gray-50 dark:bg-zinc-900/60 border border-gray-100 dark:border-zinc-900/40 text-gray-400 font-mono">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-red-500" />
                  <span>Sedang memformulasikan SOP...</span>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendMessage} className="flex gap-2 border-t border-gray-100 dark:border-zinc-900 pt-3">
            <input
              id="input-ai-chat"
              type="text"
              required
              disabled={isAiLoading}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Tanyakan SOP Ganti Kartu, PSB, atau cara upsell..."
              className="flex-1 px-4 py-2.5 border border-gray-100 dark:border-zinc-800 rounded-xl bg-white/50 dark:bg-zinc-900/40 text-xs focus:ring-1 focus:ring-red-500 outline-none"
            />
            <button 
              id="btn-send-ai-chat"
              type="submit"
              disabled={isAiLoading}
              className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl cursor-pointer transition-all flex items-center justify-center shadow-md shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}

    </div>
  );
}
