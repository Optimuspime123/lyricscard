const LASTFM_BASE = "https://ws.audioscrobbler.com/2.0/";
const PAXSENIX_BASE = "https://api.paxsenix.org/spotify/search";
const PAXSENIX_KEY = "sk-paxsenix-y5tK4iuxRPohlXVeF_yC5Uigf7Fr5zS06rzsmMIQ6JAHcH9n";
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

function pickLargestImage(images) {
    if (!Array.isArray(images) || images.length === 0) return null;
    return images[0]?.url || images[images.length - 1]?.url || null;
}

async function paxsenixCall(query, limit) {
    const url = new URL(PAXSENIX_BASE);
    url.searchParams.set("q", query);
    url.searchParams.set("limit", String(limit));

    const response = await fetch(url, {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${PAXSENIX_KEY}`,
        },
    });

    if (!response.ok) {
        throw new Error(`PaxSenix ${response.status}`);
    }

    const data = await response.json();
    if (!data?.ok || !data?.tracks?.items) {
        return [];
    }

    return data.tracks.items.slice(0, limit).map(track => ({
        spotifyTrackId: track.id || null,
        name: track.name,
        durationMs: track.duration_ms || 0,
        artists: (track.artists || []).map(a => ({ name: a.name })),
        albumCoverUrl: pickLargestImage(track.album?.images) || pickAlbumCover(track.album?.images),
    }));
}

async function lastfmSearch(query, limit, apiKey) {
    const searchData = await lastfmCall(
        { method: "track.search", track: query, limit: String(limit) },
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

    return songs.filter(Boolean);
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

    const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
    if (!q) {
        return res.status(400).json({ error: "Missing or empty 'q' parameter" });
    }

    const requestedLimit = Number.parseInt(req.query.limit, 10);
    const limit = Number.isFinite(requestedLimit)
        ? Math.max(1, Math.min(MAX_LIMIT, requestedLimit))
        : DEFAULT_LIMIT;

    try {
        let songs = [];

        try {
            songs = await paxsenixCall(q, limit);
        } catch (err) {
            console.warn("PaxSenix search fallback:", err.message);
        }

        if (!songs || songs.length === 0) {
            const apiKey = process.env.LASTFM_API_KEY;
            if (!apiKey) {
                return res.status(500).json({ error: "Server misconfigured: missing LASTFM_API_KEY" });
            }

            songs = await lastfmSearch(q, limit, apiKey);
        }

        res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=1800");
        return res.status(200).json({ songs });
    } catch (err) {
        console.error("search error:", err);
        return res.status(502).json({ error: "Search failed upstream" });
    }
};
