const LASTFM_BASE = "https://ws.audioscrobbler.com/2.0/";
const USER_AGENT = "LyricPost/2.0 (https://github.com/optimuspime123/lyricscard)";
const MAX_LIMIT = 12;
const DEFAULT_LIMIT = 6;

function pickAlbumCover(images) {
    if (!Array.isArray(images)) return null;
    for (let i = images.length - 1; i >= 0; i--) {
        const url = images[i]?.["#text"];
        if (url) return url;
    }
    return null;
}

async function lastfmCall(params, apiKey) {
    const url = new URL(LASTFM_BASE);
    url.searchParams.set("api_key", apiKey);
    url.searchParams.set("format", "json");
    for (const [key, value] of Object.entries(params)) {
        url.searchParams.set(key, value);
    }
    const response = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
    if (!response.ok) throw new Error(`Last.fm ${response.status}`);
    return response.json();
}

module.exports = async (req, res) => {
    if (req.method !== "GET") {
        res.setHeader("Allow", "GET");
        return res.status(405).json({ error: "Method not allowed" });
    }

    const apiKey = process.env.LASTFM_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: "Server misconfigured: missing LASTFM_API_KEY" });
    }

    const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
    if (!q) {
        return res.status(400).json({ error: "Missing or empty 'q' parameter" });
    }

    const requestedLimit = Number.parseInt(req.query.limit, 10);
    const limit = Number.isFinite(requestedLimit)
        ? Math.max(1, Math.min(MAX_LIMIT, requestedLimit))
        : DEFAULT_LIMIT;

    try {
        const searchData = await lastfmCall(
            { method: "track.search", track: q, limit: String(limit) },
            apiKey
        );
        const tracks = searchData?.results?.trackmatches?.track || [];

        const songs = await Promise.all(
            tracks.map(async (t) => {
                try {
                    const infoData = await lastfmCall(
                        { method: "track.getInfo", artist: t.artist, track: t.name },
                        apiKey
                    );
                    const track = infoData?.track;
                    if (!track) return null;
                    return {
                        name: track.name,
                        durationMs: track.duration ? Number(track.duration) : 0,
                        artists: track.artist?.name ? [{ name: track.artist.name }] : [],
                        albumCoverUrl: pickAlbumCover(track.album?.image),
                    };
                } catch {
                    return null;
                }
            })
        );

        res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=1800");
        return res.status(200).json({ songs: songs.filter(Boolean) });
    } catch (err) {
        console.error("search error:", err);
        return res.status(502).json({ error: "Search failed upstream" });
    }
};
