<script lang="ts">
	import {
		DEFAULT_DESCRIPTION,
		OG_IMAGE_PATH,
		SITE_NAME,
		absoluteUrl,
		normalizePath,
	} from "$lib/seo";

	let {
		title = SITE_NAME,
		description = DEFAULT_DESCRIPTION,
		pathname = "/",
		image = OG_IMAGE_PATH,
		type = "website",
		noindex = false,
	} = $props<{
		title?: string;
		description?: string;
		pathname?: string;
		image?: string;
		type?: "website" | "article";
		noindex?: boolean;
	}>();

	const canonicalUrl = $derived(absoluteUrl(normalizePath(pathname)));
	const imageUrl = $derived(absoluteUrl(image));
	const robots = $derived(noindex ? "noindex,follow" : "index,follow");
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<meta name="robots" content={robots} />
	<link rel="canonical" href={canonicalUrl} />

	<meta property="og:site_name" content={SITE_NAME} />
	<meta property="og:type" content={type} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={canonicalUrl} />
	<meta property="og:image" content={imageUrl} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:image:alt" content={title} />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={imageUrl} />
</svelte:head>
