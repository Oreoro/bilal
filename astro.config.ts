import { defineConfig } from "astro/config";
// import { remarkReadingTime } from "./src/utils/remark-reading-time"; // Assuming this is commented out intentionally
import tailwind from "@astrojs/tailwind";
import path from "path";
import { CUSTOM_DOMAIN, BASE_PATH } from "./src/constants";

// Removed the duplicate import for CUSTOM_DOMAIN

const getSite = function () {
    if (CUSTOM_DOMAIN) {
        return new URL(BASE_PATH, `https://${CUSTOM_DOMAIN}`).toString();
    }
    return ""; // Assuming you want to return an empty string if CUSTOM_DOMAIN is false
};

import EntryCacheEr from "./src/integrations/entry-cache-er";
import PublicNotionCopier from "./src/integrations/public-notion-copier";
import DeleteBuildCache from "./src/integrations/delete-build-cache";
import buildTimestampRecorder from "./src/integrations/build-timestamp-recorder.ts";
import CSSWriter from "./src/integrations/theme-constants-to-css";
import robotsTxt from "astro-robots-txt";
import config from "./constants-config.json";
import partytown from "@astrojs/partytown";
const key_value_from_json = {
	...config,
};
function modifyRedirectPaths(
	redirects: Record<string, string>,
	basePath: string,
): Record<string, string> {
	const modifiedRedirects: Record<string, string> = {};
	for (const [key, value] of Object.entries(redirects)) {
		if (basePath && !value.startsWith(basePath) && !value.startsWith("/" + basePath)) {
			modifiedRedirects[key] = path.join(basePath, value);
		} else {
			modifiedRedirects[key] = value;
		}
	}
	return modifiedRedirects;
}

// https://astro.build/config
export default defineConfig({
	site: getSite(),
  base: process.env.BASE || BASE_PATH,
  redirects: key_value_from_json["redirects"]
    ? modifyRedirectPaths(key_value_from_json["redirects"], process.env.BASE || BASE_PATH)
	  : {},
	integrations: [
		// mdx({}),
		tailwind({
			applyBaseStyles: false,
		}),
		// astroImageTools,
		buildTimestampRecorder(),
		EntryCacheEr(),
		PublicNotionCopier(),
		DeleteBuildCache(),
		CSSWriter(),
		robotsTxt({
			sitemapBaseFileName: "sitemap",
		}),
		partytown({
			// Adds dataLayer.push as a forwarding-event.
			config: {
				forward: ["dataLayer.push"],
			},
		}),
	],
	image: {
		domains: ["webmention.io"],
	},
	prefetch: true,
	vite: {
		plugins: [],
		optimizeDeps: {
			exclude: ["@resvg/resvg-js"],
		},
	},
});
