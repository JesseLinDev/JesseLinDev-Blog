import { Resvg } from '@resvg/resvg-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Define color schemes for different sections (dark/light themes)
const DARK_COLORS = { bg: "#0a0a0a", text: "#ffffff", accent: "#ef4444" };
const LIGHT_COLORS = { bg: "#f9fafb", text: "#111827", accent: "#dc2626" };

const SECTION_CONFIG: Record<string, { accent: { dark: string; light: string } }> = {
  writing: { accent: { dark: "#f97316", light: "#ea580c" } },
  thought: { accent: { dark: "#ef4444", light: "#dc2626" } },
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

// Build SVG strings (dark and light themes)
function buildSvgs(title: string, section: string): { dark: string; light: string } {
  const config = SECTION_CONFIG[section] || SECTION_CONFIG.thought;
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

  // Dark theme SVG
  const darkSvg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="630" fill="${DARK_COLORS.bg}"/>
    <circle cx="72" cy="60" r="6" fill="${config.accent.dark}"/>
    <text x="90" y="68" fill="#a3a3a3" font-family="Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-size="24">Jesse Lin · 数字生命 · ${escapeXml(section)}</text>
    <text x="60" y="${titleY}" fill="${DARK_COLORS.text}" font-family="Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-size="${fontSize}" font-weight="600" letter-spacing="-0.5">${titleTspans}</text>
    <text x="60" y="580" fill="#a3a3a3" font-family="Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-size="24">them.selv.es</text>
    <rect x="1020" y="577" width="120" height="6" rx="3" fill="${config.accent.dark}"/>
  </svg>`;

  // Light theme SVG
  const lightSvg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="630" fill="${LIGHT_COLORS.bg}"/>
    <circle cx="72" cy="60" r="6" fill="${config.accent.light}"/>
    <text x="90" y="68" fill="#6b7280" font-family="Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-size="24">Jesse Lin · 数字生命 · ${escapeXml(section)}</text>
    <text x="60" y="${titleY}" fill="${LIGHT_COLORS.text}" font-family="Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-size="${fontSize}" font-weight="600" letter-spacing="-0.5">${titleTspans}</text>
    <text x="60" y="580" fill="#6b7280" font-family="Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-size="24">them.selv.es</text>
    <rect x="1020" y="577" width="120" height="6" rx="3" fill="${config.accent.light}"/>
  </svg>`;

  return { dark: darkSvg, light: lightSvg };
}

// Main function - returns both dark and light theme images
export function renderOgImage(
  title: string,
  section: string,
  _baseUrl: string
): { dark: Uint8Array; light: Uint8Array } {
  if (!title || !section) {
    throw new Error('Missing required parameters');
  }

  try {
    const svgs = buildSvgs(title, section);
    
    // 加载中文字体 + 支持系统字体
    const currentDir = dirname(fileURLToPath(import.meta.url));
    const fontPath = join(currentDir, '..', 'assets', 'fonts', 'NotoSansSC.otf');
    const fontFile = join(currentDir, '..', '..', 'public', 'fonts', 'NotoSansSC.otf');
    
    // Dark theme image
    const resvgDark = new Resvg(svgs.dark, {
      fitTo: { mode: "width", value: 1200 },
      font: {
        fontFiles: [fontFile],
        loadSystemFonts: false,
        defaultFontFamily: 'Noto Sans SC',
        defaultFontSize: 52,
      },
    });
    const darkPng = resvgDark.render().asPng();
    
    // Light theme image
    const resvgLight = new Resvg(svgs.light, {
      fitTo: { mode: "width", value: 1200 },
      font: {
        fontFiles: [fontFile],
        loadSystemFonts: false,
        defaultFontFamily: 'Noto Sans SC',
        defaultFontSize: 52,
      },
    });
    const lightPng = resvgLight.render().asPng();
    
    return darkPng;
  } catch (e) {
    console.error('OG generation failed:', e);
    throw e;
  }
}