# Sevilla Walking Guide

Mobile-first installable PWA for the Alameda–Feria–San Luis–Macarena walking route in Seville.

## Runtime design

The deployed app is self-contained at runtime:

- local vector map data;
- precomputed pedestrian route;
- seven local Dutch MP3 audio guides;
- local Leaflet bundle;
- browser Geolocation for the live GPS dot;
- service worker precaching all required assets.

No GPS coordinates are sent to a server. No online map or audio service is required during the walk once **Offline gereed** is shown.

## Development

```bash
npm install
npm run build
```

The initial bootstrap build downloads the already-generated ElevenLabs MP3 files and OSM data once, then creates `dist/`. After the first successful Vercel build, generated assets are committed back to the repository so subsequent builds can be deterministic.

## Android use

1. Open the Vercel HTTPS URL in Chrome.
2. Press the GPS button and allow location access.
3. Wait for **Offline gereed**.
4. Optionally install/add the site to the home screen.
5. The cached guide can then be used without mobile data.

Map data: © OpenStreetMap contributors, ODbL.
