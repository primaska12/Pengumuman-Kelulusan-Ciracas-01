const fs = require('fs');
let code = fs.readFileSync('src/Home.tsx', 'utf8');

code = code.replace(
  'h-[52px] flex items-center justify-center gap-2 bg-slate-800',
  'h-[42px] sm:h-[52px] flex items-center justify-center gap-2 bg-slate-800'
);

fs.writeFileSync('src/Home.tsx', code);
