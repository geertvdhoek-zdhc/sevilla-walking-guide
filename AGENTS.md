# AGENTS.md

Non-negotiable constraints for this project:

- Runtime must work after first successful load with mobile data disabled.
- No remote map tiles or map APIs at runtime.
- Audio must be real local MP3 files, not browser TTS and not remote playback URLs.
- GPS coordinates stay on-device and are never sent to a backend.
- The map, route, stops, audio, CSS, JS, manifest and vendor assets must be same-origin static assets.
- Production is deployed on Vercel over HTTPS so Android Chrome can grant Geolocation permission.
- Do not claim success unless an offline reload works after the service worker has cached all required assets.
