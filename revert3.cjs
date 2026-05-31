const fs = require('fs');
let code = fs.readFileSync('src/Home.tsx', 'utf8');

code = code.replace(
  'p-4 sm:p-6 rounded-[20px]',
  'p-5 sm:p-6 rounded-[20px]'
);

code = code.replace(
  'w-14 h-14 sm:w-20 sm:h-20',
  'w-16 h-16 sm:w-20 sm:h-20'
);

code = code.replace(
  '<svg className="w-6 h-6 sm:w-10 sm:h-10 text-white" fill="none" viewBox="0 0 24 24"',
  '<svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" viewBox="0 0 24 24"'
);

code = code.replace(
  '<AlertCircle className="w-6 h-6 sm:w-10 sm:h-10 text-white" />',
  '<AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white" />'
);

code = code.replace(
  '<span className="text-sm sm:text-lg font-black tracking-[0.2em] text-slate-600 uppercase">SELAMAT</span>',
  '<span className="text-base sm:text-lg font-black tracking-[0.2em] text-slate-600 uppercase">SELAMAT</span>'
);

code = code.replace(
  '<span className="text-xl sm:text-4xl font-black tracking-tight uppercase text-center leading-tight drop-shadow-sm text-blue-600">',
  '<span className="text-blue-600 font-black text-2xl sm:text-4xl tracking-tight uppercase text-center leading-tight drop-shadow-sm">'
);

code = code.replace(
  '<span className="text-xs sm:text-base font-bold tracking-wider text-slate-600 mt-1 uppercase">ANDA DINYATAKAN</span>',
  '<span className="text-sm sm:text-base font-bold tracking-wider text-slate-600 mt-1 uppercase">ANDA DINYATAKAN</span>'
);

code = code.replace(
  '<span className="text-sm sm:text-lg font-black tracking-[0.2em] text-slate-600 uppercase">MOHON MAAF</span>',
  '<span className="text-base sm:text-lg font-black tracking-[0.2em] text-slate-600 uppercase">MOHON MAAF</span>'
);

code = code.replace(
  '<span className="text-xl sm:text-4xl font-black tracking-tight uppercase text-center leading-tight drop-shadow-sm text-red-600">',
  '<span className="text-red-600 font-black text-2xl sm:text-4xl tracking-tight uppercase text-center leading-tight drop-shadow-sm">'
);

code = code.replace(
  '<span className={`font-black text-3xl sm:text-6xl tracking-widest uppercase text-transparent bg-clip-text drop-shadow-sm',
  '<span className={`font-black text-4xl sm:text-6xl tracking-widest uppercase text-transparent bg-clip-text drop-shadow-sm'
);

code = code.replace(
  '<div className="mb-3 mt-1 sm:mb-6">',
  '<div className="mb-4 mt-2 sm:mb-6">'
);

code = code.replace(
  '<div className="mb-1 sm:mb-2">',
  '<div className="mb-2">'
);

code = code.replace(
  '<div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-4">',
  '<div className="flex items-center gap-3 mb-4">'
);

code = code.replace(
  'p-3 sm:p-5 mb-3 sm:mb-4',
  'p-4 sm:p-5 mb-4'
);

code = code.replace(
  '<h4 className="text-[11px] sm:text-sm font-bold text-slate-700 mb-2 sm:mb-3 uppercase tracking-wider pl-2">',
  '<h4 className="text-xs sm:text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider pl-2">'
);

code = code.replace(
  'py-1.5 sm:py-3',
  'py-2.5 sm:py-3'
);


fs.writeFileSync('src/Home.tsx', code);
