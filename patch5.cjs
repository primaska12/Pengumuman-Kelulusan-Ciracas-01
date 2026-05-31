const fs = require('fs');
let code = fs.readFileSync('src/Home.tsx', 'utf8');

code = code.replace(
  'bg-white/90 max-w-[500px] p-5 sm:p-6 rounded-[20px] shadow-[0_8px_30px_rgb(0,0,0,0.06)]',
  'bg-white/90 max-w-[500px] p-4 sm:p-6 rounded-[20px] shadow-[0_8px_30px_rgb(0,0,0,0.06)]'
);

code = code.replace(
  'w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-[0_8px_16px_rgba(16,185,129,0.25)] relative',
  'w-14 h-14 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-6 shadow-[0_8px_16px_rgba(16,185,129,0.25)] relative'
);

code = code.replace(
  '<svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" viewBox="0 0 24 24"',
  '<svg className="w-6 h-6 sm:w-10 sm:h-10 text-white" fill="none" viewBox="0 0 24 24"'
);

code = code.replace(
  '<AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white" />',
  '<AlertCircle className="w-6 h-6 sm:w-10 sm:h-10 text-white" />'
);

code = code.replace(
  '<span className="text-base sm:text-lg font-black tracking-[0.2em] text-slate-600 uppercase">SELAMAT</span>',
  '<span className="text-sm sm:text-lg font-black tracking-[0.2em] text-slate-600 uppercase">SELAMAT</span>'
);

code = code.replace(
  '<span className="text-blue-600 font-black text-2xl sm:text-4xl tracking-tight uppercase text-center leading-tight drop-shadow-sm">',
  '<span className="text-xl sm:text-4xl font-black tracking-tight uppercase text-center leading-tight drop-shadow-sm text-blue-600">'
);

code = code.replace(
  '<span className="text-sm sm:text-base font-bold tracking-wider text-slate-600 mt-1 uppercase">ANDA DINYATAKAN</span>',
  '<span className="text-xs sm:text-base font-bold tracking-wider text-slate-600 mt-1 uppercase">ANDA DINYATAKAN</span>'
);

code = code.replace(
  '<span className="text-base sm:text-lg font-black tracking-[0.2em] text-slate-600 uppercase">MOHON MAAF</span>',
  '<span className="text-sm sm:text-lg font-black tracking-[0.2em] text-slate-600 uppercase">MOHON MAAF</span>'
);

code = code.replace(
  '<span className="text-red-600 font-black text-2xl sm:text-4xl tracking-tight uppercase text-center leading-tight drop-shadow-sm">',
  '<span className="text-xl sm:text-4xl font-black tracking-tight uppercase text-center leading-tight drop-shadow-sm text-red-600">'
);

code = code.replace(
  '<span className={`font-black text-4xl sm:text-6xl tracking-widest uppercase text-transparent bg-clip-text drop-shadow-sm',
  '<span className={`font-black text-3xl sm:text-6xl tracking-widest uppercase text-transparent bg-clip-text drop-shadow-sm'
);

code = code.replace(
  '<div className="mb-4 mt-2 sm:mb-6">',
  '<div className="mb-3 mt-1 sm:mb-6">'
);

code = code.replace(
  /<ResultRow label="NISN" value={searchResult.nisn} \/>[\s\n]*<ResultRow label="Tempat, Tgl Lahir" value={`\$\{searchResult.tempatLahir \|\| '-'\}, \$\{searchResult.tglLahir \|\| '-'\}`} \/>[\s\n]*<ResultRow label="No. Peserta" value={searchResult.noPeserta} \/>/gm,
  '<ResultRow label="Tempat, Tgl Lahir" value={`${searchResult.tempatLahir || \'-\'}, ${searchResult.tglLahir || \'-\'}`} />'
);

code = code.replace(
  '<div className="mb-2">',
  '<div className="mb-1 sm:mb-2">'
);

fs.writeFileSync('src/Home.tsx', code);
