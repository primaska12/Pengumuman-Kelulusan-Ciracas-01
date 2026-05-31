const fs = require('fs');
let code = fs.readFileSync('src/Home.tsx', 'utf8');

// 1. Remove SDN CIRACAS 01 from below KELAS VI
code = code.replace(
  /<span>KELAS VI<\/span>\s*<span>SDN CIRACAS 01<\/span>/,
  '<span>KELAS VI</span>'
);

// 2. Adjust main padding (naikan logo)
code = code.replace(
  '<main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 pt-10 sm:pt-4 pb-20 md:pb-32 w-full max-w-7xl mx-auto">',
  '<main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 pt-4 pb-20 md:pb-32 w-full max-w-7xl mx-auto">'
);

// 3. Adjust header margins
code = code.replace(
  /<header className="flex flex-col items-center text-center w-full max-w-4xl mx-auto mb-6 md:mb-8 mt-4 sm:mt-0">/g,
  '<header className="flex flex-col items-center text-center w-full max-w-4xl mx-auto mb-3 sm:mb-8 mt-2 sm:mt-0">'
);

// 4. Adjust heading margin and badge margin
code = code.replace(
  '<div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-blue-50/80 border border-blue-100 mb-5 shadow-sm backdrop-blur-sm">',
  '<div className="inline-flex items-center gap-2.5 px-4 sm:px-5 py-1 sm:py-2 rounded-full bg-blue-50/80 border border-blue-100 mb-3 sm:mb-5 shadow-sm backdrop-blur-sm">'
);

code = code.replace(
  '<h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 mb-4">',
  '<h2 className="text-[2rem] sm:text-5xl leading-[1.1] sm:leading-none font-extrabold tracking-tight text-slate-900 mb-1.5 sm:mb-4">'
);

code = code.replace(
  '<h3 className="text-xl sm:text-3xl font-bold tracking-tight text-slate-800 mb-4 flex flex-col items-center">',
  '<h3 className="text-[1.15rem] sm:text-3xl font-bold tracking-tight text-slate-800 mb-3 sm:mb-4 flex flex-col items-center">'
);

// 5. Card Adjustments
code = code.replace(
  '<div className="mb-6 flex flex-col items-center justify-center p-4 sm:p-5 bg-blue-50/50 border border-blue-100 rounded-2xl mx-auto w-fit max-w-full min-w-[280px]">',
  '<div className="mb-4 sm:mb-6 flex flex-col items-center justify-center p-3 sm:p-5 bg-blue-50/50 border border-blue-100 rounded-2xl mx-auto w-fit max-w-full min-w-[280px]">'
);

code = code.replace(
  '<div className="bg-white border border-blue-100 px-4 py-2 rounded-lg mb-4 mt-2 shadow-sm inline-flex items-center">',
  '<div className="bg-white border border-blue-100 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg mb-2 sm:mb-4 mt-1.5 shadow-sm inline-flex items-center">'
);

code = code.replace(
  '<p className="text-slate-500 text-sm mb-4 text-center">Silakan kembali lagi dalam waktu:</p>',
  '<p className="text-slate-500 text-[11px] sm:text-sm mb-2 sm:mb-4 text-center">Silakan kembali lagi dalam waktu:</p>'
);

code = code.replace(
  '<CalendarDays className="w-8 h-8 text-blue-600 mb-3" />',
  '<CalendarDays className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 mb-1 sm:mb-3" />'
);

code = code.replace(
  '<h4 className="text-slate-800 font-bold mb-1">Pengumuman Belum Dibuka</h4>',
  '<h4 className="text-slate-800 text-sm sm:text-base font-bold mb-0.5 sm:mb-1">Pengumuman Belum Dibuka</h4>'
);

// 6. Form Adjustments
code = code.replace(
  '<form onSubmit={handleSearch} className="space-y-6">',
  '<form onSubmit={handleSearch} className="space-y-3 sm:space-y-6">'
);

fs.writeFileSync('src/Home.tsx', code);
