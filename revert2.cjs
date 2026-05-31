const fs = require('fs');
let code = fs.readFileSync('src/Home.tsx', 'utf8');

code = code.replace(
  '<p className="text-slate-500 text-[10px] sm:text-sm mb-2 sm:mb-4 text-center">Silakan kembali lagi dalam waktu:</p>',
  '<p className="text-slate-500 text-sm mb-4 text-center">Silakan kembali lagi dalam waktu:</p>'
);

code = code.replace(
  /<div className="flex flex-col items-center justify-center bg-\[#1e293b\] rounded-xl sm:rounded-2xl w-\[32px\] h-\[40px\] sm:w-\[50px\] sm:h-\[60px\] shadow-sm">\s*<span className="text-xs sm:text-lg font-bold text-white mb-0\.5">\{countdownData\.days\}<\/span>\s*<span className="text-\[7px\] sm:text-\[10px\] text-slate-400 font-medium tracking-wide">Hari<\/span>\s*<\/div>/,
  '<div className="flex flex-col items-center justify-center bg-[#1e293b] rounded-2xl w-[46px] h-[52px] sm:w-[50px] sm:h-[60px] shadow-sm">\n                            <span className="text-base sm:text-lg font-bold text-white mb-0.5">{countdownData.days}</span>\n                            <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium tracking-wide">Hari</span>\n                          </div>'
);

code = code.replace(
  /<div className="flex flex-col items-center justify-center bg-\[#1e293b\] rounded-xl sm:rounded-2xl w-\[32px\] h-\[40px\] sm:w-\[50px\] sm:h-\[60px\] shadow-sm">\s*<span className="text-xs sm:text-lg font-bold text-white mb-0\.5">\{countdownData\.hours\}<\/span>\s*<span className="text-\[7px\] sm:text-\[10px\] text-slate-400 font-medium tracking-wide">Jam<\/span>\s*<\/div>/,
  '<div className="flex flex-col items-center justify-center bg-[#1e293b] rounded-2xl w-[46px] h-[52px] sm:w-[50px] sm:h-[60px] shadow-sm">\n                            <span className="text-base sm:text-lg font-bold text-white mb-0.5">{countdownData.hours}</span>\n                            <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium tracking-wide">Jam</span>\n                          </div>'
);

code = code.replace(
  /<div className="flex flex-col items-center justify-center bg-\[#1e293b\] rounded-xl sm:rounded-2xl w-\[32px\] h-\[40px\] sm:w-\[50px\] sm:h-\[60px\] shadow-sm">\s*<span className="text-xs sm:text-lg font-bold text-white mb-0\.5">\{countdownData\.minutes\}<\/span>\s*<span className="text-\[7px\] sm:text-\[10px\] text-slate-400 font-medium tracking-wide">Menit<\/span>\s*<\/div>/,
  '<div className="flex flex-col items-center justify-center bg-[#1e293b] rounded-2xl w-[46px] h-[52px] sm:w-[50px] sm:h-[60px] shadow-sm">\n                            <span className="text-base sm:text-lg font-bold text-white mb-0.5">{countdownData.minutes}</span>\n                            <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium tracking-wide">Menit</span>\n                          </div>'
);

code = code.replace(
  /<div className="flex flex-col items-center justify-center bg-\[#1e293b\] rounded-xl sm:rounded-2xl w-\[32px\] h-\[40px\] sm:w-\[50px\] sm:h-\[60px\] shadow-sm">\s*<span className="text-xs sm:text-lg font-bold text-white mb-0\.5">\{countdownData\.seconds\}<\/span>\s*<span className="text-\[7px\] sm:text-\[10px\] text-slate-400 font-medium tracking-wide">Detik<\/span>\s*<\/div>/,
  '<div className="flex flex-col items-center justify-center bg-[#1e293b] rounded-2xl w-[46px] h-[52px] sm:w-[50px] sm:h-[60px] shadow-sm">\n                            <span className="text-base sm:text-lg font-bold text-white mb-0.5">{countdownData.seconds}</span>\n                            <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium tracking-wide">Detik</span>\n                          </div>'
);

code = code.replace(
  /<h4 className="text-slate-800 text-sm sm:text-base font-bold mb-0\.5 sm:mb-1">Pengumuman Belum Dibuka<\/h4>/,
  '<h4 className="text-slate-800 font-bold mb-1">Pengumuman Belum Dibuka</h4>'
);

code = code.replace(
  /<CalendarDays className="w-5 h-5 sm:w-8 sm:h-8 text-blue-600 mb-1 sm:mb-3" \/>/,
  '<CalendarDays className="w-8 h-8 text-blue-600 mb-3" />'
);

code = code.replace(
  /<div className="mb-4 sm:mb-6 flex flex-col items-center justify-center p-3 sm:p-5 bg-blue-50\/50 border border-blue-100 rounded-2xl mx-auto w-fit max-w-full min-w-\[280px\]">/,
  '<div className="mb-6 flex flex-col items-center justify-center p-4 sm:p-5 bg-blue-50/50 border border-blue-100 rounded-2xl mx-auto w-fit max-w-full min-w-[280px]">'
);

fs.writeFileSync('src/Home.tsx', code);
