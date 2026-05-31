const fs = require('fs');
let code = fs.readFileSync('src/Home.tsx', 'utf8');

code = code.replace(
  'py-2.5 sm:py-3',
  'py-1.5 sm:py-3'
);

code = code.replace(
  '<div className="flex items-center gap-3 mb-4">',
  '<div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-4">'
);

code = code.replace(
  'bg-white border border-slate-100 rounded-[16px] p-4 sm:p-5 mb-4 text-left shadow-[0_2px_10px_rgb(0,0,0,0.02)]',
  'bg-white border border-slate-100 rounded-[16px] p-3 sm:p-5 mb-3 sm:mb-4 text-left shadow-[0_2px_10px_rgb(0,0,0,0.02)]'
);

code = code.replace(
  '<h4 className="text-xs sm:text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider pl-2">',
  '<h4 className="text-[11px] sm:text-sm font-bold text-slate-700 mb-2 sm:mb-3 uppercase tracking-wider pl-2">'
);

fs.writeFileSync('src/Home.tsx', code);
