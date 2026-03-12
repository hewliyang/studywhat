import { degrees } from "$lib/data";
import { SITE_URL } from "$lib/seo";

export const prerender = true;

export function GET() {
	const now = new Date().toISOString();
	const pages = ["/", "/movement", "/disclaimers", ...degrees.map((degree) => `/degree/${degree.slug}`)];

	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
	.map(
		(path) => `  <url>\n    <loc>${new URL(path, SITE_URL).toString()}</loc>\n    <lastmod>${now}</lastmod>\n  </url>`
	)
	.join("\n")}
</urlset>`;

	return new Response(body, {
		headers: {
			"content-type": "application/xml; charset=utf-8",
			"cache-control": "public, max-age=0, s-maxage=3600",
		},
	});
}
