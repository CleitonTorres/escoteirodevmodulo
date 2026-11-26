export function lessonVideo(address: string) {
  let url: URL;
  try {
    url = new URL(address);
  } catch {
    return;
  }
  if (url.protocol !== "https:" || url.username || url.password) return;

  const [, section, pathId] = url.pathname.split("/");
  let id: string | null = null;
  switch (url.hostname) {
    case "youtu.be":
      id = section;
      break;
    case "youtube.com":
    case "www.youtube.com":
    case "m.youtube.com":
      if (section === "watch") id = url.searchParams.get("v");
      else if (section === "embed" || section === "shorts" || section === "live") id = pathId;
      break;
    case "www.youtube-nocookie.com":
      if (section === "embed") id = pathId;
      break;
  }
  const embed = id && /^[a-zA-Z0-9_-]{11}$/.test(id) ? `https://www.youtube.com/embed/${id}` : undefined;
  return { href: url.href, embed };
}

export function normalizeVideoUrls(value: string | readonly string[] | undefined) {
  return typeof value === "string" ? [value] : value && [...value];
}
