import type { APIRoute, GetStaticPaths } from "astro";
import { getCollection } from "astro:content";
import { renderOgImage } from "@utils/og";

const COLLECTION_MAP: Record<string, string> = {
	"writings": "writing",
	"thoughts": "thought",
};

export const getStaticPaths: GetStaticPaths = async () => {
	const paths: { params: { path: string } }[] = [];
	
	for (const [section, collectionName] of Object.entries(COLLECTION_MAP)) {
		try {
			const posts = await getCollection(collectionName as any);
			for (const post of posts) {
				// Generate dark and light theme OG images
				paths.push({
					params: { path: `${section}/${(post as any).slug}.png` }
				});
				paths.push({
					params: { path: `${section}/${(post as any).slug}-light.png` }
				});
			}
		} catch (e) {
			console.warn(`Failed to get paths for ${collectionName}:`, e);
		}
	}
	
	return paths;
};

export const GET: APIRoute = async ({ params, request }) => {
	const fallback = new URL("/images/ogimage.png", request.url).toString();

	try {
		const path = params.path || "";
		const [section, ...rest] = path.split("/");
		const slugWithExt = rest.join("/");
		const isLight = slugWithExt.endsWith("-light.png");
		const slug = slugWithExt.replace(/(-light)?\.png$/, "");

		const collectionName = COLLECTION_MAP[section];
		if (!collectionName || !slug) return Response.redirect(fallback, 302);

		const posts = await getCollection(collectionName as any);
		const post = posts.find((p: any) => p.slug === slug) as
			| { data: { title: string }; slug: string }
			| undefined;
		if (!post) return Response.redirect(fallback, 302);

		// Generate both dark and light OG images
		const baseUrl = request.url;
		const pngBuffers = renderOgImage(post.data.title, collectionName, baseUrl);
		const pngBuffer = isLight ? pngBuffers.light : pngBuffers.dark;

		return new Response(pngBuffer.buffer as ArrayBuffer, {
			headers: {
				"Content-Type": "image/png",
				"Cache-Control": "public, max-age=86400, s-maxage=604800",
			},
		});
	} catch (e) {
		console.error("OG image generation failed:", e);
		return Response.redirect(fallback, 302);
	}
};