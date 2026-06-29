const fs = require('fs');
const path = require('path');
const dir = path.join(process.cwd(), 'src/pages');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

const replacements = [
  // Fix input fields missing dark bg
  ['rounded-xl text-sm" placeholder=', 'rounded-xl text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white" placeholder='],
  ['rounded-xl text-sm font-mono" placeholder=', 'rounded-xl text-sm font-mono bg-white dark:bg-slate-800 text-slate-900 dark:text-white" placeholder='],
  ['rounded-xl text-sm resize-none" placeholder=', 'rounded-xl text-sm resize-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white" placeholder='],
  // Fix hover:bg-rose-50 in dark mode
  ['hover:bg-rose-50 rounded-lg', 'hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg'],
  // Tooltip chart styles
  ['borderRadius: "12px", border: "1px solid #e2e8f0"', 'borderRadius: "12px", border: "1px solid #334155"'],
  // Active filter in dark mode - where it shows dark text on dark bg
  ['bg-slate-900 dark:bg-white dark:text-slate-900 text-white', 'bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white'],
];

let totalChanges = 0;
for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let changes = 0;
  for (const [from, to] of replacements) {
    if (content.includes(to)) continue;
    const count = content.split(from).length - 1;
    if (count > 0) {
      content = content.split(from).join(to);
      changes += count;
    }
  }
  if (changes > 0) {
    fs.writeFileSync(filePath, content);
    console.log(file + ': ' + changes + ' replacements');
    totalChanges += changes;
  }
}
console.log('Total replacements: ' + totalChanges);
