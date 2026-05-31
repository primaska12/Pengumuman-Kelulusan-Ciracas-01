const fs = require('fs');
let code = fs.readFileSync('src/Home.tsx', 'utf8');

// 1. Hide nav on mobile
code = code.replace(
  '<nav className="relative z-10 w-full px-6 md:px-10 py-6 flex justify-between items-center bg-transparent">',
  '<nav className="relative z-10 w-full px-6 md:px-10 py-6 hidden sm:flex justify-between items-center bg-transparent">'
);

// 2. Remove description text
code = code.replace(
  /\s*\{!searchResult && !error && !prankMessage && \(\s*<p className="text-base sm:text-xl text-slate-500 max-w-\[640px\] mx-auto leading-relaxed">\s*Portal resmi pengumuman hasil kelulusan\. Silakan masukkan NISN untuk melihat status\.\s*<\/p>\s*\)\}/,
  ''
);

// 3. Shrink countdown boxes further
code = code.replace(/w-\[44px\] h-\[52px\] sm:w-\[60px\] sm:h-\[70px\]/g, 'w-[38px] h-[46px] sm:w-[50px] sm:h-[60px]');
code = code.replace(/text-base sm:text-xl/g, 'text-sm sm:text-lg');
code = code.replace(/text-\[9px\] sm:text-\[10px\]/g, 'text-[8px] sm:text-[10px]');

fs.writeFileSync('src/Home.tsx', code);
