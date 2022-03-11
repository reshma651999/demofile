---
id: render-frames
title: renderFrames()
---

_Part of the `@remotion/renderer` package._

Renders a series of images using Puppeteer and computes information for mixing audio.

If you want to render only a still image, use [renderStill()](/docs/render-still).

```ts
const renderFrames: (options: {
  config: VideoConfig;
  compositionId: string;
  onFrameUpdate: (frame: number) => void;
  onStart: (data: {
    frameCount: number;
  }) => void;
  outputDir: string;
  inputProps: unknown;
  webpackBundle: string;
  imageFormat: "png" | "jpeg" | "none";
  envVariables?: Record<string, string>;
  parallelism?: number | null;
  quality?: number;
  frameRange?: number | [number, number] | null;
  dumpBrowserLogs?: boolean;
  puppeteerInstance?: puppeteer.Browser;
  onError?: (info: {error: Error; frame: number | null}) => void;
  scale?: number;
}): Promise<RenderFramesOutput>;
```

:::info
Configuration in `remotion.config.ts` and CLI flags do not apply to this function. You must pass all options explicitly.
:::

## Arguments

Takes an object with the following keys:

### `config`

A video config, consisting out of `width`, `height`, `durationInFrames` and `fps`. See: [Defining compositions](/docs/the-fundamentals#defining-compositions) and [useVideoConfig()](/docs/use-video-config).

### `compositionId`

A `string` specifying the ID of the composition. See: [Defining compositions](/docs/the-fundamentals#defining-compositions).

### `onStart`

A callback that fires after the setup process (validation, browser launch) has finished. Example value

```ts twoslash
const onStart = () => {
  console.log("Starting rendering...");
};
```

### `onFrameUpdate`

A callback function that gets called whenever a frame finished rendering. An argument is passed containing how many frames have been rendered (not the frame number of the rendered frame). Example value

```ts twoslash
const onFrameUpdate = (frame: number) => {
  console.log(`${frame} frames rendered.`);
};
```

### `outputDir`

A `string` specifying the directory (absolute path) to which frames should be saved.

### `inputProps`

[Custom props which will be passed to the component.](/docs/parametrized-rendering) Useful for rendering videos with dynamic content. Can be an object of any shape.

### `webpackBundle`

A `string` specifying the location of the bundled Remotion project.

### `imageFormat`

A `string` which must be either `png`, `jpeg` or `none`.

- Choose `jpeg` by default because it is the fastest.
- Choose `png` if you want your image sequence to have an alpha channel (for transparency).
- Choose `none` if you only want to render audio.

### `parallelism?`

_optional_

A `number` specifying how many frames should be rendered in parallel or `null` to let Remotion decide based on the CPU of the host machine. Default is half of the CPU threads available.

### `scale?`

_number - default: 1 - available from v2.6.7_

[Scales the output frames by the factor you pass in.](/docs/scaling) For example, a 1280x720px frame will become a 1920x1080px frame with a scale factor of `1.5`. Vector elements like fonts and HTML markups will be rendered with extra details.

### `quality?`

_optional_

Sets the quality of the generated JPEG images. Must be an integer between 0 and 100. Default is to leave it up to the browser, [current default is 80](https://github.com/chromium/chromium/blob/99314be8152e688bafbbf9a615536bdbb289ea87/headless/lib/browser/protocol/headless_handler.cc#L32).

Only applies if `imageFormat` is `'jpeg'`, otherwise this option is invalid.

### `frameRange?`

_optional_

Specify a single frame (passing a `number`) or a range of frames (passsing a tuple `[number, number]`) to be rendered. By passing `null` (default) all frames of a composition get rendered.

### `dumpBrowserLogs?`

_optional_

Passes the `dumpio` flag to Puppeteer which will log all browser logs to the console. Useful for debugging. `boolean` flag, default is `false`.

### `puppeteerInstance?`

_optional_

An already open Puppeteer [`Browser`](https://pptr.dev/#?product=Puppeteer&version=main&show=api-class-browser) instance. Reusing a browser across multiple function calls can speed up the rendering process. You are responsible for opening and closing the browser yourself. If you don't specify this option, a new browser will be opened and closed at the end.

### `envVariables?`

_optional - Available since v2.2.0_

An object containing key-value pairs of environment variables which will be injected into your Remotion projected and which can be accessed by reading the global `process.env` object.

### `onError?`

_optional - Available since v2.1.0_

Allows you to react to an exception thrown in your React code. The callback has an argument which is an object containing `error` and `frame` properties.
The `frame` property tells you at which frame the error was thrown. If the error was thrown at startup, `frame` is null.

```tsx twoslash
import { renderFrames as rf } from "@remotion/renderer";
const renderFrames = (options: {
  onError: (info: { frame: null | number; error: Error }) => void;
}) => {};
// ---cut---
renderFrames({
  onError: (info) => {
    if (info.frame === null) {
      console.error("Got error while initalizing video rendering", info.error);
    } else {
      console.error("Got error at frame ", info.frame, info.error);
    }
    // Handle error here
  },
});
```

### `browserExecutable?`

_optional, available from v2.3.1_

A string defining the absolute path on disk of the browser executable that should be used. By default Remotion will try to detect it automatically and download one if none is available. If `puppeteerInstance` is defined, it will take precedence over `browserExecutable`.

### `timeoutInMilliseconds?`

_optional, available from v2.6.3_

A number describing how long one frame may take to resolve all `delayRender()` calls before the render times out and fails. Default: `30000`

### `chromiumOptions?`

_optional, available from v2.6.5_

Allows you to set certain Chromium / Google Chrome flags. See: [Chromium flags](/docs/chromium-flags).

#### `disableWebSecurity`

_boolean - default `false`_

This will most notably disable CORS among other security features.

#### `ignoreCertificateErrors`

_boolean - default `false`_

Results in invalid SSL certificates, such as self-signed ones being ignored.

#### `headless`

_boolean - default `true`_

If disabled, the render will open an actual Chrome window where you can see the render happen.

#### `gl`

_string_

<!-- TODO: Update for lambda -->

Select the OpenGL renderer backend for Chromium. Accepted values: `angle`, `egl`, `swiftshader`. Default: `angle`.

## Return value

A promise resolving to an object containing the following properties:

- `frameCount`: `number` - describing how many frames got rendered.
- `assetsInfo`: `RenderAssetInfo` - information that can be passed to `stitchFramesToVideo()` to mix audio. The shape of this object should be considered as Remotion internals and may change across Remotion versions.

## See also

- [bundle()](/docs/bundle)
- [Server-Side rendering](/docs/ssr)
- [getCompositions()](/docs/get-compositions)
- [stitchFramesToVideo()](/docs/stitch-frames-to-video)
- [renderStill()](/docs/render-still)
