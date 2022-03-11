---
id: scaling
title: Output scaling
---

_Available from v2.6.7._

Output scaling is useful if you would like to render the video in multiple resolutions in the same aspect ratio.

**Example**: Your video canvas is in Full HD (`1920x1080`), but would like to render your video to be in 4k (`3860x2160` or `2x`).

Remotion can support this higher resolution by setting the [`deviceScaleFactor`](https://puppeteer.github.io/puppeteer/docs/puppeteer.viewport.devicescalefactor) of Puppeteer and upscale certain elements.

## How to scale

- In the CLI, during a render of a video or a still, pass the [`--scale`](/docs/cli#--scale) flag. For example: `--scale=2`

<!-- TODO: Update for lambda --->

- In the Node.JS functions [`renderStill()`](/docs/render-still#scale) and [`renderFrames()`](/docs/render-frames#scale), you can pass a `scale` option.

- In the [config file](/docs/config), you can pass the scale using the following statement:

  ```ts twoslash
  import { Config } from "remotion";
  // ---cut---
  Config.Rendering.setScale(2);
  ```

## Allowed values

The highest scale possible is `16` (sixteen times higher dimensions on each size or 256 times more pixels).

Values between and 1 are allowed. For example, `0.5` will half each dimension.

The scale must result in a value that will result in even pixels. A value of `1.00000001` for a composition with a width of `1920` pixels is now allowed.

If you would like to downscale a composition from `1920` to `1280` pixels, pass a scale of `2/3` to avoid rounding errors. This does not currently work as a CLI flag.

## Scalable elements

Elements that can be upscaled and that will enhance increased resolution are:

- Text elements
- SVG elements
- Images (if their resolution is sufficient to display in a higher resolution)

Elements that **cannot** be upscaled for increased resolution are:

- Videos
- Canvas and WebGL elements
