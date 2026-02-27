import { Resvg } from '@resvg/resvg-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Color schemes for dark/light themes
const DARK_COLORS = { bg: "#0a0a0a", text: "#ffffff", meta: "#a3a3a3" };
const LIGHT_COLORS = { bg: "#f9fafb", text: "#111827", meta: "#6b7280" };

const SECTION_COLORS = {
  writing: { dark: "#f97316", light: "#ea580c" },
  thought: { dark: "#ef4444", light: "#dc2626" },
};

// Load font from public/fonts directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const FONT_PATH = join(__dirname, '..', 'public', 'fonts', 'NotoSansSC.otf');

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

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

function buildSvgs(title: string, section: string) {
  const accent = SECTION_COLORS[section as keyof typeof SECTION_COLORS] || SECTION_COLORS.thought;
  const displayTitle = title.length > 80 ? title.substring(0, 80) + "..." : title;
  const len = displayTitle.length;
  const fontSize = len > 40 ? 48 : len > 25 ? 56 : 64;
  const lineHeight = fontSize * 1.15;
  const lines = wrapText(displayTitle.toLowerCase(), fontSize, 1000);
  const titleBlockHeight = lines.length * lineHeight;
  const titleY = (630 - titleBlockHeight) / 2 + fontSize * 0.8;
  const titleTspans = lines.map((line, i) => `<tspan x="60" dy="${i === 0 ? 0 : lineHeight}">${escapeXml(line)}</tspan>`).join("");

  const darkSvg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="630" fill="${DARK_COLORS.bg}"/>
    <circle cx="72" cy="60" r="6" fill="${accent.dark}"/>
    <text x="90" y="68" fill="${DARK_COLORS.meta}" font-family="Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-size="24">Jesse Lin · 数字生命 · ${section}</text>
    <text x="60" y="${titleY}" fill="${DARK_COLORS.text}" font-family="Noto Sans SC" font-size="${fontSize}" font-weight="600" letter-spacing="-0.5">${titleTspans}</text>
    <text x="60" y="580" fill="${DARK_COLORS.meta}" font-family="Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-size="24">them.selv.es</text>
    <rect x="1020" y="577" width="120" height="6" rx="3" fill="${accent.dark}"/>
  </svg>`;

  const lightSvg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="630" fill="${LIGHT_COLORS.bg}"/>
    <circle cx="72" cy="60" r="6" fill="${accent.light}"/>
    <text x="90" y="68" fill="${LIGHT_COLORS.meta}" font-family="Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-size="24">Jesse Lin · 数字生命 · ${section}</text>
    <text x="60" y="${titleY}" fill="${LIGHT_COLORS.text}" font-family="Noto Sans SC" font-size="${fontSize}" font-weight="600" letter-spacing="-0.5">${titleTspans}</text>
    <text x="60" y="580" fill="${LIGHT_COLORS.meta}" font-family="Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-size="24">them.selv.es</text>
    <rect x="1020" y="577" width="120" height="6" rx="3" fill="${accent.light}"/>
  </svg>`;

  return { dark: darkSvg, light: lightSvg };
}

export function renderOgImage(title: string, section: string, _baseUrl: string) {
  if (!title || !section) throw new Error('Missing required parameters');

  const svgs = buildSvgs(title, section);
  
  // Use both custom font and system Inter as fallback
  const resvgDark = new Resvg(svgs.dark, {
    fitTo: { mode: "width", value: 1200 },
    font: {
      fontFiles: [FONT_PATH],
      loadSystemFonts: true, // Load system fonts as fallback
      defaultFontFamily: 'Noto Sans SC',
    },
  });
  const darkPng = resvgDark.render().asPng();
  
  const resvgLight = new Resvg(svgs.light, {
    fitTo: { mode: "width", value: 1200 },
    font: {
      fontFiles: [FONT_PATH],
      loadSystemFonts: true,
      defaultFontFamily: 'Noto Sans SC',
    },
  });
  const lightPng = resvgLight.render().asPng();
  
  return { dark: darkPng, light: lightPng };
}