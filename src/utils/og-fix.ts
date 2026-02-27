import { Resvg, initWasm } from '@resvg/resvg-wasm';

// WASM初始化标志
let wasmInitialized = false;

// 字体缓存（如果后续需要添加字体支持）
let fontCache: Uint8Array | null = null;

// 定义不同section的颜色配置
const SECTION_CONFIG: Record<string, { accent: string; bg: string; }> = {
  writing: { accent: "#f97316", bg: "#0a0a0a" }, // orange
  thought: { accent: "#ef4444", bg: "#0a0a0a" }, // red
};

// 初始化WASM，支持Node.js和浏览器环境
async function initWasmOnce(): Promise<void> {
  if (wasmInitialized) return;
  
  try {
    // 在构建环境中直接加载文件系统
    const { readFileSync } = await import('fs');
    const wasmPath = new URL('./resvg.wasm', import.meta.url).pathname;
    const wasmBuffer = readFileSync(wasmPath);
    await initWasm(wasmBuffer);
    wasmInitialized = true;
    console.log('WASM initialized from filesystem');
  } catch (fsError) {
    // 在浏览器环境或Vite构建中，尝试通过URL加载
    try {
      const wasmUrl = new URL('./resvg.wasm', import.meta.url).href;
      const wasmResponse = await fetch(wasmUrl);
      if (!wasmResponse.ok) throw new Error(`Failed to fetch WASM: ${wasmResponse.status}`);
      
      const wasmBuffer = await wasmResponse.arrayBuffer();
      await initWasm(wasmBuffer);
      wasmInitialized = true;
      console.log('WASM initialized from URL fetch');
    } catch (fetchError) {
      console.error('WASM initialization failed:', fetchError);
      throw new Error('Failed to initialize resvg WASM: both filesystem and URL fetch failed');
    }
  }
}

// 文本转义
function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// 文本换行处理
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

// 构建SVG
function buildSvg(title: string, section: string): string {
  const config = SECTION_CONFIG[section] || SECTION_CONFIG.thought;
  
  // 限制标题长度
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
  <rect width="1200" height="630" fill="${config.bg}"/>
  <circle cx="72" cy="60" r="6" fill="${config.accent}"/>
  <text x="90" y="68" fill="#a3a3a3" font-family="Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-size="24">Jesse Lin · 数字生命 · ${escapeXml(section)}</text>
  <text x="60" y="${titleY}" fill="#ffffff" font-family="Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-size="${fontSize}" font-weight="600" letter-spacing="-0.5">${titleTspans}</text>
  <text x="60" y="580" fill="#a3a3a3" font-family="Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-size="24">them.selv.es</text>
  <rect x="1020" y="577" width="120" height="6" rx="3" fill="${config.accent}"/>
</svg>`;
}

// 主函数
export async function renderOgImage(
  title: string,
  section: string,
  _baseUrl: string
): Promise<Uint8Array> {
  if (!title || !section) {
    throw new Error('Missing required parameters');
  }

  try {
    await initWasmOnce();
    
    const svg = buildSvg(title, section);
    const resvg = new Resvg(svg, {
      fitTo: { mode: "width", value: 1200 },
      font: {
        loadSystemFonts: true, // Use system Inter font
        defaultFontFamily: 'Inter',
        defaultFontSize: 52,
      },
    });
    
    return resvg.render().asPng();
  } catch (e) {
    console.error('OG generation failed:', e);
    throw e;
  }
}