const fs = require('fs');
let code = fs.readFileSync('src/Home.tsx', 'utf8');

// Header section restorations
code = code.replace(
  /className="w-\[70px\] h-\[70px\] sm:w-\[150px\] sm:h-\[150px\] object-contain mb-2 sm:mb-4 drop-shadow-md"/,
  'className="w-[110px] h-[110px] sm:w-[150px] sm:h-[150px] object-contain mb-4 drop-shadow-md"'
);

code = code.replace(
  /<div className="inline-flex items-center gap-1\.5 sm:gap-2\.5 px-3 sm:px-5 py-0\.5 sm:py-2 rounded-full bg-blue-50\/80 border border-blue-100 mb-2 sm:mb-5 shadow-sm backdrop-blur-sm">/,
  '<div className="inline-flex items-center gap-2.5 px-4 sm:px-5 py-1.5 sm:py-2 rounded-full bg-blue-50/80 border border-blue-100 mb-4 sm:mb-5 shadow-sm backdrop-blur-sm">'
);

code = code.replace(
  /<span className="w-1\.5 h-1\.5 sm:w-2 sm:h-2 rounded-full bg-blue-600 animate-pulse"><\/span>/,
  '<span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>'
);

code = code.replace(
  /<p className="text-\[10px\] sm:text-sm font-semibold tracking-wide text-blue-700">SDN CIRACAS 01<\/p>/,
  '<p className="text-sm font-semibold tracking-wide text-blue-700">SDN CIRACAS 01</p>'
);

code = code.replace(
  /<header className="flex flex-col items-center text-center w-full max-w-4xl mx-auto mb-3 sm:mb-8 mt-2 sm:mt-0">/,
  '<header className="flex flex-col items-center text-center w-full max-w-4xl mx-auto mb-6 md:mb-8 mt-4 sm:mt-0">'
);

code = code.replace(
  /<h2 className="text-3xl sm:text-5xl leading-\[1\.1\] sm:leading-none font-extrabold tracking-tight text-slate-900 mb-1 sm:mb-4">/,
  '<h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 mb-2 sm:mb-4">'
);

code = code.replace(
  /<h3 className="text-lg sm:text-3xl font-bold tracking-tight text-slate-800 mb-3 sm:mb-4 flex flex-col items-center">/,
  '<h3 className="text-xl sm:text-3xl font-bold tracking-tight text-slate-800 mb-4 flex flex-col items-center">'
);

code = code.replace(
  /<span>KELAS VI<\/span>\s*<span className="text-\[9px\] sm:text-sm mt-1 sm:mt-1\.5 font-bold text-slate-500 tracking-\[0\.1em\] sm:tracking-\[0\.2em\] uppercase">Tahun Pelajaran 2025 \/ 2026<\/span>/,
  `<span>KELAS VI</span>\n                 <span>SDN CIRACAS 01</span>\n                 <span className="text-[10px] sm:text-sm mt-1.5 font-bold text-slate-500 tracking-[0.15em] sm:tracking-[0.2em] uppercase">TAHUN PELAJARAN 2025 / 2026</span>`
);

// Form section restorations
code = code.replace(
  /bg-white\/70 max-w-\[620px\] p-5 sm:p-10 rounded-\[24px\] sm:rounded-\[32px\]/,
  'bg-white/70 max-w-[620px] p-6 sm:p-10 rounded-[24px] sm:rounded-[32px]'
);

code = code.replace(
  /<form onSubmit={handleSearch} className="space-y-3 sm:space-y-5">/,
  '<form onSubmit={handleSearch} className="space-y-5 sm:space-y-6">'
);

code = code.replace(
  /<label htmlFor="nisn" className="text-sm font-semibold text-slate-700 mb-2 sm:mb-3 block">/,
  '<label htmlFor="nisn" className="text-sm font-semibold text-slate-700 mb-3 block">'
);

code = code.replace(
  /className="w-full h-12 sm:h-16 bg-white border border-slate-200 rounded-2xl pl-4 sm:pl-6 pr-12 sm:pr-14 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500\/15 focus:border-blue-500 transition-all font-mono text-base sm:text-lg tracking-wider shadow-sm disabled:bg-slate-100 disabled:cursor-not-allowed"/,
  'className="w-full h-14 sm:h-16 bg-white border border-slate-200 rounded-2xl pl-5 sm:pl-6 pr-12 sm:pr-14 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 transition-all font-mono text-base sm:text-lg tracking-wider shadow-sm disabled:bg-slate-100 disabled:cursor-not-allowed"'
);

code = code.replace(
  /<div className={`absolute right-4 sm:right-5 top-1\/2 -translate-y-1\/2 transition-colors duration-300 \$\{isFocused \? 'text-blue-600' : 'text-slate-400'\}`}>/,
  '<div className={`absolute right-5 sm:right-5 top-1/2 -translate-y-1/2 transition-colors duration-300 ${isFocused ? \'text-blue-600\' : \'text-slate-400\'}`}>'
);

code = code.replace(
  /<Search className="w-5 h-5 sm:w-6 sm:h-6" \/>/,
  '<Search className="w-6 h-6" />'
);

code = code.replace(
  /className="w-full h-12 sm:h-16 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-\[0_8px_20px_rgba\(37,99,235,0\.25\)\] hover:shadow-\[0_12px_28px_rgba\(37,99,235,0\.35\)\] transition-all flex items-center justify-center gap-2 sm:gap-3 text-base sm:text-lg group disabled:opacity-70 disabled:cursor-not-allowed"/,
  'className="w-full h-14 sm:h-16 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-[0_8px_20px_rgba(37,99,235,0.25)] hover:shadow-[0_12px_28px_rgba(37,99,235,0.35)] transition-all flex items-center justify-center gap-3 text-lg group disabled:opacity-70 disabled:cursor-not-allowed"'
);

code = code.replace(
  /<main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 pt-4 pb-4 md:pb-32 w-full max-w-7xl mx-auto">/,
  '<main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 pt-10 sm:pt-4 pb-12 md:pb-32 w-full max-w-7xl mx-auto">'
);

fs.writeFileSync('src/Home.tsx', code);
