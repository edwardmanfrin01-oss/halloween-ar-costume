# Halloween AR Costume

A low-budget Halloween costume with its own website — and a little afterlife.

The original idea was simple: scan a QR code on the costume, open the browser camera, and point it at a printed tracking marker to summon a floating ghost. Built for Halloween 2026, this is a small, playful experiment with marker-based augmented reality and plain web technologies.

Now that Halloween is over, the same QR destination offers something for late visitors:

> **The ghost has ghosted.**  
> But it left you a cookie. Go on, take a bite.

## The post-Halloween treat

[`halloween-ar.html`](halloween-ar.html) is the current visitor page. A floating SVG cookie can be eaten in three bites, complete with crumbs, a mildly offended expression, and a refill button.

- Works without camera permissions or external JavaScript libraries.
- Supports touch and keyboard interaction, with screen-reader status messages.
- Respects the browser's reduced-motion preference.
- Keeps the Instagram link to the ghost's human.

The cookie is drawn inline in SVG: no separate icon or image download is needed. JavaScript powers the bites; without it, the cookie and a short explanatory message remain visible.

## Explore the project

| File | Purpose |
| --- | --- |
| [`halloween-ar.html`](halloween-ar.html) | Current QR landing page: the cookie experience |
| [`halloween-ar_original.html`](halloween-ar_original.html) |  The original halloween costume's webpage |
| [`index.html`](index.html) | Original low-budget Halloween / BOO! page, still served at the site root |
| [`ar.html`](ar.html) | AR camera experience with Hiro, custom Ghost, and Matrix marker choices |
| [`ar-test.html`](ar-test.html) | Entry point for comparing tracking markers |
| [`marker.html`](marker.html) | Display or print the selected tracking marker |
| [`ar.js`](ar.js) | Shared camera, marker tracking, and ghost rendering logic |
| [`AR-TEST.md`](AR-TEST.md) | Detailed AR setup, testing notes, and troubleshooting |
| `assets/` | Ghost artwork, tracking markers, QR codes, and other media |
| `tools/` | Optional Python scripts for generating QR codes, markers, and print sheets |


## Run locally

There is no build step or npm dependency installation. From the repository root, with Python 3 installed:

```sh
python -m http.server 8000
```

Open [the cookie page](http://localhost:8000/halloween-ar.html), [the original home page](http://localhost:8000/), or [the AR page](http://localhost:8000/ar.html).

The cookie page can also be opened directly as a local HTML file.

## Try the original AR experience (now available at [`halloween-ar.html](https://edwardmanfrin01-oss.github.io/halloween-ar-costume`](halloween-ar.html)

1. Open `marker.html?marker=matrix` on another screen, or print that marker with its full black border and white margin.
2. Open `ar.html?marker=matrix` on your phone using the HTTPS-hosted site.
3. Tap **Start camera**, grant camera access, and point the live view at the marker.
4. Move the marker to move the ghost. Use **Show test cube** to inspect tracking without the ghost artwork.

The **QR code opens the website**; the **tracking marker anchors the ghost**. They serve different purposes. Scanning a tracking marker with the phone's normal Camera app does not launch AR.

AR uses A-Frame 1.6.0 and AR.js 3.4.7, loaded from external hosts when the camera starts. It requires an Internet connection and browser camera access. Use HTTPS for phone testing; a plain HTTP address on your local network is not sufficient. Desktop localhost can be used for development.

Tracking depends on lighting, marker visibility, distance, and print quality. The ghost is a flat transparent image in 3D space, so it appears thin when viewed edge-on. See [the AR testing guide](AR-TEST.md) for marker comparisons and troubleshooting.

## Publish and preserve the QR destination

The site consists of static files and can be hosted on GitHub Pages. Publish the HTML pages, `ar.js`, and `assets/` together, preserving their relative paths. Python tools are not needed by the hosted site.

The existing `qrcode-ar.png` and `qrcode-ar.svg`, and their generator, target:

```text
https://edwardmanfrin01-oss.github.io/halloween-ar-costume/halloween-ar.html
```

The cookie experience lives specifically at `halloween-ar.html`.

After deployment, scan the shared QR on a phone, eat all three bites, try **One more?**, and check the Instagram link. If retaining the AR demo, also test camera permissions and tracking on a real phone.

## Optional asset tools

Run these commands from the repository root only when regenerating assets. They overwrite their generated outputs.

| Script | Dependencies | Output |
| --- | --- | --- |
| `python tools/build_ar_qr.py` | `qrcode`, `Pillow`, `zxing-cpp` | QR PNG and SVG in `assets/qrcodes/`; verifies the PNG's decoded URL |
| `python tools/build_ghost_marker.py` | `Pillow` | Custom Ghost marker image and `.patt` file in `assets/markers/` |
| `python tools/build_print_pack.py` | `Pillow`, `reportlab` | `output/pdf/halloween-a4-print-pack.pdf` |

Install only the dependencies needed for the tool you want to run, preferably in a virtual environment. None are required to view the website.

## Credits

The AR experiment uses [A-Frame](https://aframe.io/) and [AR.js](https://github.com/AR-js-org/AR.js). The Matrix Hamming 5 marker comes from the [ARToolKit barcode marker collection](https://github.com/nicolocarpignoli/artoolkit-barcode-markers-collection).

---

Zero calories. Slightly haunted.
