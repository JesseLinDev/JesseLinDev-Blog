import { Resvg } from '@resvg/resvg-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Define color schemes for different sections
const SECTION_COLORS: Record<string, { accent: string; bg: string }> = {
  writing: { accent: "#f97316", bg: "#0a0a0a" },
  thought: { accent: "#ef4444", bg: "#0a0a0a" },
};

// Escape XML special characters
function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// Wrap text into lines
function wrapText(text: string, fontSize: number, maxWidth: number): string[] {
  const avgCharWidth = fontSize * 0.52;
  const charsPerLine = Math.floor(maxWidth / avgCharWidth);
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (test.length > charsPerLine && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

// Build SVG string
function buildSvg(title: string, section: string): string {
  const colors = SECTION_COLORS[section] || SECTION_COLORS.thought;
  const displayTitle = title.length > 80 ? title.substring(0, 80) + "..." : title;
  const len = displayTitle.length;

  const fontSize = len > 40 ? 48 : len > 25 ? 56 : 64;
  const lineHeight = fontSize * 1.15;
  const lines = wrapText(displayTitle.toLowerCase(), fontSize, 1000);
  const titleBlockHeight = lines.length * lineHeight;
  const titleY = (630 - titleBlockHeight) / 2 + fontSize * 0.8;

  const titleTspans = lines
    .map((line, i) => `<tspan x="60" dy="${i === 0 ? 0 : lineHeight}">${escapeXml(line)}</tspan>`)
    .join("");

  return `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="630" fill="${colors.bg}"/>
    <circle cx="72" cy="60" r="6" fill="${colors.accent}"/>
    <text x="90" y="68" fill="#a3a3a3" font-family="Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-size="24">Jesse Lin · 数字生命 · ${escapeXml(section)}</text>
    <text x="60" y="${titleY}" fill="#ffffff" font-family="Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-size="${fontSize}" font-weight="600" letter-spacing="-0.5">${titleTspans}</text>
    <text x="60" y="580" fill="#a3a3a3" font-family="Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-size="24">them.selv.es</text>
    <rect x="1020" y="577" width="120" height="6" rx="3" fill="${colors.accent}"/>
  </svg>`;
}

// Main function
export function renderOgImage(
  title: string,
  section: string,
  _baseUrl: string
): Uint8Array {
  if (!title || !section) {
    throw new Error('Missing required parameters');
  }

  try {
    const svg = buildSvg(title, section);
    
    const resvg = new Resvg(svg, {
      fitTo: { mode: "width", value: 1200 },
      font: {
        loadSystemFonts: true,
        defaultFontFamily: 'Inter',
        defaultFontSize: 52,
      },
    });
    
    const pngData = resvg.render();
    return pngData.asPng();
  } catch (e) {
    console.error('OG generation failed:', e);
    throw e;
  }
}