export const SITE_NAME = "StudyWhat";
export const SITE_URL = "https://studywhat.hewliyang.com";
export const DEFAULT_DESCRIPTION =
	"Singapore Graduate Employment Survey (GES) data. Analyse employment trends and decide what to study.";
export const OG_IMAGE_PATH = "/og.png";

export function normalizePath(pathname: string) {
	if (!pathname || pathname === "/") return "/";
	return pathname.replace(/\/+$/, "") || "/";
}

export function absoluteUrl(pathname: string) {
	return new URL(pathname, SITE_URL).toString();
}
