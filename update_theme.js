const fs = require("fs");
let content = fs.readFileSync("app/page.tsx", "utf-8");

content = content.replace(/@import url\('https:\/\/fonts.googleapis.com\/css2[^']+'\);/g, "");
content = content.replace(/body\s*\{\s*font-family:\s*'DM Sans',\s*sans-serif;\s*\}/g, "");
content = content.replace(/h1,h2,h3,h4\s*\{\s*font-family:\s*'Syne',\s*sans-serif;\s*\}/g, "");

content = content.replace(/bg-\[#09090f\]/g, "bg-white");
content = content.replace(/text-white font-sans/g, "text-zinc-900 font-sans");
content = content.replace(/bg-white\/\[0\.02\]/g, "bg-zinc-50");
content = content.replace(/bg-white\/\[0\.015\]/g, "bg-zinc-50");
content = content.replace(/border-white\/5/g, "border-zinc-200");
content = content.replace(/border-white\/10/g, "border-zinc-300");
content = content.replace(/bg-white\/5/g, "bg-white");
content = content.replace(/bg-white\/10/g, "bg-zinc-100");
content = content.replace(/text-zinc-400/g, "text-zinc-600");
content = content.replace(/text-zinc-500/g, "text-zinc-500");
content = content.replace(/text-white/g, "text-zinc-900");

// Note: after replacing text-white with text-zinc-900 globally, we need to fix it for the dark colored buttons
content = content.replace(/bg-indigo-600 hover:bg-indigo-500 text-zinc-900/g, "bg-[#B21563] hover:bg-[#911050] text-[#f4f4f5]");
content = content.replace(/bg-indigo-500\/10/g, "bg-[#B21563]/10");
content = content.replace(/border-indigo-500\/20/g, "border-[#B21563]/20");
content = content.replace(/border-indigo-500\/30/g, "border-[#B21563]/30");
content = content.replace(/shadow-indigo-700\/40/g, "shadow-[#B21563]/40");
content = content.replace(/hover:shadow-indigo-600\/60/g, "hover:shadow-[#B21563]/60");
content = content.replace(/hover:border-indigo-500\/30/g, "hover:border-[#B21563]/30");

content = content.replace(/from-indigo-400 to-indigo-700/g, "from-[#B21563] to-[#7a0e43]");
content = content.replace(/from-indigo-400 to-violet-500/g, "from-[#B21563] to-[#7a0e43]");
content = content.replace(/from-indigo-400 via-violet-400 to-blue-500/g, "from-[#B21563] via-[#D81B60] to-[#7a0e43]");
content = content.replace(/from-indigo-400 via-violet-400 to-blue-400/g, "from-[#B21563] via-[#D81B60] to-[#7a0e43]");
content = content.replace(/bg-gradient-to-t from-indigo-700 to-indigo-400/g, "bg-gradient-to-t from-[#B21563] to-[#911050]");

content = content.replace(/text-indigo-400/g, "text-[#B21563]");
content = content.replace(/text-indigo-300/g, "text-[#B21563]");

content = content.replace(/bg-indigo-600/g, "bg-[#B21563]");
content = content.replace(/hover:bg-indigo-500/g, "hover:bg-[#911050]");
content = content.replace(/bg-gradient-to-r from-indigo-500\/0 via-white\/10 to-indigo-500\/0/g, "bg-gradient-to-r from-[#B21563]/0 via-[#B21563]/20 to-[#B21563]/0");

content = content.replace(/bg-indigo-400/g, "bg-[#B21563]");
content = content.replace(/bg-indigo-500/g, "bg-[#B21563]");
content = content.replace(/bg-indigo-900\/40/g, "bg-[#B21563]/10");
content = content.replace(/bg-violet-900\/30/g, "bg-[#911050]/10");
content = content.replace(/bg-blue-900\/30/g, "bg-[#D81B60]/10");
content = content.replace(/bg-indigo-600\/20/g, "bg-[#B21563]/20");
content = content.replace(/bg-gradient-to-br from-indigo-900\/20/g, "bg-gradient-to-br from-[#B21563]/10");
content = content.replace(/rgba\(99,102,241,0\.25\)/g, "rgba(178,21,99,0.15)");
content = content.replace(/rgba\(99,102,241,0\.15\)/g, "rgba(178,21,99,0.1)");
content = content.replace(/bg-gradient-to-br from-indigo-500\/5/g, "bg-gradient-to-br from-[#B21563]/5");
content = content.replace(/rgba\(99,102,241,\.8\)/g, "rgba(178,21,99,0.2)");

// Background lines (dark to light)
content = content.replace(/rgba\(255,255,255,\.6\)/g, "rgba(0,0,0,0.05)");
content = content.replace(/bg-white\/\[0\.05\]/g, "bg-white");

// Fix buttons text correctly since we globally replaced text-white
content = content.replace(/className="relative overflow-hidden bg-\[#B21563\] hover:bg-\[#911050\] text-zinc-900/g, "className=\"relative overflow-hidden bg-[#B21563] hover:bg-[#911050] text-[#f4f4f5]");
content = content.replace(/className="bg-\[#B21563\] hover:bg-\[#911050\] text-zinc-900/g, "className=\"bg-[#B21563] hover:bg-[#911050] text-[#f4f4f5]");

fs.writeFileSync("app/page.tsx", content);
