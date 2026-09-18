<div align="center">
  <img src="assets/banner.svg" alt="File Studio" width="100%">
</div>



# File Studio

A static toolkit of file utilities — merge PDFs, convert images, run OCR, generate QR codes, and more — that run **entirely in the browser**. There is no backend, no file upload, and no tracking of any kind which mean this is a process happens 100% locally on your own device. It is completely private and secure.

Founded by **Isaac Lun**.

## Link to try out!
https://lululunisaac.github.io/File_Studio/


## Tools

**Organise**
1. Merge PDF
2. Split PDF (page ranges, fixed chunks, one file per page)
3. Rotate & reorder pages
4. Compress PDF
5. Add page numbers
6. PDF details (view and edit metadata)

**Protect & mark up**

7. Redact PDF (flattens the page — the text underneath is destroyed)
8. Sign PDF (draw, type or upload a signature)
9. Watermark PDF (text or logo, tiled or single)
10. Extract images from a PDF

**To PDF**

11. Image → PDF
12. Word → PDF
13. Excel → PDF
14. PowerPoint → PDF
15. HTML → PDF
16. Markdown → PDF

**From PDF**

17. PDF → Images
18. PDF → Text
19. PDF → Word
20. PDF → Excel
21. PDF → PowerPoint
22. PDF → HTML

**Everything else**

23. Photo → Text (OCR, 12 languages)
24. Image converter (format, resize, quality)
25. QR generator
26. Word counter

## Why it's safe to use

- **No server.** Static HTML, CSS and JavaScript only.
- **No uploads.** Files are read with the browser's File API and processed in the tab.
- **No accounts, cookies or analytics.**
- **Checkable.** Load the site, turn off your Wi-Fi, and every tool still works.

The only network requests are for the open-source libraries (from cdnjs) and web fonts (Google Fonts) — code coming *to* you, never your documents going out. Vendor the libraries locally if you want a fully offline build.

## Running locally

Just open `index.html` in a browser, or serve the folder with any static file server, e.g.:

```bash
npx serve .
```

## Project structure


```
index.html                 Home — hero, searchable tool grid
privacy.html               Privacy, as its own page
about.html                 About, as its own page
assets/style.css           Shared design system
assets/helpers.js          Tool registry, page chrome, shared file/PDF utilities
assets/bg3d.js             Home-page 3D object: icosphere built, rotated and projected in code
tools/*.html               One page per tool (26)
```


## A note on accuracy A Honest limits !

- **Redaction** works by flattening each page to an image with the boxes burned in. That genuinely removes the underlying text — and it also removes selectable text and links from the whole page.
- **PDF → Word / Excel / HTML** rebuild content, not typesetting. PDFs store text at coordinates, not paragraphs or cells, so complex layouts need tidying afterwards.
- **PowerPoint → PDF** re-lays out each slide's text and pictures in a clean template; it is not a pixel-perfect render. Use PowerPoint's own export when exactness matters.
- **OCR** is a best guess, especially on handwriting and low-contrast scans.
- **Password-protecting a PDF is not included.** Nothing in the browser-library ecosystem does real AES encryption reliably, and a fake "lock" that any viewer can ignore would be worse than none. Tools that can't open an encrypted PDF say so plainly.


## Credits

Designed and founded by **Isaac Lun**. Built with [pdf-lib](https://pdf-lib.js.org/), [pdf.js](https://mozilla.github.io/pdf.js/), [Tesseract.js](https://tesseract.projectnaptha.com/), [SheetJS](https://sheetjs.com/), [mammoth.js](https://github.com/mwilliamson/mammoth.js), [PptxGenJS](https://gitbrent.github.io/PptxGenJS/), [html2canvas](https://html2canvas.hertzen.com/), [marked](https://marked.js.org/), [JSZip](https://stuk.github.io/jszip/) and [qrcodejs](https://davidshimjs.github.io/qrcodejs/).
