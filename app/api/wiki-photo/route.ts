/**
 * GET /api/wiki-photo?q=景福宮
 * 依地名搜尋 Wikipedia 主圖，依序嘗試 zh → en → ja → ko
 * 回傳 { url: string | null }，快取 7 天
 */
export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q") ?? "";
  if (!q.trim()) return Response.json({ url: null });

  const langs = ["zh", "en", "ja", "ko"];
  for (const lang of langs) {
    try {
      const params = new URLSearchParams({
        action: "query",
        titles: q,
        prop: "pageimages",
        piprop: "thumbnail",
        pithumbsize: "600",
        format: "json",
        origin: "*",
      });
      const res = await fetch(
        `https://${lang}.wikipedia.org/w/api.php?${params}`,
        { next: { revalidate: 604800 } },
      );
      if (!res.ok) continue;
      const data = await res.json();
      const pages = Object.values(data?.query?.pages ?? {}) as Record<string, unknown>[];
      const url = (pages[0] as { thumbnail?: { source?: string } })?.thumbnail?.source;
      if (url) return Response.json({ url });
    } catch {
      // try next lang
    }
  }
  return Response.json({ url: null });
}
