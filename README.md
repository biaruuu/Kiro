# Kiro

The download site for the Kiro Android app (AniBiar TV), built with Next.js. It looks like an app store page and always links the newest APK.

- `/` the store page (version, size, date and "What's new" are read from GitHub and refresh every 5 minutes)
- `/download` a permanent link that redirects to the newest `Kiro.apk`

```
npm install
npm run dev
```

Optional: set `GITHUB_TOKEN` to avoid GitHub's anonymous API rate limit.
Deploy on Vercel by importing this repository (framework: Next.js, no settings needed).
