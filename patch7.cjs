const fs = require('fs');
let code = fs.readFileSync('src/Home.tsx', 'utf8');

code = code.replace(
  'bg-white border border-slate-100 rounded-[16px] p-4 sm:p-5 mb-4 text-left shadow-[0_2px_10px_rgb(0,0,0,0.02)]',
  'bg-white border border-slate-100 rounded-[16px] p-3 sm:p-5 mb-3 sm:mb-4 text-left shadow-[0_2px_10px_rgb(0,0,0,0.02)]'
);

code = code.replace(
  '<button onClick={() => setSearchActivity([])}',
  '<button className="h-10 sm:h-12 w-full mt-2"'
);

fs.writeFileSync('src/Home.tsx', code);
