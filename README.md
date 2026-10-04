# Wearly

An installable personal wardrobe app for phones and computers. Version one uses explicit garment tags and deterministic outfit rules. No AI API is used.

## Features

- Device-local garment photos, metadata, preferences, availability, and separate everyday/home/night sections.
- Top/bottom combinations, one-piece outfits and layers based on occasion, date, time, location setting and weather.
- Up to 30 days of outfits with rewear controls, packing lists, and suggestions for missing outfits.
- Optional Open-Meteo hourly forecasts; uncovered dates always use clearly labeled manual conditions.
- Dated body measurement history, saved outfits, profiles, JSON backup export/restore.
- Manifest, app icons, installation support and an offline information page.

## Privacy, identity and persistence

Production access uses Sites sign-in with ChatGPT through server-only auth helpers. Access remains owner-private unless deliberately changed. Local development uses the starter mock account, excluded from production builds.

Product records and garment photos are held in IndexedDB, namespaced by authenticated user ID. Saves wait for transaction completion; browser write locks serialize updates across tabs where supported. Photos and measurements are never uploaded. Forecast lookup sends only the requested city through the authenticated same-origin endpoint to Open-Meteo.

Profiles on one account organize records; they are not separate security identities. Browser data is not encrypted by the application. Clearing site data removes records. Export/restore moves records between devices; there is no cloud sync. Internet is needed to sign in and reopen the app. The service worker caches only public assets and an offline information page, never authenticated HTML or API responses.

Backups include photos and measurements. Import validates format and appends profiles without overwriting existing ones. Photo compression strips original metadata. Measurements are a personal record; garment fit is not inferred from label sizes.

## Run

Use Node >=22.13, npm and the preserved lockfile. On Windows ARM, use x64 Node for Cloudflare Workerd.

    npm run install:ci
    npm run dev

## Check and build

    npx tsc --noEmit
    node tests/outfits.cjs
    npm run build

Publish using the Sites workflow and .openai/hosting.json. D1/R2 are intentionally unused because storage is device-local.

Tested: photo add/edit and reload persistence, occasion/weather/availability rules, wardrobe gaps, no-rewear trips, home/night separation, saved looks, measurement history, profile isolation, backup export/restore, deletion confirmation, 320/390/1360px layouts and install manifest. Browser checks are in ignored .sites-runtime. Optional WebMCP tools are feature-detected; runtime validation was unavailable because the test browser did not expose document.modelContext.

## Sources and assets

- Weather: https://open-meteo.com/en/docs
- City lookup: https://open-meteo.com/en/docs/geocoding-api
- public/wardrobe-editorial.webp: original AI-generated image, used only as labeled style inspiration. User wardrobes start empty.
- Favicon and app icons: original Wearly mark.
