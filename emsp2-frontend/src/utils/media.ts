export function getYoutubeVideoId(url: string): string | null {
  try {
    const parsedUrl = new URL(url);

    if (parsedUrl.hostname.includes("youtu.be")) {
      return parsedUrl.pathname.slice(1) || null;
    }

    if (parsedUrl.hostname.includes("youtube.com")) {
      if (parsedUrl.searchParams.get("v")) {
        return parsedUrl.searchParams.get("v");
      }
      const segments = parsedUrl.pathname.split("/").filter(Boolean);
      const embedIndex = segments.findIndex((segment) => segment === "embed");
      if (embedIndex !== -1 && segments[embedIndex + 1]) {
        return segments[embedIndex + 1];
      }
    }
  } catch {
    return null;
  }

  return null;
}

export function getYoutubeEmbedUrl(url: string): string {
  const videoId = getYoutubeVideoId(url);
  if (!videoId) {
    return url;
  }
  return `https://www.youtube.com/embed/${videoId}`;
}

export function getYoutubeThumbnailUrl(url: string): string | null {
  const videoId = getYoutubeVideoId(url);
  if (!videoId) {
    return null;
  }
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

export function getFileExtension(fileName?: string, url?: string): string {
  const source = fileName || url || "";
  const cleaned = source.split("?")[0];
  const extension = cleaned.split(".").pop();
  return extension ? extension.toUpperCase() : "FICHIER";
}
