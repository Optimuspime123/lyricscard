const LRCLIB_BASE = "https://lrclib.net/api/search";
const USER_AGENT = "LyricPost/2.0 (https://github.com/optimuspime123/lyricscard)";

module.exports = async (req, res) => {
    if (req.method !== "GET") {
        res.setHeader("Allow", "GET");
        return res.status(405).json({ error: "Method not allowed" });
    }

    const artist = typeof req.query.artist === "string" ? req.query.artist.trim() : "";
    const track = typeof req.query.track === "string" ? req.query.track.trim() : "";

    if (!track) {
        return res.status(400).json({ error: "Missing 'track' parameter" });
    }

    try {
        const url = new URL(LRCLIB_BASE);
        url.searchParams.set("q", `${artist} ${track}`.trim());

        const response = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
        if (!response.ok) {
            return res.status(502).json({ error: "Lyrics service failed" });
        }
        const results = await response.json();
        if (!Array.isArray(results) || results.length === 0) {
            return res.status(404).json({ error: "No lyrics found" });
        }

        const trackLower = track.toLowerCase();
        const exactMatches = results.filter(
            (r) => r?.trackName?.toLowerCase().trim() === trackLower
        );
        const chosen = exactMatches[0] ?? results[0];

        if (!chosen) {
            return res.status(404).json({ error: "No lyrics found" });
        }

        res.setHeader("Cache-Control", "public, s-maxage=600, stale-while-revalidate=3600");
        return res.status(200).json({
            trackName: chosen.trackName ?? null,
            artistName: chosen.artistName ?? null,
            syncedLyrics: chosen.syncedLyrics ?? null,
            plainLyrics: chosen.plainLyrics ?? null,
        });
    } catch (err) {
        console.error("lyrics error:", err);
        return res.status(502).json({ error: "Lyrics fetch failed" });
    }
};
