# Lucky Table: click-through prototype

A clickable website prototype of **Lucky Table**, a shared-meal challenge where a table of friends fills one red envelope together. It works on laptop and phone, needs no build step and no backend, and runs on GitHub Pages.

> Concept prototype for a class demo. Coca-Cola, WeChat and Fantuan are named for illustration only. Nothing here is a real account, payment or order, and the project isn't affiliated with those brands.

## The flow

| Phase | Screens |
|---|---|
| 1. Connect | Creator post, challenge landing, WeChat sign-in (consent box required), create your table |
| 2. Community | Table and credits, share to Moments, receipt scan, friends check in |
| 3. Celebrate | 3D lucky envelope, copy code, Fantuan checkout, table streak, send an envelope to a friend (table vote) |

- **Laptop:** a "Prototype guide" sidebar lists every step. Click any step to jump there; earlier steps are filled in for you.
- **Phone:** the guide opens from the top bar.
- Yellow tips on each screen say what to tap next.
- "Prototype helper: simulate friends checking in" stands in for real friends; everything else is clickable.
- Progress is kept in `sessionStorage`. **Reset prototype** starts over.

## Run it locally

Just open `index.html`, or serve the folder:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```
## Project structure

```
index.html
assets/
  css/styles.css          layout, components, responsive rules
  js/app.js               screens, state, routing, guide
  js/envelope3d.js        three.js lucky envelope
  vendor/three.min.js     three.js r128 (bundled, so it works offline)
.nojekyll                 tells GitHub Pages to serve files as-is
```

## Customising

- Brand colours are CSS variables at the top of `assets/css/styles.css`.
- The reward code (`LUCKY888`), goal (6 credits) and friend names are constants at the top of `assets/js/app.js`. The code printed on the 3D card is drawn in `envelope3d.js`.
- Each screen is one function in `app.js` (`scPost`, `scTable`, and so on) returning plain HTML.

## Notes

- The Fantuan discount is shown as "15% off" the order, matching the $4.33 on a $28.88 subtotal.
- If a device can't run WebGL, the envelope falls back to a plain reward card.
- Honors `prefers-reduced-motion`, has keyboard access and focus styles throughout.
