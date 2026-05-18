import sharp from "sharp";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const W = 1200;
const H = 800;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#050608"/>
      <stop offset="100%" stop-color="#0a0f14"/>
    </linearGradient>
    <linearGradient id="scanGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#5be9d3" stop-opacity="0"/>
      <stop offset="50%" stop-color="#5be9d3" stop-opacity="0.05"/>
      <stop offset="100%" stop-color="#5be9d3" stop-opacity="0"/>
    </linearGradient>
    <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
      <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#5be9d3" stroke-opacity="0.05" stroke-width="1"/>
    </pattern>
    <pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="0.6" fill="#5be9d3" fill-opacity="0.08"/>
    </pattern>
  </defs>

  <!-- Background layers -->
  <rect width="${W}" height="${H}" fill="url(#bgGrad)"/>
  <rect width="${W}" height="${H}" fill="url(#grid)"/>
  <rect x="0" y="320" width="${W}" height="140" fill="url(#scanGrad)"/>

  <!-- Top bar -->
  <line x1="0" y1="64" x2="${W}" y2="64" stroke="#1f2731" stroke-width="1"/>
  <circle cx="64" cy="40" r="4" fill="#5be9d3"/>
  <text x="84" y="46" font-family="Consolas, 'Courier New', monospace" font-size="13" font-weight="500" fill="#e2e8ee" letter-spacing="3.5">PROMPT FORENSICS</text>
  <text x="296" y="46" font-family="Consolas, 'Courier New', monospace" font-size="12" fill="#6a7682" letter-spacing="2">/ v0.1.0 · build 240517</text>
  <text x="${W - 64}" y="46" font-family="Consolas, 'Courier New', monospace" font-size="12" fill="#6a7682" letter-spacing="2.5" text-anchor="end">FORENSIC CONSOLE</text>

  <!-- Hero kicker label -->
  <g transform="translate(72, 130)">
    <rect x="0" y="0" width="8" height="8" fill="#5be9d3"/>
    <text x="20" y="9" font-family="Consolas, 'Courier New', monospace" font-size="13" fill="#5be9d3" letter-spacing="3.5">STATIC ANALYSIS · FORENSIC CONSOLE FOR LLM PROMPTS</text>
  </g>

  <!-- Headline -->
  <text x="72" y="266" font-family="'Segoe UI', 'Helvetica Neue', Arial, sans-serif" font-size="86" font-weight="600" fill="#e2e8ee" letter-spacing="-2">find injection holes</text>
  <text x="72" y="360" font-family="'Segoe UI', 'Helvetica Neue', Arial, sans-serif" font-size="86" font-weight="600" letter-spacing="-2"><tspan fill="#5be9d3">before attackers</tspan><tspan fill="#e2e8ee" dx="22">do.</tspan></text>

  <!-- Tagline -->
  <text x="72" y="424" font-family="'Segoe UI', 'Helvetica Neue', Arial, sans-serif" font-size="20" fill="#e2e8ee" fill-opacity="0.7">14 detectors · 8 vulnerability categories · AI forensic notes</text>

  <!-- Bottom dashboard panel -->
  <line x1="0" y1="540" x2="${W}" y2="540" stroke="#1f2731" stroke-width="1"/>

  <!-- Risk score block -->
  <g transform="translate(72, 580)">
    <text x="0" y="0" font-family="Consolas, 'Courier New', monospace" font-size="11" fill="#6a7682" letter-spacing="2.5">RISK SCORE</text>
    <text x="0" y="62" font-family="'Segoe UI', 'Helvetica Neue', Arial, sans-serif" font-size="62" font-weight="600" fill="#ff3358">100</text>
    <text x="124" y="62" font-family="Consolas, 'Courier New', monospace" font-size="16" fill="#6a7682">/ 100</text>
    <text x="0" y="92" font-family="Consolas, 'Courier New', monospace" font-size="11" fill="#ff3358" letter-spacing="2.5">CRITICAL · BANKING SUPPORT BOT</text>
  </g>

  <!-- Severity ticks -->
  <g transform="translate(440, 580)">
    <text x="0" y="0" font-family="Consolas, 'Courier New', monospace" font-size="11" fill="#6a7682" letter-spacing="2.5">FINDINGS BY SEVERITY</text>
    ${severityTick(0, 32, "CRITICAL", "7", "#ff3358")}
    ${severityTick(132, 32, "HIGH", "5", "#ff8a3d")}
    ${severityTick(232, 32, "MEDIUM", "2", "#ffc24a")}
    ${severityTick(352, 32, "LOW", "0", "#3a4452", true)}
    ${severityTick(452, 32, "INFO", "0", "#3a4452", true)}
  </g>

  <!-- Top finding callout (single line) -->
  <g transform="translate(72, 690)">
    <line x1="0" y1="0" x2="${W - 144}" y2="0" stroke="#1f2731" stroke-width="1"/>
    <text x="0" y="28" font-family="Consolas, 'Courier New', monospace" font-size="10" fill="#6a7682" letter-spacing="2.5">TOP FINDING</text>
    <rect x="0" y="38" width="78" height="18" fill="#ff3358" fill-opacity="0.14" stroke="#ff3358" stroke-opacity="0.4"/>
    <text x="12" y="51" font-family="Consolas, 'Courier New', monospace" font-size="10" fill="#ff3358" letter-spacing="1.8">CRITICAL</text>
    <text x="92" y="51" font-family="Consolas, 'Courier New', monospace" font-size="14" fill="#e2e8ee" opacity="0.9">secret_exposure · Stripe + GitHub PAT + AWS key embedded in prompt body</text>
  </g>

  <!-- Footer strip -->
  <line x1="0" y1="${H - 48}" x2="${W}" y2="${H - 48}" stroke="#1f2731" stroke-width="1"/>
  <text x="72" y="${H - 22}" font-family="Consolas, 'Courier New', monospace" font-size="11" fill="#6a7682" letter-spacing="3">UOE SUMMER OF CODE 2026  /  CYBERSECURITY × AI/ML</text>
  <text x="${W - 72}" y="${H - 22}" font-family="Consolas, 'Courier New', monospace" font-size="11" fill="#5be9d3" letter-spacing="2.5" text-anchor="end">BUILT BY BETO-LLANOS</text>
</svg>`;

function severityTick(x, y, label, count, color, dim) {
  const labelFill = dim ? "#3a4452" : "#6a7682";
  const countFill = dim ? "#3a4452" : color;
  return `
    <g transform="translate(${x}, ${y})">
      <text x="0" y="0" font-family="Consolas, 'Courier New', monospace" font-size="10" fill="${labelFill}" letter-spacing="2">${label}</text>
      <text x="0" y="34" font-family="'Segoe UI', 'Helvetica Neue', Arial, sans-serif" font-size="28" font-weight="600" fill="${countFill}">${count}</text>
    </g>`;
}

const outPath = resolve(process.cwd(), "public", "thumbnail.png");
const svgPath = resolve(process.cwd(), "public", "thumbnail.svg");

writeFileSync(svgPath, svg);

await sharp(Buffer.from(svg))
  .resize(W, H)
  .png({ compressionLevel: 9, quality: 95 })
  .toFile(outPath);

const stats = await sharp(outPath).metadata();
console.log(`Thumbnail written: ${outPath}`);
console.log(`Dimensions: ${stats.width}x${stats.height}`);
console.log(`SVG source:   ${svgPath}`);
