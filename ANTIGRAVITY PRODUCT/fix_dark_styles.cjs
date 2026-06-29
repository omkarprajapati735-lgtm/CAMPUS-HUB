const fs = require('fs');
const path = require('path');
const dir = path.join(process.cwd(), 'src/pages');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

const replacements = [
  // 1. Missing dark background/text on standard inputs
  [
    'className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"',
    'className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white"'
  ],
  [
    'className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono"',
    'className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono bg-white dark:bg-slate-800 text-slate-900 dark:text-white"'
  ],
  [
    'className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono"',
    'className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono bg-white dark:bg-slate-800 text-slate-900 dark:text-white"'
  ],
  [
    'className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm resize-none"',
    'className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm resize-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white"'
  ],
  
  // 2. Selects missing text colors
  [
    'className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-900"',
    'className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white"'
  ],
  [
    'className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-900"',
    'className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white"'
  ],
  [
    'className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-900"',
    'className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white"'
  ],
  [
    'className="px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-900"',
    'className="px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white"'
  ],
  [
    'className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:border-indigo-400 transition bg-white dark:bg-slate-900"',
    'className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:border-indigo-400 transition bg-white dark:bg-slate-900 text-slate-900 dark:text-white"'
  ],

  // 3. Lists with light backgrounds (bg-slate-50/80)
  [
    'className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/80 border border-slate-100 dark:border-slate-800"',
    'className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800"'
  ],
  [
    'className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/80 border border-slate-100 dark:border-slate-800"',
    'className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800"'
  ],
  [
    'className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/80"',
    'className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40"'
  ],
  [
    'className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/80"',
    'className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40"'
  ],
  
  // 4. Tables with divide-slate-50
  [
    'className="divide-y divide-slate-50"',
    'className="divide-y divide-slate-50 dark:divide-slate-800"'
  ],

  // 5. Login inputs (bg-slate-50/50)
  [
    'className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-slate-50/50',
    'className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white'
  ],
  [
    'className="w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono bg-slate-50/50',
    'className="w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white'
  ],
  [
    'className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 p-5 sm:p-6"',
    'className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 p-5 sm:p-6"'
  ],

  // 6. Settings values (bg-slate-50)
  [
    'bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-lg',
    'bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-1 rounded-lg'
  ],

  // 7. Quick actions backgrounds
  [
    'color: "text-indigo-600 bg-indigo-50"',
    'color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 dark:text-indigo-400"'
  ],
  [
    'color: "text-emerald-600 bg-emerald-50"',
    'color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400"'
  ],
  [
    'color: "text-amber-600 bg-amber-50"',
    'color: "text-amber-600 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-400"'
  ],
  [
    'color: "text-rose-600 bg-rose-50"',
    'color: "text-rose-600 bg-rose-50 dark:bg-rose-500/10 dark:text-rose-400"'
  ],
  [
    'color: "text-violet-600 bg-violet-50"',
    'color: "text-violet-600 bg-violet-50 dark:bg-violet-500/10 dark:text-violet-400"'
  ],

  // 8. Roll number badge
  [
    'className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-semibold font-mono border border-indigo-200"',
    'className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-xs font-semibold font-mono border border-indigo-200 dark:border-indigo-500/20"'
  ]
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
