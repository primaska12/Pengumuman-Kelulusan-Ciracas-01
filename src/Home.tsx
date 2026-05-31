/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  GraduationCap, 
  School, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  CalendarDays,
  BadgeCheck,
  ChevronLeft,
  ShieldCheck,
  User,
  BookOpen
} from 'lucide-react';

interface StudentResult {
  nama: string;
  nisn: string;
  tempatLahir?: string;
  tglLahir?: string;
  nilaiMatematika?: string;
  nilaiBIndonesia?: string;
  noPeserta: string;
  kelas: string;
  sekolah: string;
  status: string;
  tahunAjaran: string; // added
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<StudentResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [prankMessage, setPrankMessage] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [appMessage, setAppMessage] = useState('');
  const [appFailMessage, setAppFailMessage] = useState('');
  const [releaseDate, setReleaseDate] = useState<Date | null>(null);
  const [countdownData, setCountdownData] = useState<{days: string, hours: string, minutes: string, seconds: string} | null>(null);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(data => {
        if (data.message) setAppMessage(data.message);
        if (data.failMessage) setAppFailMessage(data.failMessage);
        if (data.releaseDate) {
          setReleaseDate(new Date(data.releaseDate));
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!releaseDate) return;

    const interval = setInterval(() => {
      const now = new Date();
      const diff = releaseDate.getTime() - now.getTime();
      
      if (diff <= 0) {
        setIsLocked(false);
        setCountdownData(null);
        clearInterval(interval);
      } else {
        setIsLocked(true);
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        
        setCountdownData({
          days: String(days).padStart(2, '0'),
          hours: String(hours).padStart(2, '0'),
          minutes: String(minutes).padStart(2, '0'),
          seconds: String(seconds).padStart(2, '0')
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [releaseDate]);

  // Set today's date formatted nicely
  const currentDate = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date());

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || isLocked) return;

    setIsLoading(true);
    setError(null);
    setSearchResult(null);
    setPrankMessage(null);

    try {
      const res = await fetch(`/api/students/search?q=${encodeURIComponent(searchQuery.trim())}`);
      const data = await res.json();
      
      if (res.ok) {
        if (data.isPranked) {
          const prankKey = `prank_v4_${data.nisn || data.noPeserta}`;
          const prankCount = parseInt(localStorage.getItem(prankKey) || '0', 10);
          
          if (prankCount === 0) {
            setPrankMessage(`Halo ${data.nama},\n\nData ditemukan… namun sistem mendeteksi jantung Anda berdetak terlalu cepat. Coba lagi 😅`);
            localStorage.setItem(prankKey, (prankCount).toString());
            setIsLoading(false);
            return;
          } 
        }
        setSearchResult(data);
      } else {
        setError(data.error || 'Data siswa tidak ditemukan.');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat mencari data. Coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetSearch = () => {
    setSearchResult(null);
    setError(null);
    setPrankMessage(null);
    setSearchQuery('');
  };

  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-[#FAFBFF] text-slate-900 flex flex-col font-sans overflow-hidden relative selection:bg-blue-500/30">
      
      {/* --- Ambient Background Elements --- */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden flex items-center justify-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] w-[800px] h-[800px] bg-blue-400/20 rounded-full blur-[140px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[40%] w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[140px]" />
      </div>

      {/* --- Top Navigation Bar --- */}
      <nav className="relative z-10 w-full px-6 md:px-10 py-6 hidden sm:flex justify-between items-center bg-transparent">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl border border-slate-200 flex items-center justify-center shadow-sm">
            <School className="w-6 h-6 text-blue-600" />
          </div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900">SDN CIRACAS 01</h1>
        </div>
        
        <button 
          onClick={() => navigate('/admin')}
          className="text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors uppercase tracking-widest px-5 py-2.5 border border-slate-200 rounded-full shadow-sm hover:shadow-md bg-white hover:border-blue-100"
        >
          Admin Login
        </button>
      </nav>

      {/* --- Main Content Section --- */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 pt-4 sm:pt-4 pb-12 md:pb-32 w-full max-w-7xl mx-auto">
        
        {/* Header Section */}
        {(!searchResult && !error && !prankMessage) && (
          <header className="flex flex-col items-center text-center w-full max-w-4xl mx-auto mb-6 md:mb-8 mt-2 sm:mt-0">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="flex flex-col items-center w-full"
            >
              <motion.img 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                src="https://i.ibb.co.com/Y7VPhnSf/LOGO-SDN-CIRACAS-01-removebg-preview.png" 
                alt="Logo SDN Ciracas 01" 
                className="w-[110px] h-[110px] sm:w-[150px] sm:h-[150px] object-contain mb-4 drop-shadow-md"
                onError={(e) => {
                  e.currentTarget.src = "https://ui-avatars.com/api/?name=SDN+Ciracas&background=0D8ABC&color=fff&size=128";
                }}
              />

              <div className="inline-flex items-center gap-2.5 px-4 sm:px-5 py-1.5 sm:py-2 rounded-full bg-blue-50/80 border border-blue-100 mb-3 sm:mb-5 shadow-sm backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                <p className="text-sm font-semibold tracking-wide text-blue-700">SDN CIRACAS 01</p>
              </div>
              
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 mb-2 sm:mb-4">
                PENGUMUMAN <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">KELULUSAN</span>
              </h2>
              
              <h3 className="text-xl sm:text-3xl font-bold tracking-tight text-slate-800 mb-4 flex flex-col items-center">
                 <span>KELAS VI</span>
                 <span className="text-[10px] sm:text-sm mt-1.5 font-bold text-slate-500 tracking-[0.15em] sm:tracking-[0.2em] uppercase">TAHUN PELAJARAN 2025 / 2026</span>
              </h3>
            </motion.div>
          </header>
        )}

        {/* Interactive Area */}
        <section className="flex flex-col items-center justify-center w-full max-w-[620px] mx-auto relative z-20">
          <div className="w-full relative">
            <motion.div 
              layout
              className={`relative backdrop-blur-2xl border border-white/60 mx-auto w-full transition-all duration-500 ${
                searchResult 
                  ? 'bg-white/90 max-w-[500px] p-5 sm:p-6 rounded-[20px] shadow-[0_8px_30px_rgb(0,0,0,0.06)]' 
                  : 'bg-white/70 max-w-[620px] p-6 sm:p-10 rounded-[24px] sm:rounded-[32px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05),0_0_40px_-10px_rgba(37,99,235,0.1)]'
              }`}
            >
              <AnimatePresence mode="wait">
                
                {/* 1. SEARCH FORM STATE */}
                {!searchResult && !error && !prankMessage && (
                  <motion.div
                    key="search-form"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="w-full"
                  >
                    {isLocked && countdownData ? (
                      <div className="mb-6 flex flex-col items-center justify-center p-4 sm:p-5 bg-blue-50/50 border border-blue-100 rounded-2xl mx-auto w-fit max-w-full min-w-[280px]">
                        <CalendarDays className="w-8 h-8 text-blue-600 mb-3" />
                        <h4 className="text-slate-800 font-bold mb-1">Pengumuman Belum Dibuka</h4>
                        {releaseDate && (
                          <div className="bg-white border border-blue-100 px-3 sm:px-4 py-1 sm:py-2 rounded-lg mb-2 sm:mb-4 mt-1 shadow-sm inline-flex items-center">
                            <p className="text-blue-700 text-[11px] sm:text-sm font-semibold text-center leading-relaxed">
                              <span className="block sm:inline">Tanggal Pembukaan:</span>
                              <span className="block sm:inline sm:ml-1">{new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(releaseDate)}</span>
                            </p>
                          </div>
                        )}
                        <p className="text-slate-500 text-sm mb-4 text-center">Silakan kembali lagi dalam waktu:</p>
                        <div className="flex items-center justify-center gap-1.5 sm:gap-3 w-full">
                          <div className="flex flex-col items-center justify-center bg-[#1e293b] rounded-2xl w-[46px] h-[52px] sm:w-[50px] sm:h-[60px] shadow-sm">
                            <span className="text-base sm:text-lg font-bold text-white mb-0.5">{countdownData.days}</span>
                            <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium tracking-wide">Hari</span>
                          </div>
                          <div className="flex flex-col items-center justify-center bg-[#1e293b] rounded-2xl w-[46px] h-[52px] sm:w-[50px] sm:h-[60px] shadow-sm">
                            <span className="text-base sm:text-lg font-bold text-white mb-0.5">{countdownData.hours}</span>
                            <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium tracking-wide">Jam</span>
                          </div>
                          <div className="flex flex-col items-center justify-center bg-[#1e293b] rounded-2xl w-[46px] h-[52px] sm:w-[50px] sm:h-[60px] shadow-sm">
                            <span className="text-base sm:text-lg font-bold text-white mb-0.5">{countdownData.minutes}</span>
                            <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium tracking-wide">Menit</span>
                          </div>
                          <div className="flex flex-col items-center justify-center bg-[#1e293b] rounded-2xl w-[46px] h-[52px] sm:w-[50px] sm:h-[60px] shadow-sm">
                            <span className="text-base sm:text-lg font-bold text-white mb-0.5">{countdownData.seconds}</span>
                            <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium tracking-wide">Detik</span>
                          </div>
                        </div>
                      </div>
                    ) : null}

                    <form onSubmit={handleSearch} className="space-y-5 sm:space-y-6">
                      <div className="relative group w-full text-left">
                        <label htmlFor="nisn" className="text-sm font-semibold text-slate-700 mb-3 block">
                          Masukkan NISN
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            id="nisn"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            className="w-full h-14 sm:h-16 bg-white border border-slate-200 rounded-2xl pl-5 sm:pl-6 pr-12 sm:pr-14 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 transition-all font-mono text-base sm:text-lg tracking-wider shadow-sm disabled:bg-slate-100 disabled:cursor-not-allowed"
                            placeholder="Contoh: 0098726152"
                            disabled={isLoading || isLocked}
                            autoComplete="off"
                          />
                          <div className={`absolute right-5 sm:right-5 top-1/2 -translate-y-1/2 transition-colors duration-300 ${isFocused ? 'text-blue-600' : 'text-slate-400'}`}>
                            <Search className="w-6 h-6" />
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading || !searchQuery.trim() || isLocked}
                        className="w-full h-14 sm:h-16 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-[0_8px_20px_rgba(37,99,235,0.25)] hover:shadow-[0_12px_28px_rgba(37,99,235,0.35)] transition-all flex items-center justify-center gap-3 text-lg group disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-6 h-6 animate-spin" />
                            <span>Mencari Data...</span>
                          </>
                        ) : isLocked ? (
                          <>
                            <span>Terkunci</span>
                          </>
                        ) : (
                          <>
                            <span>Cek Hasil Kelulusan</span>
                            <ChevronLeft className="w-5 h-5 rotate-180 transition-transform group-hover:translate-x-1" />
                          </>
                        )}
                      </button>
                    </form>
                  </motion.div>
                )}

                {/* 2. RESULT STATE (SUCCESS) */}
                {searchResult && (
                  <motion.div
                    key="result-success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
                    className="w-full text-center"
                  >
                    <div className="pt-2">
                       <motion.div 
                         initial={{ scale: 0 }}
                         animate={{ scale: 1 }}
                         transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
                         className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-6 shadow-[0_8px_16px_rgba(16,185,129,0.25)] relative ${searchResult.status === 'Lulus' ? 'bg-[#10b981]' : 'bg-red-500'}`}
                       >
                         {searchResult.status === 'Lulus' && (
                           <>
                             <div className="absolute -top-3 -left-3 w-3 h-3 text-[#10b981]/60 transform rotate-45">✦</div>
                             <div className="absolute top-2 -right-4 w-4 h-4 text-[#10b981]/60 transform rotate-12">✦</div>
                             <div className="absolute -bottom-2 -right-2 w-3 h-3 text-[#10b981]/60 transform -rotate-12">✦</div>
                             <div className="absolute top-6 -left-6 w-3.5 h-3.5 text-[#10b981]/60 transform rotate-45">✦</div>
                             <div className="absolute -top-5 right-2 w-3 h-3 text-[#10b981]/60 transform -rotate-45">✦</div>
                           </>
                         )}
                         {searchResult.status === 'Lulus' ? (
                           <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                             <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                           </svg>
                         ) : (
                           <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                         )}
                       </motion.div>
                       
                        <motion.div
                         initial={{ opacity: 0, y: 10 }}
                         animate={{ opacity: 1, y: 0 }}
                         transition={{ delay: 0.3 }}
                       >
                         <div className="mb-2">
                           {searchResult.status === 'Lulus' ? (
                             <div className="flex flex-col items-center gap-1.5 sm:gap-2">
                               <span className="text-base sm:text-lg font-black tracking-[0.2em] text-slate-600 uppercase">SELAMAT</span>
                               <span className="text-blue-600 font-black text-2xl sm:text-4xl tracking-tight uppercase text-center leading-tight drop-shadow-sm">
                                 {searchResult.nama}
                               </span>
                               <span className="text-sm sm:text-base font-bold tracking-wider text-slate-600 mt-1 uppercase">ANDA DINYATAKAN</span>
                             </div>
                           ) : (
                             <div className="flex flex-col items-center gap-1.5 sm:gap-2">
                               <span className="text-base sm:text-lg font-black tracking-[0.2em] text-slate-600 uppercase">MOHON MAAF</span>
                               <span className="text-red-600 font-black text-2xl sm:text-4xl tracking-tight uppercase text-center leading-tight drop-shadow-sm">
                                 {searchResult.nama}
                               </span>
                               <span className="text-sm sm:text-base font-bold tracking-wider text-slate-600 mt-1 uppercase">ANDA DINYATAKAN</span>
                             </div>
                           )}
                         </div>
                         <div className="mb-4 mt-2 sm:mb-6">
                           <span className={`font-black text-4xl sm:text-6xl tracking-widest uppercase text-transparent bg-clip-text drop-shadow-sm ${
                             searchResult.status === 'Lulus' 
                               ? 'bg-gradient-to-b from-emerald-500 to-emerald-600' 
                               : 'bg-gradient-to-b from-red-500 to-rose-600'
                           }`}>
                             {searchResult.status || 'LULUS'}
                           </span>
                         </div>
                       </motion.div>

                       {appMessage && searchResult.status === 'Lulus' && (
                         <motion.div
                           initial={{ opacity: 0, scale: 0.95 }}
                           animate={{ opacity: 1, scale: 1 }}
                           transition={{ delay: 0.35 }}
                           className="mb-4 bg-amber-50 border border-amber-200 text-amber-800 px-5 py-3 rounded-2xl text-xs sm:text-sm font-medium leading-relaxed"
                         >
                           {appMessage}
                         </motion.div>
                       )}

                       {appFailMessage && searchResult.status !== 'Lulus' && (
                         <motion.div
                           initial={{ opacity: 0, scale: 0.95 }}
                           animate={{ opacity: 1, scale: 1 }}
                           transition={{ delay: 0.35 }}
                           className="mb-4 bg-red-50 border border-red-200 text-red-800 px-5 py-3 rounded-2xl text-xs sm:text-sm font-medium leading-relaxed"
                         >
                           {appFailMessage}
                         </motion.div>
                       )}

                       <motion.div 
                         initial={{ opacity: 0 }}
                         animate={{ opacity: 1 }}
                         transition={{ delay: 0.4 }}
                         className="bg-white border border-slate-100 rounded-[16px] p-4 sm:p-5 mb-4 text-left shadow-[0_2px_10px_rgb(0,0,0,0.02)]"
                       >
                         <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                              <User className="w-4 h-4" />
                            </div>
                            <h4 className="text-sm font-bold text-blue-800 uppercase tracking-wider">
                              DATA SISWA
                            </h4>
                          </div>
                          <ResultRow label="Nama Siswa" value={searchResult.nama} />
                         <ResultRow label="Tempat, Tgl Lahir" value={`${searchResult.tempatLahir || '-'}, ${searchResult.tglLahir || '-'}`} />
                         <ResultRow label="Kelas" value={searchResult.kelas} />
                         <ResultRow label="Tahun Ajaran" value={searchResult.tahunAjaran || '2023/2024'} />
                       </motion.div>

                       {searchResult.status === 'Lulus' && (
                         <motion.div
                           initial={{ opacity: 0, y: 10 }}
                           animate={{ opacity: 1, y: 0 }}
                           transition={{ delay: 0.8, duration: 0.5 }}
                           className="bg-white border border-slate-100 rounded-[16px] p-3 sm:p-5 mb-3 sm:mb-4 text-left shadow-[0_2px_10px_rgb(0,0,0,0.02)]"
                         >
                           
                           <h4 className="text-xs sm:text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider pl-2">
                             Hasil Nilai TKA (Tes Kemampuan Akademik)
                           </h4>
                           <ResultRow label="Matematika" value={searchResult.nilaiMatematika || '-'} highlightValue />
                           <ResultRow label="Bahasa Indonesia" value={searchResult.nilaiBIndonesia || '-'} highlightValue />
                            
                        </motion.div>
                       )}

                       <motion.button
                         initial={{ opacity: 0, y: 10 }}
                         animate={{ opacity: 1, y: 0 }}
                         transition={{ delay: 0.5 }}
                         onClick={resetSearch}
                         className="w-full h-[42px] sm:h-[52px] flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white shadow-md rounded-[16px] text-sm sm:text-base font-semibold transition-all active:scale-[0.98]"
                       >
                         <ChevronLeft className="w-5 h-5" />
                         Kembali Pencarian
                       </motion.button>
                    </div>
                  </motion.div>
                )}

                {/* 3. PRANK STATE */}
                {prankMessage && (
                  <motion.div
                    key="prank-state"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="w-full"
                  >
                    <div className="bg-amber-50/60 border border-amber-100 rounded-2xl p-8 flex flex-col items-center text-center mb-8">
                      <div className="w-16 h-16 bg-white border border-amber-100 shadow-sm rounded-2xl flex items-center justify-center mb-5 text-amber-500">
                        <AlertCircle className="w-8 h-8" />
                      </div>
                      <h4 className="text-xl font-bold tracking-tight text-slate-900 mb-3">Pesan Penting</h4>
                      <p className="text-base text-slate-600 font-medium whitespace-pre-wrap">
                        {prankMessage}
                      </p>
                    </div>

                    <button
                      onClick={resetSearch}
                      className="w-full h-16 flex items-center justify-center gap-3 bg-white border border-slate-200 hover:bg-slate-50 shadow-sm text-slate-700 rounded-2xl text-lg font-semibold transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                      Coba Pencarian Lain
                    </button>
                  </motion.div>
                )}

                {/* 4. ERROR STATE */}
                {error && (
                  <motion.div
                    key="error-state"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="w-full"
                  >
                    <div className="bg-red-50/60 border border-red-100 rounded-2xl p-8 flex flex-col items-center text-center mb-8">
                      <div className="w-16 h-16 bg-white border border-red-100 shadow-sm rounded-2xl flex items-center justify-center mb-5 text-red-500">
                        <AlertCircle className="w-8 h-8" />
                      </div>
                      <h4 className="text-xl font-bold tracking-tight text-slate-900 mb-3">Data Tidak Ditemukan</h4>
                      <p className="text-base text-slate-600 font-medium">
                        {error}
                      </p>
                    </div>

                    <button
                      onClick={resetSearch}
                      className="w-full h-16 flex items-center justify-center gap-3 bg-white border border-slate-200 hover:bg-slate-50 shadow-sm text-slate-700 rounded-2xl text-lg font-semibold transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                      Coba Pencarian Lain
                    </button>
                  </motion.div>
                )}
                
              </AnimatePresence>
            </motion.div>
          </div>
        </section>
      </main>

      {/* --- Footer --- */}
      <footer className="relative z-10 w-full px-6 py-6 flex inset-x-0 bottom-0 flex-col items-center text-center bg-transparent mt-0">
        <span className="text-sm text-slate-500 font-semibold mb-1">Sistem Pengumuman Kelulusan Online</span>
        <span className="text-xs text-slate-400">© {new Date().getFullYear()} SDN Ciracas 01. All rights reserved.</span>
      </footer>
    </div>
  );
}

// Separate component for result rows to keep things clean
function ResultRow({ label, value, highlightValue = false }: { label: string, value: string, highlightValue?: boolean }) {
  return (
    <div className="flex justify-between items-start py-2.5 sm:py-3 border-b border-slate-100/80 last:border-0 gap-3 group">
      <span className="text-xs sm:text-sm text-slate-500 font-medium shrink-0 pt-0.5">{label}</span>
      <span className={`text-sm sm:text-base font-bold text-right leading-tight max-w-[65%] break-words ${highlightValue ? 'text-blue-700' : 'text-slate-800'}`}>{value}</span>
    </div>
  );
}

