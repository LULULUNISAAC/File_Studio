# File Studio

A static toolkit of file utilities — merge PDFs, convert images, run OCR, generate QR codes, and more — that run **entirely in the browser**. There is no backend, no file upload, and no tracking of any kind which mean this is a process happens 100% locally on your own device. It is completely private and secure.

Founded by **Isaac Lun**.

## Tools included

1. Merge PDF
2. Image → PDF
3. PDF → Images
4. Photo → Text (OCR, via Tesseract.js)
5. PDF → Text
6. Image Converter (JPG / PNG / WebP)
7. QR Generator
8. Word Counter

## Why it's safe to use

- **No server.** This is a static site — HTML, CSS and JavaScript built only.
- **No uploads.** Every file you drop into a tool is read and processed locally in your own browser tab using the File API and libraries like `pdf-lib`, `pdf.js`, and `Tesseract.js` (all loaded from public CDNs, never sent your data).
- **No accounts, no cookies, no analytics.** Nothing is stored between visits unless a specific tool says otherwise.
- **Open source.** Every line of code that touches your files is readable in this repository.

## Running locally

Just open `index.html` in a browser, or serve the folder with any static file server, e.g.:

```bash
npx serve .
```

## Project structure

```
index.html              Homepage
assets/style.css         Shared design system
assets/helpers.js        Shared JS utilities (no network calls)
tools/merge-pdf.html
tools/image-to-pdf.html
tools/pdf-to-images.html
tools/photo-to-text.html
tools/pdf-to-text.html
tools/image-converter.html
tools/qr-generator.html
tools/word-counter.html
```

## A note on accuracy

The OCR tool (Photo → Text) uses on-device text recognition, which is not perfect — always review extracted text before relying on it, especially for handwriting, low-contrast scans, or skewed photos.

## Credits

Designed and founded by **Isaac Lun**. Built with [pdf-lib](https://pdf-lib.js.org/), [pdf.js](https://mozilla.github.io/pdf.js/), [Tesseract.js](https://tesseract.projectnaptha.com/), [JSZip](https://stuk.github.io/jszip/), and [qrcodejs](https://davidshimjs.github.io/qrcodejs/).
