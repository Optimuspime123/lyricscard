class DataFetcher {
    constructor(apiBase = "/api") {
        /** @type {string} */
        this.apiBase = apiBase;
    }

    /**
     * Searches for songs via the backend, which proxies Last.fm.
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
     * Searches for song lyrics via the backend, which proxies lrclib.
     *
     * @param {string} artistName
     * @param {string} trackName
     * @returns {Promise<object|null>} a lyrics object compatible with Song.loadLyrics
     */
    async getSongLyrics(artistName, trackName) {
        const url = `${this.apiBase}/lyrics?artist=${encodeURIComponent(artistName)}&track=${encodeURIComponent(trackName)}`;
        const response = await fetch(url);
        if (response.status === 404) return null;
        if (!response.ok) {
            throw new Error(`Lyrics fetch failed (${response.status})`);
        }
        return response.json();
    }
}
