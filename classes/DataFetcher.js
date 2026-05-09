class DataFetcher {
    constructor(apiBase = "/api") {
        /** @type {string} */
        this.apiBase = apiBase;
    }

    /**
     * Searches for songs via the backend, which proxies PaxSenix and Last.fm.
     *
     * @param {string} name
     * @param {number} limit
     * @returns {Promise<Song[]>} an array of Song objects
     */
    async getSongInfos(name, limit = 6) {
        const url = `${this.apiBase}/search?q=${encodeURIComponent(name)}&limit=${encodeURIComponent(limit)}`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Search failed (${response.status})`);
        }
        const { songs = [] } = await response.json();
        return songs.map((song) => new Song(song));
    }

    /**
     * Searches for song lyrics via the backend, which proxies PaxSenix, StefDP, and lrclib.
     *
     * @param {string} artistName
     * @param {string} trackName
     * @param {string|null} spotifyTrackId
     * @returns {Promise<object|null>} a lyrics object compatible with Song.loadLyrics
     */
    async getSongLyrics(artistName, trackName, spotifyTrackId = null) {
        const params = new URLSearchParams({ artist: artistName, track: trackName });
        if (spotifyTrackId) params.set("spotifyTrackId", spotifyTrackId);

        const url = `${this.apiBase}/lyrics?${params.toString()}`;
        const response = await fetch(url);
        if (response.status === 404) return null;
        if (!response.ok) {
            throw new Error(`Lyrics fetch failed (${response.status})`);
        }
        return response.json();
    }
}
