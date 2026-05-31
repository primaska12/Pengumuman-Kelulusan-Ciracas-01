const fs = require('fs');
let code = fs.readFileSync('src/Home.tsx', 'utf8');

code = code.replace(/<div className="absolute top-0 left-0 w-1 h-full bg-blue-500"><\/div>/g, '');

const tkaContentStart = code.indexOf('<ResultRow label="Bahasa Indonesia" value={searchResult.nilaiBIndonesia || \'-\'} highlightValue />');
if (tkaContentStart !== -1) {
    const pt2mt2Start = code.indexOf('<div className="pt-2 mt-2">', tkaContentStart);
    if (pt2mt2Start !== -1) {
        const motionDivEnd = code.indexOf('</motion.div>', pt2mt2Start);
        if (motionDivEnd !== -1) {
            code = code.substring(0, pt2mt2Start) + '\n                        ' + code.substring(motionDivEnd);
        }
    }
}

code = code.replace(/text-5xl sm:text-6xl/g, 'text-4xl sm:text-6xl');
code = code.replace(/mb-6 sm:mb-8 mt-2/g, 'mb-4 mt-2 sm:mb-6');
code = code.replace(/mb-8 bg-amber-50 border border-amber-200 text-amber-800 px-5 py-4 rounded-2xl text-sm/g, 'mb-4 bg-amber-50 border border-amber-200 text-amber-800 px-5 py-3 rounded-2xl text-xs sm:text-sm');
code = code.replace(/mb-8 bg-red-50 border border-red-200 text-red-800 px-5 py-4 rounded-2xl text-sm/g, 'mb-4 bg-red-50 border border-red-200 text-red-800 px-5 py-3 rounded-2xl text-xs sm:text-sm');
code = code.replace(/p-4 sm:p-5 mb-5 text-left/g, 'p-4 sm:p-5 mb-4 text-left');
code = code.replace(/p-4 sm:p-5 mb-6 text-left/g, 'p-4 sm:p-5 mb-4 text-left');

fs.writeFileSync('src/Home.tsx', code);
