# Brand assets

## Add your real logo (from Instagram / brand kit)

1. Save your logo here as **`logo.png`** (transparent background, ~256×256+) or `logo.svg`.
2. Open `src/components/brand/logo.tsx` and follow the one-line comment to switch
   from the built-in SVG mark to your image.

Until you add one, the site uses a clean built-in "house" mark in the brand
terracotta colour, so nothing looks broken.

## Add your project photos

Drop image files into **`public/gallery/`**, then reference them in
`src/lib/gallery.ts` (there's a guide at the top of that file). To replace the
current placeholder photos wholesale, just overwrite the files in `public/gallery/`
keeping the same file names — no code changes needed.
