// 暂时禁用OG图像生成功能，避免WASM构建问题
// TODO: 修复WASM文件在静态构建中的路径问题

export async function renderOgImage(
	_title: string,
	_section: string,
	_baseUrl: string,
): Promise<Uint8Array> {
	// 返回简单的PNG图像或抛出错误，让前端使用默认图像
	throw new Error("OG image generation temporarily disabled");
}
