const LRCLIB_BASE = "https://lrclib.net/api/search";
const PAXSENIX_LYRICS_BASE = "https://api.paxsenix.org/lyrics/spotify";
const STEFDP_LYRICS_BASE = "https://lyrics.stefdp.com/lyrics";
const PAXSENIX_KEY = "sk-paxsenix-y5tK4iuxRPohlXVeF_yC5Uigf7Fr5zS06rzsmMIQ6JAHcH9n";
const USER_AGENT = "LyricPost/2.0 (https://github.com/optimuspime123/lyricscard)";

function formatSyncedLine(time, text) {
    const totalSeconds = Number(time);
    if (!Number.isFinite(totalSeconds) || !text) return null;

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    const centiseconds = Math.floor((totalSeconds % 1) * 100);
    return `[${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(centiseconds).padStart(2, "0")}]${text}`;
}

function normalizeLyrics(payload) {
    if (!payload?.syncedLyrics && !payload?.plainLyrics) return null;
    return payload;
}

async function firstValidLyrics(providerPromises) {
    if (providerPromises.length === 0) return null;

    try {
        return await Promise.any(
            providerPromises.map((promise) =>
                promise.then((lyrics) => {
                    const normalized = normalizeLyrics(lyrics);
                    if (!normalized) throw new Error("No lyrics found");
                    return normalized;
                })
            )
        );
    } catch {
        return null;
    }
}

async function paxsenixLyricsCall(spotifyTrackId) {
    const url = new URL(PAXSENIX_LYRICS_BASE);
    url.searchParams.set("id", spotifyTrackId);

    const response = await fetch(url, {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${PAXSENIX_KEY}`,
        },
    });

    if (!response.ok) {
        throw new Error(`PaxSenix lyrics ${response.status}`);
    }

    const data = await response.json();
    if (!data?.ok || (!data.lyrics && !data.plain)) {
        return null;
    }

    return {
        provider: "paxsenix",
        trackName: null,
        artistName: null,
        syncedLyrics: data.lyrics ?? null,
        plainLyrics: data.plain ?? null,
    };
}

async function stefdpLyricsCall(artist, track) {
    const url = new URL(STEFDP_LYRICS_BASE);
    url.searchParams.set("artist", artist);
    url.searchParams.set("track", track);

    const response = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
    if (!response.ok) {
        throw new Error(`StefDP lyrics ${response.status}`);
    }

    const data = await response.json();
    const lineSynced = data?.lyrics?.lineSynced?.lyrics;
    const syncedLyrics = Array.isArray(lineSynced)
        ? lineSynced.map((line) => formatSyncedLine(line.time, line.text)).filter(Boolean).join("\n")
        : null;

    return {
        provider: "stefdp",
        trackName: track,
        artistName: artist,
        syncedLyrics: syncedLyrics || null,
        plainLyrics: data?.lyrics?.plain?.lyrics ?? null,
    };
}

async function lrclibLyricsCall(artist, track) {
    const url = new URL(LRCLIB_BASE);
    url.searchParams.set("q", `${artist} ${track}`.trim());

    const response = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
    if (!response.ok) {
        throw new Error(`lrclib lyrics ${response.status}`);
    }

    const results = await response.json();
    if (!Array.isArray(results) || results.length === 0) {
        return null;
    }

    const trackLower = track.toLowerCase();
    const exactMatches = results.filter(
        (r) => r?.trackName?.toLowerCase().trim() === trackLower
    );
    const chosen = exactMatches[0] ?? results[0];

    if (!chosen) {
        return null;
    }

    return {
        provider: "lrclib",
        trackName: chosen.trackName ?? null,
        artistName: chosen.artistName ?? null,
        syncedLyrics: chosen.syncedLyrics ?? null,
        plainLyrics: chosen.plainLyrics ?? null,
    };
}

module.exports = async (req, res) => {
    if (req.method !== "GET") {
        res.setHeader("Allow", "GET");
        return res.status(405).json({ error: "Method not allowed" });
    }

    const artist = typeof req.query.artist === "string" ? req.query.artist.trim() : "";
    const track = typeof req.query.track === "string" ? req.query.track.trim() : "";
    const spotifyTrackId =
        typeof req.query.spotifyTrackId === "string"
            ? req.query.spotifyTrackId.trim()
            : typeof req.query.id === "string"
                ? req.query.id.trim()
                : "";

    if (!track && !spotifyTrackId) {
        return res.status(400).json({ error: "Missing 'track' parameter" });
    }

    try {
        const providerPromises = [];

        if (spotifyTrackId) {
            providerPromises.push(paxsenixLyricsCall(spotifyTrackId));
        }

        if (track) {
            providerPromises.push(stefdpLyricsCall(artist, track));
            providerPromises.push(lrclibLyricsCall(artist, track));
        }

        const lyrics = await firstValidLyrics(providerPromises);
        if (!lyrics) {
            return res.status(404).json({ error: "No lyrics found" });
        }

        res.setHeader("Cache-Control", "public, s-maxage=600, stale-while-revalidate=3600");
        return res.status(200).json(lyrics);
    } catch (err) {
        console.error("lyrics error:", err);
        return res.status(502).json({ error: "Lyrics fetch failed" });
    }
};
