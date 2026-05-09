class Song {
    /**
     * @param {object} songInfo  Canonical shape: { spotifyTrackId, name, durationMs, artists: [{name}], albumCoverUrl }
     * @param {object} lyrics
     */
    constructor(songInfo, lyrics = null) {
        /** @type {string} */
        this.name = songInfo.name;

        /** @type {string|null} */
        this.spotifyTrackId = songInfo.spotifyTrackId ?? null;

        /** @type {number} */
        this.durationMs = Number(songInfo.durationMs) || 0;

        /** @type {Artist[]} */
        this.artists = (songInfo.artists ?? []).map((a) => new Artist(a));

        /** @type {string|null} */
        this.albumCoverUrl = songInfo.albumCoverUrl ?? null;

        /** @type {boolean} */
        this.hasSyncedLyrics = lyrics?.syncedLyrics ? true : false;

        /** @type {Lyric[]|undefined} */
        this.lyrics = (lyrics?.syncedLyrics ?? lyrics?.plainLyrics)
            ?.replace(/\n+/g, "\n")
            ?.split("\n")
            ?.map((lyric) => new Lyric(lyric));
    }

    /**
     * Loads lyrics from a lyrics payload (matches /api/lyrics shape).
     * @param {object} lyrics
     */
    loadLyrics(lyrics) {
        this.hasSyncedLyrics = lyrics?.syncedLyrics ? true : false;
        this.lyrics = (lyrics?.syncedLyrics ?? lyrics?.plainLyrics)
            ?.replace(/\n+/g, "\n")
            ?.split("\n")
            ?.map((lyric) => new Lyric(lyric))
            ?.filter((lyric) => lyric.text !== "");
    }
}
