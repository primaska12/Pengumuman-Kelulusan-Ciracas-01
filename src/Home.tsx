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
  ShieldCheck
} from 'lucide-react';

interface StudentResult {
  nama: string;
  nisn: string;
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
  const [isFocused, setIsFocused] = useState(false);
  const [appMessage, setAppMessage] = useState('');
  const [appFailMessage, setAppFailMessage] = useState('');
  const [releaseDate, setReleaseDate] = useState<Date | null>(null);
  const [countdownText, setCountdownText] = useState<string | null>(null);
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
        setCountdownText(null);
        clearInterval(interval);
      } else {
        setIsLocked(true);
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        
        const parts = [];
        if (days > 0) parts.push(`${days} Hari`);
        if (hours > 0 || days > 0) parts.push(`${hours} Jam`);
        parts.push(`${minutes} Menit`);
        parts.push(`${seconds} Detik`);
        
        setCountdownText(parts.join(' '));
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

    try {
      const res = await fetch(`/api/students/search?q=${encodeURIComponent(searchQuery.trim())}`);
      const data = await res.json();
      
      if (res.ok) {
        const prankKey = `prank_v3_${data.nisn || data.noPeserta}`;
        const prankCount = parseInt(localStorage.getItem(prankKey) || '0', 10);
        
        if (prankCount < 3) {
          // PRANK MODE: Force status to "Tidak Lulus" for the first 3 searches
          setSearchResult({ ...data, status: 'Tidak Lulus' });
          localStorage.setItem(prankKey, (prankCount + 1).toString());
        } else {
          // Real result details are shown starting from 4th search
          setSearchResult(data);
        }
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
      <nav className="relative z-10 w-full px-6 md:px-10 py-6 flex justify-between items-center bg-transparent">
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
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 pt-4 pb-32 md:pb-48 w-full max-w-7xl mx-auto">
        
        {/* Header Section */}
        <header className="flex flex-col items-center text-center w-full max-w-4xl mx-auto mb-10 md:mb-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col items-center w-full"
          >
            <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-blue-50/80 border border-blue-100 mb-8 shadow-sm backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
              <p className="text-sm font-semibold tracking-wide text-blue-700">Official Graduation Portal</p>
            </div>
            
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 mb-6">
              PENGUMUMAN <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">KELULUSAN</span>
            </h2>
            
            <h3 className="text-xl sm:text-3xl font-bold tracking-tight text-slate-800 mb-6">
               SISWA / SISWI SDN CIRACAS 01
            </h3>
            
            {!searchResult && !error && (
              <p className="text-base sm:text-xl text-slate-500 max-w-[640px] mx-auto leading-relaxed">
                Portal resmi pengumuman hasil kelulusan. Silakan masukkan nomor peserta atau NISN untuk melihat status.
              </p>
            )}
          </motion.div>
        </header>

        {/* Interactive Area */}
        <section className="flex flex-col items-center justify-center w-full max-w-[620px] mx-auto relative z-20">
          <div className="w-full relative">
            <motion.div 
              layout
              className="relative bg-white/70 backdrop-blur-2xl border border-white/60 rounded-[32px] p-6 sm:p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05),0_0_40px_-10px_rgba(37,99,235,0.1)] w-full"
            >
              <AnimatePresence mode="wait">
                
                {/* 1. SEARCH FORM STATE */}
                {!searchResult && !error && (
                  <motion.div
                    key="search-form"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="w-full"
                  >
                    {isLocked && countdownText && (
                      <div className="mb-8 flex flex-col items-center justify-center p-6 bg-blue-50/50 border border-blue-100 rounded-2xl">
                        <CalendarDays className="w-8 h-8 text-blue-600 mb-3" />
                        <h4 className="text-slate-800 font-bold mb-1">Pengumuman Belum Dibuka</h4>
                        <p className="text-slate-500 text-sm mb-4 text-center">Silakan kembali lagi dalam waktu:</p>
                        <div className="text-base min-[400px]:text-lg sm:text-xl lg:text-2xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 tracking-tight whitespace-nowrap overflow-x-hidden text-center w-full max-w-full">
                          {countdownText}
                        </div>
                      </div>
                    )}

                    <form onSubmit={handleSearch} className="space-y-6">
                      <div className="relative group w-full text-left">
                        <label htmlFor="nisn" className="text-sm font-semibold text-slate-700 mb-3 block">
                          Masukkan Nomor Peserta atau NISN
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            id="nisn"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            className="w-full h-16 bg-white border border-slate-200 rounded-2xl pl-6 pr-14 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 transition-all font-mono text-lg tracking-wider shadow-sm disabled:bg-slate-100 disabled:cursor-not-allowed"
                            placeholder="Contoh: 0098726152"
                            disabled={isLoading || isLocked}
                            autoComplete="off"
                          />
                          <div className={`absolute right-5 top-1/2 -translate-y-1/2 transition-colors duration-300 ${isFocused ? 'text-blue-600' : 'text-slate-400'}`}>
                            <Search className="w-6 h-6" />
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading || !searchQuery.trim() || isLocked}
                        className="w-full h-16 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-[0_8px_20px_rgba(37,99,235,0.25)] hover:shadow-[0_12px_28px_rgba(37,99,235,0.35)] transition-all flex items-center justify-center gap-3 text-lg group disabled:opacity-70 disabled:cursor-not-allowed"
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
                         className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border ${searchResult.status === 'Lulus' ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}
                       >
                         {searchResult.status === 'Lulus' ? (
                           <BadgeCheck className="w-10 h-10 text-emerald-600" />
                         ) : (
                           <AlertCircle className="w-10 h-10 text-red-600" />
                         )}
                       </motion.div>
                       
                        <motion.div
                         initial={{ opacity: 0, y: 10 }}
                         animate={{ opacity: 1, y: 0 }}
                         transition={{ delay: 0.3 }}
                       >
                         <h3 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight mb-3">
                           {searchResult.status === 'Lulus' ? (
                             <div className="flex flex-col items-center gap-1">
                               <span>SELAMAT</span>
                               <span className="mt-1 flex items-center justify-center text-center flex-wrap uppercase">
                                 <span className="text-blue-600 font-black text-2xl sm:text-3xl tracking-normal">{searchResult.nama}</span>
                                 <span className="whitespace-pre">, ANDA DINYATAKAN</span>
                               </span>
                             </div>
                           ) : (
                             <div className="flex flex-col items-center gap-1">
                               <span className="mt-1 flex items-center justify-center text-center flex-wrap uppercase">
                                 <span className="whitespace-pre">MOHON MAAF </span>
                                 <span className="text-red-600 font-black text-2xl sm:text-3xl tracking-normal">{searchResult.nama}</span>
                                 <span className="whitespace-pre">, ANDA DINYATAKAN</span>
                               </span>
                             </div>
                           )}
                         </h3>
                         <div className="mb-8">
                           <span className={`font-black text-4xl sm:text-5xl tracking-widest uppercase bg-clip-text text-transparent ${
                             searchResult.status === 'Lulus' ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-red-500 to-rose-500'
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
                           className="mb-8 bg-amber-50 border border-amber-200 text-amber-800 px-5 py-4 rounded-2xl text-sm font-medium leading-relaxed"
                         >
                           {appMessage}
                         </motion.div>
                       )}

                       {appFailMessage && searchResult.status !== 'Lulus' && (
                         <motion.div
                           initial={{ opacity: 0, scale: 0.95 }}
                           animate={{ opacity: 1, scale: 1 }}
                           transition={{ delay: 0.35 }}
                           className="mb-8 bg-red-50 border border-red-200 text-red-800 px-5 py-4 rounded-2xl text-sm font-medium leading-relaxed"
                         >
                           {appFailMessage}
                         </motion.div>
                       )}

                       <motion.div 
                         initial={{ opacity: 0 }}
                         animate={{ opacity: 1 }}
                         transition={{ delay: 0.4 }}
                         className="bg-white/80 border border-slate-100 rounded-[20px] p-6 mb-8 text-left space-y-2 shadow-sm"
                       >
                         <ResultRow label="Nama Siswa" value={searchResult.nama} />
                         <ResultRow label="No. Peserta" value={searchResult.noPeserta} />
                         <ResultRow label="Kelas" value={searchResult.kelas} />
                         <ResultRow label="Tahun Ajaran" value={searchResult.tahunAjaran || '2023/2024'} />
                       </motion.div>

                       <motion.button
                         initial={{ opacity: 0, y: 10 }}
                         animate={{ opacity: 1, y: 0 }}
                         transition={{ delay: 0.5 }}
                         onClick={resetSearch}
                         className="w-full h-16 flex items-center justify-center gap-3 bg-slate-900 hover:bg-slate-800 text-white shadow-md rounded-2xl text-lg font-semibold transition-colors"
                       >
                         <ChevronLeft className="w-5 h-5" />
                         Kembali Pencarian
                       </motion.button>
                    </div>
                  </motion.div>
                )}

                {/* 3. ERROR STATE */}
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
function ResultRow({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex flex-col sm:flex-row py-3 sm:items-center sm:justify-between border-b border-slate-200 last:border-0 group">
      <span className="text-xs sm:text-sm text-slate-500 font-sans group-hover:text-slate-700 transition-colors">{label}</span>
      <span className="text-sm sm:text-base text-slate-900 font-medium font-sans">{value}</span>
    </div>
  );
}

