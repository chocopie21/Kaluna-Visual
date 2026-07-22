import React, { useState, useEffect, useRef } from 'react';
import { Bot, X, Send, User, ExternalLink, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import './ChatBotButton.css';

const KNOWLEDGE_BASE = [
  {
    id: 'sapaan',
    keywords: ['halo', 'hai', 'pagi', 'siang', 'malam', 'permisi', 'bro', 'min', 'bot', 'siapa'],
    answer: "Halo! 👋 Saya **Asisten AI Ahmad Nafi** (Visual Creator & Digital Multimedia Designer).\n\nAda yang bisa saya bantu terkait karya portofolio, pengerjaan proyek fotografi/videografi, UI/UX, atau reservasi jadwal?",
    suggestions: ['📸 Layanan Kreatif', '🎓 Riwayat Pendidikan', '💰 Estimasi Harga']
  },
  {
    id: 'foto',
    keywords: ['foto', 'fotografi', 'photo', 'wisuda', 'graduation', 'event', 'acara', 'portrait', 'wisudawan', 'moto', 'motret', 'jepret'],
    answer: "📸 **Layanan Fotografi Ahmad Nafi**:\n• **Graduation & Wisuda**: Liputan foto individu/kelompok dengan color grading sinematik.\n• **Event & Acara**: Dokumentasi panggung, seminar, dan momen spesial.\n• **Portrait & Modeling**: Sesi foto konsep indoor / outdoor.\n\nSemua paket foto sudah termasuk editing & file high-resolution siap cetak!",
    suggestions: ['Berapa harganya?', 'Berapa lama pengerjaan?', 'Chat via WhatsApp']
  },
  {
    id: 'video',
    keywords: ['video', 'videografi', 'cinematic', 'reels', 'tiktok', 'iklan', 'commercial', 'editing', 'drone', 'shorcut', 'shorts'],
    answer: "🎬 **Layanan Videografi & Editing**:\n• **Video Sinematik**: Profile company, teaser event, & short movie.\n• **Social Media Reels / Shorts**: Video vertikal 9:16 kreatif untuk branding TikTok & Instagram.\n• **Video Commercial**: Iklan produk & promosi brand.\n\nDilengkapi perekaman resolusi 4K & animasi grafis drone aerial!",
    suggestions: ['Kamera & Drone apa?', 'Berapa lama edit video?']
  },
  {
    id: 'desain',
    keywords: ['desain', 'design', 'grafis', 'graphic', 'logo', 'branding', 'feed', 'poster', 'pamflet', 'banner'],
    answer: "🎨 **Layanan Desain Grafis & Visual Branding**:\n• **Identity Branding**: Pembuatan logo, warna brand, & visual style guide.\n• **Social Media Content**: Layout Feed/Story Instagram yang rapi & estetik.\n• **Media Cetak & Digital**: Poster promosi, flyer, & merchandise.",
    suggestions: ['Layanan UI/UX', 'Hubungi WhatsApp']
  },
  {
    id: 'uiux',
    keywords: ['ui', 'ux', 'web', 'website', 'aplikasi', 'app', 'mobile', 'figma', 'prototype', 'tampilan'],
    answer: "📱 **Layanan UI/UX Design & Web Development**:\n• **UI/UX Prototype**: Perancangan wireframe & desain antarmuka interaktif di Figma.\n• **Web Development**: Pembuatan website portofolio, landing page modern, & aplikasi web responsif berkinerja tinggi (React/Vite/Lenis).",
    suggestions: ['Pengalaman kerja Nafi', 'Diskusi proyek website']
  },
  {
    id: 'harga',
    keywords: ['harga', 'biaya', 'tarif', 'price', 'budget', 'paket', 'bayar', 'sewa', 'berapa', 'ongkos', 'pricelist'],
    answer: "💰 **Estimasi Biaya & Penawaran Paket**:\nUntuk mendapatkan **pricelist terlengkap** atau konsultasi penyesuaian budget proyek kamu, kamu bisa mengobrol langsung dengan Nafi via WhatsApp ya! Penawaran harga bersifat fleksibel menyesuaikan konsep visual kamu.",
    action: { label: 'Dapatkan Pricelist via WhatsApp', url: 'https://wa.me/6283815906766?text=Halo%20Nafi,%20saya%20ingin%20tanya%20pricelist%20jasa' },
    suggestions: ['Ketentuan Pembayaran / DP', 'Berapa lama pengerjaan?']
  },
  {
    id: 'alat',
    keywords: ['kamera', 'camera', 'gear', 'dji', 'sony', 'lens', 'lensa', 'drone', 'aerial', 'alat', 'shooting', 'record'],
    answer: "📷 **Gear & Kamera Tempur**:\nUntuk menjamin hasil visual premium (Full HD/4K), Ahmad Nafi menggunakan ekosistem kamera profesional **Sony** (kamera & lensa premium) serta **DJI Drone** untuk pengambilan footage udara yang sinematik.",
    suggestions: ['Lihat karya foto', 'Lihat karya video']
  },
  {
    id: 'durasi',
    keywords: ['durasi', 'waktu', 'lama', 'hari', 'timeline', 'deadline', 'kapan', 'selesai', 'cepat', 'pengerjaan', 'proses'],
    answer: "⏱️ **Estimasi Waktu Pengerjaan (Timeline)**:\n• 📸 **Foto Wisuda**: Selesai dalam **1-2 hari**.\n• 📸 **Foto Event / Acara**: Selesai dalam **3 hari**.\n• 🎬 **Video Reels / Teaser**: Selesai dalam **3-5 hari**.\n• 🎨 **Desain Logo / UI/UX**: Selesai dalam **1-3 hari**.\n\n*Catatan: Durasi pengerjaan dihitung sejak sesi produksi selesai / aset terkumpul.*",
    suggestions: ['Ketentuan Pembayaran / DP', 'Hubungi WhatsApp Nafi']
  },
  {
    id: 'dp',
    keywords: ['dp', 'booking', 'pembayaran', 'down payment', 'rekening', 'lunas', 'transfer', 'tata cara', 'sistem'],
    answer: "📅 **Sistem Pembayaran & Booking Jadwal**:\n• **Down Payment (DP)**: Minimal **50% di awal** untuk mengamankan slot tanggal jadwal kerja.\n• **Pelunasan**: Dilakukan setelah proyek selesai dan file final siap dikirimkan kepada kamu.",
    suggestions: ['Hubungi WhatsApp Nafi', 'Berapa lama pengerjaan?']
  },
  {
    id: 'pendidikan',
    keywords: ['kuliah', 'pendidikan', 'jurusan', 'sekolah', 'edukasi', 'telkom', 'sman 6', 'smpn 5', 'studi', 'mahasiswa'],
    answer: "🎓 **Status & Riwayat Pendidikan**:\nSaat ini Ahmad Nafi adalah **mahasiswa aktif** di **Telkom University** (S1 Terapan Digital Creative Multimedia, 2024 - Sekarang).\n\nSebelumnya, Nafi lulus dari SMAN 6 Karawang (2021 - 2024) dan SMPN 5 Karawang (2018 - 2021).",
    suggestions: ['Tawaran freelance / magang', 'Pengalaman kerja']
  },
  {
    id: 'pengalaman',
    keywords: ['pengalaman', 'kerja', 'kaluna', 'bisnis', 'karir', 'usul', 'portofolio', 'karya'],
    answer: "💼 **Pengalaman Profesional**:\n• **Co-Founder & Visual Creator** di *Kaluna Visual* (2023 - Sekarang) – Mengelola tim produksi fotografi & videografi wisuda.\n• **Graphic & UI/UX Designer** (2024 - Sekarang) – Mengerjakan proyek desain brand & produk digital interaktif.",
    suggestions: ['Tawaran freelance / magang', 'Hubungi Nafi']
  },
  {
    id: 'freelance',
    keywords: ['freelance', 'kontrak', 'bulanan', 'magang', 'internship', 'fulltime', 'remote', 'kerja sama', 'hire'],
    answer: "💼 **Ketersediaan Kerja Jangka Panjang & Magang**:\nSebagai mahasiswa aktif, Ahmad Nafi sangat terbuka untuk tawaran freelance bulanan, magang, atau kolaborasi visual lainnya. \n\nUntuk mencocokkan jadwal kuliah dan detail kontrak kerja, silakan hubungi langsung via WhatsApp untuk diskusi lebih lanjut!",
    action: { label: 'Diskusikan Kerja Sama via WA', url: 'https://wa.me/6283815906766?text=Halo%20Nafi,%20saya%20tertarik%20untuk%20menawarkan%20kerja%20sama%20freelance/magang' },
    suggestions: ['Kontak resmi', 'Domisili di mana?']
  },
  {
    id: 'lokasi',
    keywords: ['lokasi', 'alamat', 'tinggal', 'domisili', 'daerah', 'dimana', 'di mana', 'kota', 'karawang', 'bandung'],
    answer: "📍 **Domisili & Jangkauan Kerja**:\nAhmad Nafi berbasis di **Karawang & Bandung, Jawa Barat**.\n\nNafi siap menerima panggilan pekerjaan untuk luar kota maupun luar pulau!",
    suggestions: ['Chat via WhatsApp', 'Layanan fotografi']
  },
  {
    id: 'kontak',
    keywords: ['kontak', 'hubungi', 'wa', 'whatsapp', 'email', 'nomor', 'no hp', 'telepon', 'pesan'],
    answer: "✉️ **Kontak Resmi Ahmad Nafi**:\n• 📲 **WhatsApp**: +62 838-1590-6766\n• 📧 **Email**: ahmadnafi.creative@gmail.com\n\nNafi siap merespons pesan kamu!",
    action: { label: 'Buka WhatsApp Nafi', url: 'https://wa.me/6283815906766' },
    suggestions: ['Estimasi harga', 'Layanan kreatif']
  }
];

const DEFAULT_RESPONSE = {
  answer: "Pertanyaan kamu sangat menarik! Mengenai detail pengerjaan, penyesuaian konsep visual, atau booking tanggal acara, kamu bisa berkonsultasi langsung dengan Ahmad Nafi via WhatsApp.",
  action: { label: 'Tanya Langsung via WhatsApp', url: 'https://wa.me/6283815906766?text=Halo%20Nafi,%20saya%20ingin%20berkonsultasi' },
  suggestions: ['📸 Layanan Fotografi', '🎬 Layanan Videografi', '⏱️ Durasi Pengerjaan']
};

export default function ChatBotButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: "Halo! 👋 Saya **Asisten AI Ahmad Nafi**.\nAda yang ingin kamu tanyakan terkait portofolio, layanan visual, atau diskusi proyek?",
      suggestions: ['📸 Layanan Kreatif', '🎓 Pendidikan & Pengalaman', '💰 Estimasi Harga']
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping]);

  const findBestAnswer = (query) => {
    const cleanQuery = query.toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    
    const queryWords = cleanQuery.split(' ').filter(w => w.length > 1);
    
    let bestMatch = null;
    let maxScore = 0;

    for (const item of KNOWLEDGE_BASE) {
      let score = 0;
      for (const kw of item.keywords) {
        const kwLower = kw.toLowerCase();
        
        // 1. Direct phrase matching (high priority)
        if (cleanQuery.includes(kwLower)) {
          score += kwLower.length * 3;
        }
        
        // 2. Individual word matching
        for (const qw of queryWords) {
          if (qw === kwLower) {
            score += 5;
          } else if (kwLower.includes(qw) && qw.length > 2) {
            score += qw.length;
          }
        }
      }
      if (score > maxScore) {
        maxScore = score;
        bestMatch = item;
      }
    }

    return bestMatch || DEFAULT_RESPONSE;
  };

  const handleSend = (textToSend) => {
    const query = (textToSend || inputValue).trim();
    if (!query) return;

    const userMsg = { id: Date.now(), sender: 'user', text: query };
    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      const match = findBestAnswer(query);
      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: match.answer,
        action: match.action,
        suggestions: match.suggestions
      };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 500);
  };

  return (
    <div className="bot-glass-wrapper">
      {/* 3D GlassIcon Floating Button */}
      <motion.button
        className="bot-glass-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Tanya Chat Bot"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
        <div className="bot-glass-back"></div>
        <div className="bot-glass-front">
          {isOpen ? <X size={26} className="bot-glass-icon" /> : <Bot size={26} className="bot-glass-icon" />}
        </div>
        <div className="bot-glass-tooltip">
          <Sparkles size={12} style={{ color: '#c084fc' }} />
          <span>Chat Bot</span>
        </div>
      </motion.button>

      {/* Chat Window Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="bot-chat-container"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Header */}
            <div className="bot-chat-header">
              <div className="bot-chat-header-info">
                <div className="bot-chat-avatar">
                  <Bot size={20} />
                </div>
                <div>
                  <h4 className="bot-chat-title">Nafi AI Assistant</h4>
                  <span className="bot-chat-status">
                    <span className="bot-online-dot"></span> Online & Siap Membantu
                  </span>
                </div>
              </div>
              <button className="bot-chat-close-btn" onClick={() => setIsOpen(false)} aria-label="Tutup Chat">
                <X size={18} />
              </button>
            </div>

            {/* Messages List */}
            <div className="bot-chat-messages">
              {messages.map(msg => (
                <div key={msg.id} className={`bot-bubble-wrapper ${msg.sender}`}>
                  <div className="bot-bubble-icon">
                    {msg.sender === 'bot' ? <Bot size={14} /> : <User size={14} />}
                  </div>
                  <div className="bot-bubble-content">
                    <div className="bot-bubble-text" dangerouslySetInnerHTML={{ __html: formatMarkdown(msg.text) }} />
                    
                    {msg.action && (
                      <a href={msg.action.url} target="_blank" rel="noopener noreferrer" className="bot-action-btn">
                        <span>{msg.action.label}</span>
                        <ExternalLink size={14} />
                      </a>
                    )}

                    {msg.suggestions && msg.suggestions.length > 0 && (
                      <div className="bot-suggestions-list">
                        {msg.suggestions.map((sug, idx) => (
                          <button key={idx} className="bot-suggestion-chip" onClick={() => handleSend(sug)}>
                            {sug}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="bot-bubble-wrapper bot">
                  <div className="bot-bubble-icon">
                    <Bot size={14} />
                  </div>
                  <div className="bot-bubble-content">
                    <div className="bot-typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Footer Input Form */}
            <form className="bot-chat-footer" onSubmit={(e) => { e.preventDefault(); handleSend(); }}>
              <input
                type="text"
                className="bot-chat-input"
                placeholder="Tulis pertanyaan kamu..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <button type="submit" className="bot-chat-send-btn" disabled={!inputValue.trim()} aria-label="Kirim Pesan">
                <Send size={16} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function formatMarkdown(text) {
  if (!text) return '';
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br />');
}
