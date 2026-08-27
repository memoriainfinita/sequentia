# Sequentia

[![Live demo](https://img.shields.io/badge/demo-GitHub%20Pages-blue)](https://memoriainfinita.github.io/sequentia/)
[![License](https://img.shields.io/badge/license-GPL--3.0-blue)](LICENSE)

Turn a folder of images into a video with transitions. One HTML file, no build step, no dependencies, no server.

**[Open it](https://memoriainfinita.github.io/sequentia/)** and drop your images on the page.

Sequentia covers the gap between full video editors and presentation tools that do not produce video. The workflow is meant to be fast: dozens of images in seconds.

It is not a video editor, not a slideshow tool, and not meant for complex presentations.

## Transitions

Fade, Slide (4 directions), Zoom Punch, Wipe (4 directions), Cross-Zoom (speed slider), Flash (colour picker), and Random, which draws from the pool of all of them.

## Export

Video is encoded in the browser with Mediabunny (CanvasSource) and WebCodecs for audio. Nothing is uploaded: your images are read locally and the file is written by the browser.

Export is verified in Firefox. Opened from `file://`, Chrome blocks module workers and export fails there.

## Stack

Vanilla HTML, CSS and JavaScript. No frameworks, no build tools. The whole application is `index.html`.

## License

GPL-3.0-or-later.
