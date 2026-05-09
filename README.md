# LyricPost

> A Spotify-style lyrics-card generator. Search a song, pick the lines that hit hardest, share the image.

Built with vanilla JavaScript on the front, a thin Node serverless backend on Vercel, [Last.fm](https://www.last.fm/) for song metadata, and [lrclib](https://lrclib.net/docs) for lyrics.

## Local development

You need **Node 18+** and the [Vercel CLI](https://vercel.com/docs/cli):

```bash
npm i -g vercel
cp .env.example .env.local
# edit .env.local — paste your LASTFM_API_KEY
vercel dev
```

`vercel dev` serves the static files at `http://localhost:3000` and runs the `api/*.js` handlers as serverless functions.

> Don't have a Last.fm key? Grab one in 60 seconds at <https://www.last.fm/api/account/create>.

## Deployment

```bash
vercel              # first time: link/create project
vercel --prod       # deploy
```

Then in the Vercel dashboard: **Project → Settings → Environment Variables → add `LASTFM_API_KEY`**.

## Features

- Find a song via [Last.fm](https://www.last.fm/)
- Album art via [CoverArtArchive](https://coverartarchive.org/) (proxied through Last.fm)
- Lyrics via [lrclib](https://lrclib.net/docs)
- Pick lines, generate a stylish lyrics card, download in high resolution
- Material 3 Expressive UI with subtle glassmorphism, light + dark themes

## Project layout

```
api/
  search.js          Last.fm proxy: search + per-track info
  lyrics.js          lrclib proxy
classes/
  data/              Artist, Lyric, Song models
  DataFetcher.js     Front-end client for /api/*
  DOMHandler.js      Wizard flow + DOM rendering
styles/              main.css (tokens + shell), wizard.css, song-image.css
index.html           Single-page app
index.js             Wires fetcher + handler
vercel.json          Function config + headers
```

## Disclaimer

Not affiliated with or endorsed by Spotify. The Spotify wordmark is used per Spotify's branding guidelines and fetched at runtime.

## License

MIT — see [LICENSE](LICENSE).
