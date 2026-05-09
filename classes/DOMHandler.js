const SONGS_TO_FETCH = 6;
const DOWNLOAD_SCALING_FACTOR = 4;
const SELECTION_ANIMATION_DELAY = 300;
const NEXT_LINE_ANIMATION_DELAY = 30;
const SEARCHING_FOR_SONG = "Searching Spotify...";
const DOWNLOADING = "Downloading lyrics image...";
const SHARING = "Preparing lyrics image to share...";
const NO_LYRICS_FOUND =
    "No lyrics found<br>You can still type your own lyrics by clicking here :)";
const NO_LYRICS_SELECTED =
    "No lyrics selected<br>You can still type your own lyrics by clicking here :)";
const SPOTIFY_LOGO =
    "https://upload.wikimedia.org/wikipedia/commons/2/26/Spotify_logo_with_text.svg";

const COLORS = [
    "#1e88e5",
    "#00897b",
    "#7cb342",
    "#fb8c00",
    "#e53935",
    "#d81b60",
    "#5e35b1",
];

const SITE_THEME_PALETTES = {
    light: [
        {
            "--md-primary": "hsl(162 76% 31%)",
            "--md-primary-container": "hsl(158 56% 84%)",
            "--md-on-primary-container": "hsl(164 82% 10%)",
            "--md-secondary": "hsl(43 78% 38%)",
            "--md-secondary-container": "hsl(43 86% 84%)",
            "--md-on-secondary-container": "hsl(41 86% 12%)",
            "--md-tertiary": "hsl(331 66% 50%)",
            "--md-tertiary-container": "hsl(332 86% 91%)",
            "--md-on-tertiary-container": "hsl(331 78% 14%)",
            "--md-surface": "hsl(216 24% 97%)",
            "--md-surface-dim": "hsl(216 16% 86%)",
            "--md-surface-container-low": "hsl(214 24% 95%)",
            "--md-surface-container": "hsl(216 22% 92%)",
            "--md-surface-container-high": "hsl(216 18% 89%)",
            "--md-surface-container-highest": "hsl(216 16% 85%)",
            "--md-on-surface": "hsl(219 28% 10%)",
            "--md-on-surface-variant": "hsl(218 16% 31%)",
            "--md-outline": "hsl(217 11% 47%)",
            "--md-outline-variant": "hsl(216 16% 78%)",
            "--md-shadow": "hsl(218 42% 8%)",
        },
        {
            "--md-primary": "hsl(147 62% 28%)",
            "--md-primary-container": "hsl(146 46% 83%)",
            "--md-on-primary-container": "hsl(148 78% 9%)",
            "--md-secondary": "hsl(38 82% 43%)",
            "--md-secondary-container": "hsl(39 92% 85%)",
            "--md-on-secondary-container": "hsl(38 88% 12%)",
            "--md-tertiary": "hsl(344 62% 52%)",
            "--md-tertiary-container": "hsl(344 86% 91%)",
            "--md-on-tertiary-container": "hsl(344 74% 14%)",
            "--md-surface": "hsl(45 28% 96%)",
            "--md-surface-dim": "hsl(42 16% 84%)",
            "--md-surface-container-low": "hsl(43 24% 94%)",
            "--md-surface-container": "hsl(42 22% 91%)",
            "--md-surface-container-high": "hsl(40 18% 88%)",
            "--md-surface-container-highest": "hsl(40 16% 84%)",
            "--md-on-surface": "hsl(44 24% 10%)",
            "--md-on-surface-variant": "hsl(43 14% 31%)",
            "--md-outline": "hsl(42 10% 47%)",
            "--md-outline-variant": "hsl(42 15% 77%)",
            "--md-shadow": "hsl(42 38% 8%)",
        },
        {
            "--md-primary": "hsl(211 62% 34%)",
            "--md-primary-container": "hsl(210 68% 86%)",
            "--md-on-primary-container": "hsl(211 76% 12%)",
            "--md-secondary": "hsl(45 68% 39%)",
            "--md-secondary-container": "hsl(45 82% 84%)",
            "--md-on-secondary-container": "hsl(45 82% 12%)",
            "--md-tertiary": "hsl(323 58% 49%)",
            "--md-tertiary-container": "hsl(324 80% 91%)",
            "--md-on-tertiary-container": "hsl(324 72% 14%)",
            "--md-surface": "hsl(204 22% 97%)",
            "--md-surface-dim": "hsl(206 15% 86%)",
            "--md-surface-container-low": "hsl(204 24% 95%)",
            "--md-surface-container": "hsl(205 22% 92%)",
            "--md-surface-container-high": "hsl(206 18% 89%)",
            "--md-surface-container-highest": "hsl(206 16% 85%)",
            "--md-on-surface": "hsl(211 28% 10%)",
            "--md-on-surface-variant": "hsl(210 15% 31%)",
            "--md-outline": "hsl(210 10% 47%)",
            "--md-outline-variant": "hsl(207 15% 78%)",
            "--md-shadow": "hsl(211 42% 8%)",
        },
        {
            "--md-primary": "hsl(179 58% 27%)",
            "--md-primary-container": "hsl(178 54% 84%)",
            "--md-on-primary-container": "hsl(180 80% 9%)",
            "--md-secondary": "hsl(34 90% 45%)",
            "--md-secondary-container": "hsl(35 94% 86%)",
            "--md-on-secondary-container": "hsl(33 88% 12%)",
            "--md-tertiary": "hsl(352 64% 54%)",
            "--md-tertiary-container": "hsl(352 88% 92%)",
            "--md-on-tertiary-container": "hsl(352 76% 15%)",
            "--md-surface": "hsl(220 12% 96%)",
            "--md-surface-dim": "hsl(220 9% 84%)",
            "--md-surface-container-low": "hsl(220 13% 94%)",
            "--md-surface-container": "hsl(220 12% 91%)",
            "--md-surface-container-high": "hsl(220 10% 88%)",
            "--md-surface-container-highest": "hsl(220 9% 84%)",
            "--md-on-surface": "hsl(220 20% 10%)",
            "--md-on-surface-variant": "hsl(220 11% 31%)",
            "--md-outline": "hsl(220 8% 47%)",
            "--md-outline-variant": "hsl(220 10% 77%)",
            "--md-shadow": "hsl(220 34% 8%)",
        },
    ],
    dark: [
        {
            "--md-primary": "hsl(164 72% 64%)",
            "--md-primary-container": "hsl(164 76% 20%)",
            "--md-on-primary-container": "hsl(158 76% 88%)",
            "--md-secondary": "hsl(42 90% 68%)",
            "--md-secondary-container": "hsl(40 76% 24%)",
            "--md-on-secondary-container": "hsl(43 90% 88%)",
            "--md-tertiary": "hsl(332 88% 78%)",
            "--md-tertiary-container": "hsl(331 70% 30%)",
            "--md-on-tertiary-container": "hsl(332 92% 92%)",
            "--md-surface": "hsl(220 30% 6%)",
            "--md-surface-dim": "hsl(220 30% 6%)",
            "--md-surface-container-lowest": "hsl(220 34% 3%)",
            "--md-surface-container-low": "hsl(220 26% 9%)",
            "--md-surface-container": "hsl(220 22% 12%)",
            "--md-surface-container-high": "hsl(219 18% 16%)",
            "--md-surface-container-highest": "hsl(218 15% 21%)",
            "--md-on-surface": "hsl(216 20% 91%)",
            "--md-on-surface-variant": "hsl(216 13% 76%)",
            "--md-outline": "hsl(216 10% 62%)",
            "--md-outline-variant": "hsl(218 12% 32%)",
        },
        {
            "--md-primary": "hsl(146 66% 61%)",
            "--md-primary-container": "hsl(146 66% 19%)",
            "--md-on-primary-container": "hsl(146 74% 86%)",
            "--md-secondary": "hsl(47 82% 64%)",
            "--md-secondary-container": "hsl(46 70% 23%)",
            "--md-on-secondary-container": "hsl(47 88% 87%)",
            "--md-tertiary": "hsl(345 84% 76%)",
            "--md-tertiary-container": "hsl(345 66% 29%)",
            "--md-on-tertiary-container": "hsl(345 90% 91%)",
            "--md-surface": "hsl(150 18% 6%)",
            "--md-surface-dim": "hsl(150 18% 6%)",
            "--md-surface-container-lowest": "hsl(150 22% 3%)",
            "--md-surface-container-low": "hsl(150 16% 9%)",
            "--md-surface-container": "hsl(150 14% 12%)",
            "--md-surface-container-high": "hsl(150 12% 16%)",
            "--md-surface-container-highest": "hsl(150 10% 21%)",
            "--md-on-surface": "hsl(150 12% 91%)",
            "--md-on-surface-variant": "hsl(150 9% 76%)",
            "--md-outline": "hsl(150 7% 62%)",
            "--md-outline-variant": "hsl(150 9% 32%)",
        },
        {
            "--md-primary": "hsl(211 82% 70%)",
            "--md-primary-container": "hsl(211 72% 24%)",
            "--md-on-primary-container": "hsl(211 86% 89%)",
            "--md-secondary": "hsl(39 92% 66%)",
            "--md-secondary-container": "hsl(38 76% 24%)",
            "--md-on-secondary-container": "hsl(39 90% 88%)",
            "--md-tertiary": "hsl(323 84% 77%)",
            "--md-tertiary-container": "hsl(323 66% 29%)",
            "--md-on-tertiary-container": "hsl(323 90% 92%)",
            "--md-surface": "hsl(215 36% 6%)",
            "--md-surface-dim": "hsl(215 36% 6%)",
            "--md-surface-container-lowest": "hsl(215 42% 3%)",
            "--md-surface-container-low": "hsl(215 30% 9%)",
            "--md-surface-container": "hsl(215 26% 12%)",
            "--md-surface-container-high": "hsl(214 20% 16%)",
            "--md-surface-container-highest": "hsl(214 16% 21%)",
            "--md-on-surface": "hsl(213 20% 91%)",
            "--md-on-surface-variant": "hsl(213 12% 76%)",
            "--md-outline": "hsl(213 10% 62%)",
            "--md-outline-variant": "hsl(214 13% 32%)",
        },
        {
            "--md-primary": "hsl(178 66% 60%)",
            "--md-primary-container": "hsl(179 70% 19%)",
            "--md-on-primary-container": "hsl(178 76% 86%)",
            "--md-secondary": "hsl(34 96% 65%)",
            "--md-secondary-container": "hsl(33 78% 24%)",
            "--md-on-secondary-container": "hsl(34 92% 88%)",
            "--md-tertiary": "hsl(352 88% 78%)",
            "--md-tertiary-container": "hsl(352 68% 30%)",
            "--md-on-tertiary-container": "hsl(352 92% 92%)",
            "--md-surface": "hsl(220 10% 5%)",
            "--md-surface-dim": "hsl(220 10% 5%)",
            "--md-surface-container-lowest": "hsl(220 12% 2%)",
            "--md-surface-container-low": "hsl(220 9% 8%)",
            "--md-surface-container": "hsl(220 8% 11%)",
            "--md-surface-container-high": "hsl(220 7% 15%)",
            "--md-surface-container-highest": "hsl(220 6% 20%)",
            "--md-on-surface": "hsl(220 12% 91%)",
            "--md-on-surface-variant": "hsl(220 8% 76%)",
            "--md-outline": "hsl(220 7% 62%)",
            "--md-outline-variant": "hsl(220 7% 31%)",
        },
    ],
};

class DOMHandler {
    /**
     * @param {DataFetcher} fetcher
     */
    constructor(fetcher) {
        /** @type {DataFetcher} */
        this.fetcher = fetcher;

        /** @type {Song[]} */
        this.songs = [];

        /** @type {number?} */
        this.selectedSongIndex = null;

        /** @type {number} */
        this.lyricsRequestId = 0;

        /** @type {AbortController[]} */
        this.lyricsAbortControllers = [];

        /**
         * Below all are DOM elements
         */
        /** @type {NodeListOf<Element>} */
        this.errorTexts = document.querySelectorAll(".error");
        /** @type {NodeListOf<Element>} */
        this.searchingTexts = document.querySelectorAll(".searching");
        /** @type {NodeListOf<Element>} */
        this.screens = document.querySelectorAll(".lyrics-image-screen");

        /** @type {Element} */
        this.searchInput = document.querySelector("#song-name");
        /** @type {Element} */
        this.searchButton = document.querySelector("#search");

        /** @type {Element} */
        this.cloneableSelectSong = document.querySelector(
            ".select-song.cloneable"
        );
        /** @type {Element} */
        this.songSelection = document.querySelector(".song-selection");
        /** @type {Element} */
        this.lineSelection = document.querySelector(".lines-selection");
        /** @type {Element} */
        this.songInfoCover = document.querySelector(".song-info-cover");
        /** @type {Element} */
        this.songInfoName = document.querySelector(".song-info-name");
        /** @type {Element} */
        this.songInfoArtist = document.querySelector(".song-info-artist");
        /** @type {Element} */
        this.goToFinal = document.querySelector(
            ".lyrics-image-screen .go-to-screen.right"
        );
        /** @type {Element} */
        this.lyricsFab = document.querySelector("#lyrics-fab");

        /** @type {Element} */
        this.lastGoBack = document.querySelector("#last-go-back");
        /** @type {Element} */
        this.downloadButton = document.querySelector("#download");
        /** @type {Element} */
        this.shareButton = document.querySelector("#share");
        /** @type {Element} */
        this.colorSelection = document.querySelector(".color-selection");
        /** @type {Element} */
        this.customColorInput = document.querySelector("#custom-color input");
        /** @type {Element} */
        this.lightTextSwitch = document.querySelector("#light-text");
        /** @type {Element} */
        this.spotifyTagSwitch = document.querySelector("#spotify-tag");
        /** @type {Element} */
        this.finalOptions = document.querySelector(".final-options");
        /** @type {Element} */
        this.fontLangSelect = document.querySelector("#font-lang");
        /** @type {Element} */
        this.songImage = document.querySelector(".song-image");

        /** @type {Element} */
        this.widthSlider = document.querySelector("#width-slider");
        /** @type {Element} */
        this.widthValue = document.querySelector("#width-value");

        /** @type {Element} */
        this.toggleDarkMode = document.querySelector("#dark-mode-toggle");

        this.populateColorSelection();
        this.setupShareButton();
        this.setListeners();
        this.setBase64Image(SPOTIFY_LOGO, ".song-image > .spotify > img", 0);
        this.setTheme(
            localStorage.getItem("theme") ??
            (window.matchMedia("(prefers-color-scheme: dark)").matches
                ? "dark"
                : "light")
        );
    }

    /**
     * Sets static elements' listeners
     */
    setListeners() {
        this.searchButton.addEventListener("click", (e) => {
            e.preventDefault();
            this.findSong();
        });

        this.searchInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                this.findSong();
            }
        });

        this.lastGoBack.addEventListener("click", () => {
            this.displayScreen(
                this.songs[this.selectedSongIndex].lyrics === undefined ? 2 : 3
            );
        });

        document.querySelectorAll(".go-to-screen").forEach((button) => {
            button.addEventListener("click", () => {
                this.displayScreen(Number(button.dataset.number));
            });
        });

        this.goToFinal.addEventListener("click", () => {
            this.displaySongImage();
        });

        this.lyricsFab.addEventListener("click", () => {
            this.displaySongImage();
        });

        this.customColorInput.addEventListener("input", () => {
            this.setSongImageColor(this.customColorInput.value);
        });

        this.lightTextSwitch.addEventListener("click", () => {
            this.finalOptions.classList.toggle("light-text");

            this.setBase64Image(
                SPOTIFY_LOGO,
                ".song-image > .spotify > img",
                this.finalOptions.classList.contains("light-text") ? 255 : 0
            );
        });

        this.spotifyTagSwitch.addEventListener("click", () => {
            this.finalOptions.classList.toggle("spotify-tag");
        });

        this.downloadButton.addEventListener("click", () => {
            this.downloadSongImage();
        });

        this.shareButton.addEventListener("click", () => {
            this.shareSongImage();
        });

        // Paste into contenteditable as plain text
        document.querySelectorAll("[contenteditable]").forEach((field) => {
            field.addEventListener("paste", function (event) {
                event.preventDefault();
                document.execCommand(
                    "inserttext",
                    false,
                    event.clipboardData.getData("text/plain")
                );
            });
        });

        this.widthSlider.addEventListener("input", () => {
            const width = this.widthSlider.value;
            this.setSongImageWidth(width);
            this.widthValue.textContent = `${width}px`;
        });

        window.addEventListener("resize", () => {
            this.setSongImageWidth(this.widthSlider.value);
        });

        this.fontLangSelect.addEventListener("change", (e) => {
            document.documentElement.lang = e.target.value;
        });

        this.toggleDarkMode.addEventListener("click", () => {
            this.setTheme(
                document.body.classList.contains("dark-mode") ? "light" : "dark"
            );
        });
    }

    /**
     * Hides native sharing controls when image file sharing is unavailable.
     */
    setupShareButton() {
        if (!this.canShareImageFiles()) {
            this.shareButton.hidden = true;
        }
    }

    /**
     * Checks whether the browser can open native share UI with PNG files.
     * @returns {boolean}
     */
    canShareImageFiles() {
        if (!navigator.share || !navigator.canShare || typeof File === "undefined") {
            return false;
        }

        try {
            const testFile = new File(["x"], "lyrics-card.png", { type: "image/png" });
            return navigator.canShare({ files: [testFile] });
        } catch (error) {
            return false;
        }
    }

    /**
     * Creates color selection DOM elements
     */
    populateColorSelection() {
        const customColor = this.colorSelection.querySelector("#custom-color");
        COLORS.forEach((color) => {
            const element = document.createElement("div");
            element.classList.add("select-color");
            element.style.backgroundColor = color;
            element.setAttribute("role", "radio");
            element.setAttribute("aria-label", `Background ${color}`);
            element.tabIndex = 0;

            element.addEventListener("click", () => {
                this.setSongImageColor(color);
            });
            element.addEventListener("keydown", (e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    this.setSongImageColor(color);
                }
            });

            this.colorSelection.insertBefore(element, customColor);
        });
    }

    /**
     * Searches for a song and prepares song selection list
     * @param {string} name
     */
    async findSong() {
        const name = this.searchInput.value
            .replaceAll("\\", "")
            .replaceAll("/", "")
            .trim();

        if (name === "") {
            return this.throwError(
                `Hold on! Haven't you forgotten about something?`
            );
        }

        this.searchInput.setAttribute("disabled", "true");
        this.searchButton.setAttribute("disabled", "true");

        this.hideError();
        this.displaySearching(SEARCHING_FOR_SONG);

        try {
            this.songs = await this.fetcher.getSongInfos(name, SONGS_TO_FETCH);

            if (!this.songs || this.songs.length === 0) {
                throw new Error("No results");
            }

            this.populateSongSelection();
            this.displayScreen(2);
        } catch (error) {
            console.error(error);

            this.throwError(
                `Oops! Looks like we couldn't find any songs for \"${name}\".`
            );
        }

        this.hideSearching();
        this.searchInput.removeAttribute("disabled");
        this.searchButton.removeAttribute("disabled");
    }

    /**
     * Creates song selection DOM elements from Song objects stored in songs variable
     */
    populateSongSelection() {
        this.songSelection
            .querySelectorAll(".select-song:not(.cloneable)")
            .forEach((el) => el.remove());

        this.songSelection.classList.add("hidden");

        this.songs.forEach((song, index) => {
            const clone = this.cloneableSelectSong.cloneNode(true);

            clone.querySelector("img").setAttribute("src", song.albumCoverUrl);
            clone.querySelector(".name").textContent = song.name;
            clone.querySelector(".authors").textContent = song.artists
                .map((artist) => artist.name)
                .join(", ");

            clone.addEventListener("click", () => {
                this.selectedSongIndex = index;
                this.findLyrics();
            });

            clone.classList.remove("cloneable");

            this.songSelection.append(clone);
        });

        setTimeout(() => {
            this.songSelection.classList.remove("hidden");
        }, SELECTION_ANIMATION_DELAY);
    }

    /**
     * Searches for song lyrics and prepares lines selection list
     */
    async findLyrics() {
        const requestId = ++this.lyricsRequestId;
        this.lyricsAbortControllers.forEach((controller) => controller.abort());
        this.lineSelection.innerHTML = "";

        this.displayScreen(3);
        this.displaySongInfo();

        /** @type {Song} */
        const song = this.songs[this.selectedSongIndex];

        const artists = [...new Set(song.artists.map((artist) => artist.name))];
        const controllers = artists.map(() => new AbortController());
        this.lyricsAbortControllers = controllers;

        try {
            this.displaySearching(this.getLyricsSearchingText(song, artists));

            const lyrics = await Promise.any(
                artists.map((artist, index) =>
                    this.fetcher
                        .getSongLyrics(
                            artist,
                            song.name,
                            index === 0 ? song.spotifyTrackId : null,
                            controllers[index].signal
                        )
                        .then((lyrics) => {
                            if (!lyrics) throw Error("Lyrics not found");
                            return lyrics;
                        })
                )
            );

            if (requestId !== this.lyricsRequestId) return;

            this.hideSearching();
            song.loadLyrics(lyrics);
            this.populateLineSelection();
        } catch (error) {
            if (requestId !== this.lyricsRequestId) return;

            this.hideSearching();

            if (
                document
                    .querySelector(".final-options")
                    .classList.contains("hidden")
            ) {
                this.displaySongImage();
            }

            return console.error(error);
        } finally {
            controllers.forEach((controller) => controller.abort());
            if (requestId === this.lyricsRequestId) {
                this.lyricsAbortControllers = [];
            }
        }
    }

    /**
     * Builds provider-aware lyrics loading copy.
     * @param {Song} song
     * @param {string[]} artists
     * @returns {string}
     */
    getLyricsSearchingText(song, artists) {
        const providers = song.spotifyTrackId
            ? "Spotify lyrics, StefDP, and lrclib"
            : "StefDP and lrclib";
        return `Checking ${providers} for "${song.name}" by ${artists.join(
            " / "
        )}; using the fastest match...`;
    }

    /**
     * Displays song information (cover, name, artist) on the lyrics screen
     */
    displaySongInfo() {
        const song = this.songs[this.selectedSongIndex];

        this.songInfoCover.setAttribute("src", song.albumCoverUrl);
        this.songInfoName.textContent = song.name;
        this.songInfoArtist.textContent = song.artists
            .map((artist) => artist.name)
            .join(", ");
    }

    /**
     * Creates line selection DOM elements from Lyric objects stored in the selected song's object
     */
    populateLineSelection() {
        let animationDelay = SELECTION_ANIMATION_DELAY;

        this.songs[this.selectedSongIndex].lyrics.forEach((line, index) => {
            const element = document.createElement("div");
            element.classList.add("select-line", "hidden");
            element.textContent = line.text;
            element.dataset.index = index;

            element.addEventListener("click", () => {
                element.classList.toggle("selected");
                this.updateFabVisibility();
            });

            setTimeout(() => {
                element.classList.remove("hidden");
            }, animationDelay);

            animationDelay += NEXT_LINE_ANIMATION_DELAY;

            this.lineSelection.append(element);
        });
    }

    /**
     * Updates FAB visibility based on selected lines
     */
    updateFabVisibility() {
        const selectedLines = document.querySelectorAll(".select-line.selected");
        if (selectedLines.length > 0) {
            this.lyricsFab.classList.remove("hidden");
        } else {
            this.lyricsFab.classList.add("hidden");
        }
    }

    /**
     * Displays song image final screen
     */
    displaySongImage() {
        this.setSongImage();
        this.displayScreen(4);
        this.setSongImageWidth(this.widthSlider.value);
        this.widthValue.textContent = `${this.widthSlider.value}px`;
        this.lyricsFab.classList.add("hidden");
    }

    /**
     * Prepares song image DOM element
     */
    setSongImage() {
        this.setBase64Image(
            this.songs[this.selectedSongIndex].albumCoverUrl,
            ".song-image > .header > img"
        );
        this.setSongInfo();
        this.setSongLyrics(
            Array.from(document.querySelectorAll(".select-line.selected")).map(
                (selectLine) => Number(selectLine.dataset.index)
            )
        );
        this.setSongImageColor(
            COLORS[Math.floor(Math.random() * COLORS.length)]
        );
    }

    /**
     * Set's song image's colors
     * @param {string} background
     * @param {string} text
     */
    setSongImageColor(background) {
        this.songImage.style.backgroundColor = background;
        this.finalOptions.style.setProperty("--song-image-background", background);
    }

    /**
     * Sets song image's width
     * @param {number} width - Width in pixels
     */
    setSongImageWidth(width) {
        const numericWidth = Number(width);
        this.songImage.style.setProperty("--song-image-width", `${numericWidth}px`);

        const fullHeight = this.songImage.offsetHeight;
        const screen = this.songImage.closest(".lyrics-image-screen");

        if (!screen) {
            this.songImage.style.setProperty("--song-image-scale", 1);
            this.songImage.style.marginBottom = "0px";
            return;
        }

        const screenWidth = screen.clientWidth;
        const horizontalMargin = 32;
        const maxVisualWidth = Math.max(screenWidth - horizontalMargin, 0);

        const scale =
            numericWidth > 0 && maxVisualWidth > 0
                ? Math.min(1, maxVisualWidth / numericWidth)
                : 1;

        this.songImage.style.setProperty("--song-image-scale", scale);

        const marginBottom = fullHeight * (scale - 1);
        this.songImage.style.marginBottom = `${marginBottom}px`;
    }

    /**
     * Sets song image's name and author to the name of the fetched song
     */
    setSongInfo() {
        document.querySelector(".song-image > .header .name").textContent =
            this.songs[this.selectedSongIndex].name;
        document.querySelector(".song-image > .header .authors").textContent =
            this.songs[this.selectedSongIndex].artists
                .map((artist) => artist.name)
                .join(", ");
    }

    /**
     * Sets song image's lyric section to the specified lyrics lines
     * @param {number[]} indexes
     */
    setSongLyrics(indexes) {
        const container = document.querySelector(".song-image > .lyrics");
        const selectedLyrics = this.songs[this.selectedSongIndex].lyrics
            ?.filter((_, index) => indexes.includes(index))
            ?.map((lyric) => lyric.text);

        if (selectedLyrics === undefined) {
            return this.setSongLyricsText(
                container,
                NO_LYRICS_FOUND.split("<br>")
            );
        }

        if (selectedLyrics.length === 0) {
            return this.setSongLyricsText(
                container,
                NO_LYRICS_SELECTED.split("<br>")
            );
        }

        this.setSongLyricsText(container, selectedLyrics);
    }

    /**
     * Renders lyric text safely while preserving line breaks.
     * @param {Element} container
     * @param {string[]} lines
     */
    setSongLyricsText(container, lines) {
        container.replaceChildren();
        lines.forEach((line, index) => {
            if (index > 0) container.append(document.createElement("br"));
            container.append(document.createTextNode(line));
        });
    }

    /**
     * Downloads song image by generating canvas from its DOM elements
     */
    async downloadSongImage() {
        this.displaySearching(DOWNLOADING);

        try {
            const blob = await this.getSongImageBlob();
            window.saveAs(blob, this.getSongImageFileName());
        } catch (error) {
            console.error(error);
        } finally {
            this.hideSearching();
        }
    }

    /**
     * Shares song image through the browser's native share UI.
     */
    async shareSongImage() {
        if (!this.canShareImageFiles()) return;

        this.displaySearching(SHARING);

        try {
            const blob = await this.getSongImageBlob();
            const file = new File([blob], this.getSongImageFileName(), {
                type: "image/png",
            });

            if (!navigator.canShare({ files: [file] })) return;

            await navigator.share({
                files: [file],
                title: "Lyrics card",
            });
        } catch (error) {
            if (error?.name !== "AbortError") {
                console.error(error);
            }
        } finally {
            this.hideSearching();
        }
    }

    /**
     * Gets the generated song image file name.
     * @returns {string}
     */
    getSongImageFileName() {
        const song = this.songs[this.selectedSongIndex];
        return `${song.artists
            .map((artist) => artist.name)
            .join(", ")} - ${song.name}.png`;
    }

    /**
     * Generates a canvas from the current song image DOM element.
     * @returns {Promise<HTMLCanvasElement>}
     */
    async getSongImageCanvas() {
        let canvas = await html2canvas(this.songImage, {
            backgroundColor: null,
            scale: window.devicePixelRatio * DOWNLOAD_SCALING_FACTOR,
        });

        return canvas;
    }

    /**
     * Generates a PNG blob from the current song image DOM element.
     * @returns {Promise<Blob>}
     */
    async getSongImageBlob() {
        const canvas = await this.getSongImageCanvas();

        return new Promise((resolve, reject) => {
            canvas.toBlob((blob) => {
                if (blob) {
                    resolve(blob);
                } else {
                    reject(new Error("Failed to create lyrics image."));
                }
            }, "image/png");
        });
    }

    /**
     * Converts cover image to base64 and sets it as image's source in order to avoid canvas CORS policy
     * @param {string} url
     * @param {string} imgSelector
     */
    async setBase64Image(url, imgSelector, newColor = null) {
        const response = await fetch(url);
        const blob = await response.blob();

        const base64 = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });

        if (newColor === null)
            return document
                .querySelector(imgSelector)
                .setAttribute("src", base64);

        const img = new Image();
        img.src = base64;

        img.onload = () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            const imageData = ctx.getImageData(
                0,
                0,
                canvas.width,
                canvas.height
            );
            const data = imageData.data;

            for (let i = 0; i < data.length; i += 4) {
                if (data[i + 3] > 0) {
                    data[i] = data[i + 1] = data[i + 2] = newColor; // Set RGB (0 = black, 255 = white)
                }
            }

            ctx.putImageData(imageData, 0, 0);
            document
                .querySelector(imgSelector)
                .setAttribute("src", canvas.toDataURL());
        };
    }

    /**
     * Displays an error message with provided html
     * @param {string} html
     */
    throwError(html) {
        this.errorTexts.forEach((element) => {
            element.innerHTML = html;
            element.classList.remove("hidden");
        });
    }

    /**
     * Hides the error message
     */
    hideError() {
        this.errorTexts.forEach((element) => {
            element.classList.add("hidden");
        });
    }

    /**
     * Displays a searching text
     * @param {string} text
     */
    displaySearching(text) {
        this.searchingTexts.forEach((element) => {
            element.textContent = text;
            element.classList.remove("hidden");
        });
    }

    /**
     * Hides the searching text
     */
    hideSearching() {
        this.searchingTexts.forEach((element) => {
            element.classList.add("hidden");
        });
    }

    /**
     * Displays a searching text
     * @param {number} number
     */
    displayScreen(number) {
        this.screens.forEach((screen) => {
            if (Number(screen.dataset.number) < number) {
                screen.classList.add("hidden");
                screen.classList.add("left");
            } else if (Number(screen.dataset.number) === number) {
                screen.classList.remove("hidden");
                screen.classList.remove("left");
            } else {
                screen.classList.add("hidden");
                screen.classList.remove("left");
            }
        });

        // Update FAB visibility when returning to lyrics selection screen
        if (number === 3) {
            this.updateFabVisibility();
        } else {
            this.lyricsFab.classList.add("hidden");
        }
    }

    /**
     * Sets color theme
     * @param {string} theme
     */
    setTheme(theme) {
        if (theme === "dark") {
            document.body.classList.add("dark-mode");
            localStorage.setItem("theme", "dark");
        } else {
            document.body.classList.remove("dark-mode");
            localStorage.setItem("theme", "light");
        }

        this.applyRandomThemePalette(theme);
    }

    /**
     * Applies one curated site palette variant for the active light/dark theme.
     * @param {string} theme
     */
    applyRandomThemePalette(theme) {
        const palettes = SITE_THEME_PALETTES[theme] ?? SITE_THEME_PALETTES.light;
        const palette = palettes[Math.floor(Math.random() * palettes.length)];

        Object.entries(palette).forEach(([property, value]) => {
            document.body.style.setProperty(property, value);
        });
    }
}
