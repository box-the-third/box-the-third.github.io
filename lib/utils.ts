// Small shared helpers.

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

/** Accepts a full YouTube URL or a bare 11-char id; returns the id. */
export function youTubeId(input: string): string {
  if (!input) return "";
  if (input.length === 11 && !input.includes("/") && !input.includes("."))
    return input;
  try {
    const url = new URL(input);
    if (url.hostname.includes("youtu.be")) return url.pathname.slice(1);
    if (url.searchParams.get("v")) return url.searchParams.get("v")!;
    const parts = url.pathname.split("/");
    const i = parts.findIndex((p) => p === "embed" || p === "shorts");
    if (i !== -1 && parts[i + 1]) return parts[i + 1];
  } catch {
    /* not a URL, fall through */
  }
  return input;
}

export function youTubeThumb(input: string): string {
  const id = youTubeId(input);
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

export function youTubeEmbed(input: string): string {
  const id = youTubeId(input);
  return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`;
}
