const YT_ID_RE = /^[A-Za-z0-9_-]{11}$/;
const YT_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
  "youtu.be",
]);

// ✅ যেকোনো YouTube লিংক (watch?v=, youtu.be/, /embed/, /shorts/, /live/) বা
// সরাসরি ১১-অক্ষরের ভিডিও আইডি থেকে আইডি বের করে; না পারলে null।
// সার্ভারেই আইডি বের করে সেভ করা হয়, যাতে ক্লায়েন্টে raw URL iframe-এ না বসে।
export function extractYouTubeId(input) {
  const raw = String(input || "").trim();
  if (!raw) return null;
  if (YT_ID_RE.test(raw)) return raw;

  let url;
  try {
    url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
  } catch {
    return null;
  }

  const host = url.hostname.toLowerCase();
  if (!YT_HOSTS.has(host)) return null;

  let id = null;
  if (host === "youtu.be") {
    id = url.pathname.split("/")[1];
  } else if (url.pathname === "/watch") {
    id = url.searchParams.get("v");
  } else {
    const [, kind, value] = url.pathname.split("/");
    if (["embed", "shorts", "live", "v"].includes(kind)) id = value;
  }

  return id && YT_ID_RE.test(id) ? id : null;
}
