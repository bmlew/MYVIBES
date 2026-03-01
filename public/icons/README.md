# App Icons

This directory contains the source icon for the PWA and Mobile Apps.

## Current Icon
- `icon.svg`: A vector logo for VIBESPOT.

## Required Actions for Production

For the best experience on all devices (iOS, Android, Desktop), you should generate PNG versions of this icon in various sizes.

1.  Use a tool like [RealFaviconGenerator.net](https://realfavicongenerator.net/) or [Maskable.app](https://maskable.app/).
2.  Upload `icon.svg` (or your own high-res logo).
3.  Download the generated assets.
4.  Replace the files in this directory with the generated PNGs:
    - `icon-72x72.png`
    - `icon-96x96.png`
    - `icon-128x128.png`
    - `icon-144x144.png`
    - `icon-152x152.png`
    - `icon-192x192.png`
    - `icon-384x384.png`
    - `icon-512x512.png`

## Capacitor (Mobile Apps)

For iOS and Android builds, you will also need to place a 1024x1024 PNG icon and a 2732x2732 PNG splash screen in the `resources` folder (created when you run `cap install` locally) or use the `@capacitor/assets` tool.

See `../CAPACITOR_MOBILE_APP_GUIDE.md` for full instructions.