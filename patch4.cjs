const fs = require('fs');
let code = fs.readFileSync('src/Home.tsx', 'utf8');

code = code.replace(
  '<label htmlFor="nisn" className="text-sm font-semibold text-slate-700 mb-3 block">',
  '<label htmlFor="nisn" className="text-sm font-semibold text-slate-700 mb-2 sm:mb-3 block">'
);

code = code.replace(
  '<form onSubmit={handleSearch} className="space-y-3 sm:space-y-6">',
  '<form onSubmit={handleSearch} className="space-y-3 sm:space-y-5">'
);

fs.writeFileSync('src/Home.tsx', code);
