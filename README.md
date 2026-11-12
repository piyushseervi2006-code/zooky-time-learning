# Zooky — Time made fun!

A colourful, responsive time-learning website for children, built with plain HTML, CSS, and JavaScript. It includes a short lesson about the clock hands, an interactive practice clock, a multiple-choice quiz, and a product gallery with 30 photos grouped into 11 styles.

## Project files

```text
zooky-time-learning/
├── index.html
├── styles.css
├── script.js
├── README.md
└── assets/
    ├── zooky-promo.png
    └── products/          # 30 product photos used in the gallery
```

## Run it on your computer

1. Keep the files together in the same folder, including the `assets` folder.
2. Open `index.html` in a recent web browser.

There is no build step, server, account, or backend required. An internet connection is only needed to load the optional Google Fonts; the page uses built-in system fonts as a fallback.

## Publish with GitHub Pages

1. Create a GitHub repository for the site. A dedicated repository such as `zooky-time-learning` keeps it separate from other class projects.
2. Upload the **contents** of this folder to the repository's top level. Make sure `index.html` is at the top level beside `styles.css` and `script.js`, and upload the complete `assets` folder.
3. In the repository, open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Choose the `main` branch and the `/(root)` folder, then save.
6. Wait for GitHub Pages to finish publishing. Open the site address shown on the Pages settings screen. A project site usually follows this format: `https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/`.

When you update the project, upload the changed files to the same locations. GitHub Pages republishes the static site automatically.

## Accessibility and compatibility

- Navigation, links, buttons, and the practice sliders work with a keyboard.
- Both analog clocks have text labels for screen readers; feedback is announced as activities are played.
- Product filters and photo thumbnails are keyboard accessible.
- The layout adapts to phone, tablet, and desktop widths and respects reduced-motion preferences.
- The sound button uses the browser's built-in speech synthesis when available.
- The uploaded Zooky promotional image is stored locally at `assets/zooky-promo.png`, so GitHub Pages can serve it with the rest of the site.
