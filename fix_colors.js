const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'src/pages/Transactions.tsx',
  'src/pages/Insights.tsx',
  'src/pages/Dashboard.tsx',
  'src/components/ui/SmartBanner.tsx',
  'src/components/ui/Input.tsx',
  'src/components/ui/Drawer.tsx',
  'src/components/charts/BarChart.tsx',
  'src/components/charts/AreaChart.tsx',
  'src/components/charts/DonutChart.tsx'
];

function processFile(filePath) {
  const fullPath = path.join(__dirname, filePath);
  if (!fs.existsSync(fullPath)) return;

  let content = fs.readFileSync(fullPath, 'utf8');

  // Replace text-white variations with theme colors
  // text-white -> text-primary (but NOT in specific cases like button/avatar)
  
  // Replace text-white/XX with text-muted or text-secondary
  content = content.replace(/text-white\/[1-3]0/g, 'text-muted');
  content = content.replace(/text-white\/[4-6]0/g, 'text-secondary');
  content = content.replace(/text-white\/[7-9]0/g, 'text-primary');

  // Replace remaining text-white with text-primary (we'll avoid bg-emerald buttons manually if needed, but in most layout places it's fine)
  // Let's rely on context: if it's text-white and NOT preceded by a color class, it's safe. It's too complex. 
  // Let's just blindly replace text-white with text-primary, and we can revert specific buttons.
  content = content.replace(/(?<!bg-[a-z]+-\d+\s.*(?:hover:[a-z]+-[a-z]+-\d+\s.*)?)text-white(?!\/)/g, 'text-primary');

  // Border and Backgrounds
  content = content.replace(/border-white\/10/g, 'border-theme');
  content = content.replace(/border-white\/[2-3]0/g, 'border-theme');
  content = content.replace(/bg-white\/[0-9]+/g, 'bg-[var(--input-bg)]');
  content = content.replace(/bg-[#080D1A]/g, 'bg-[var(--bg-base)]');
  
  fs.writeFileSync(fullPath, content);
  console.log(`Updated ${filePath}`);
}

filesToUpdate.forEach(processFile);
