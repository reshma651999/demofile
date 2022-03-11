---
id: render-still
title: renderStill()
---

_Part of the `@remotion/renderer` package. Available from v2.3._

Renders a single frame to an image and writes it to the specified output location.

If you want to render a full image sequence and possibly encode it to a video later, use [renderFrames()](/docs/render-frames) instead.

## Example usage

You first need to bundle the project and fetch the compositions. Read [the code snippet on the site for server-side rendering](/docs/ssr/#render-a-video-programmatically) for an example how to come up with the `bundleLocation` and `composition` variables.

```ts twoslash
// @module: ESNext
// @target: ESNext
import { bundle } from "@remotion/bundler";
import { getCompositions, renderStill } from "@remotion/renderer";

// The composition you want to render
const compositionId = "HelloWorld";

const bundleLocation = await bundle(require.resolve("./src/index"));

const comps = await getCompositions(bundleLocation, {
  inputProps: {
    custom: "data",
  },
});
const composition = comps.find((c) => c.id === compositionId);

if (!composition) {
  throw new Error(`No composition with the ID ${compositionId} found`);
}

// ---cut---

await renderStill({
  composition,
  webpackBundle: bundleLocation,
  output: "/tmp/still.png",
  onError: (error) => {
    console.error(
      "The following error occured when rendering the still: ",
      error.message
    );
  },
  inputProps: {
    custom: "data",
  },
});
```

## Arguments

Takes an object with the following properties:

### `composition`

A video composition object, consisting of `id`, `height`, `width`, `durationInFrames` and `fps`. Use [`getCompositions()`](/docs/get-compositions) to get a list of available video configs.

### `webpackBundle`

The absolute location of your webpack bundle. Use [`bundle()`](/docs/bundle) to bundle your project programmatically.

### `output`

An absolute path to where the frame should be rendered to.

### `inputProps?`

_optional_

[Custom props which will be passed to the component.](/docs/parametrized-rendering) Useful for rendering videos with dynamic content. Can be an object of any shape.

### `frame?`

_optional - default: 0_

Which frame should be rendered based on its number.

### `imageFormat?`

_optional - default: "png"_

Which output format the image should have, either `png` or `jpeg`.

### `scale?`

_number - default: 1 - available from v2.6.7_

[Scales the output frames by the factor you pass in.](/docs/scaling) For example, a 1280x720px frame will become a 1920x1080px frame with a scale factor of `1.5`. Vector elements like fonts and HTML markups will be rendered with extra details.

### `quality?`

_optional - default: `undefined`_

Sets the JPEG quality - must be an integer between 0 and 100 and can only be passed if `imageFormat` is set to `jpeg`.

### `puppeteerInstance?`

_optional - default `null`_

An already open Puppeteer [`Browser`](https://pptr.dev/#?product=Puppeteer&version=main&show=api-class-browser) instance. Reusing a browser across multiple function calls can speed up the rendering process. You are responsible for opening and closing the browser yourself. If you don't specify this option, a new browser will be opened and closed at the end.

### `envVariables?`

_optional - default `{}`_

An object containing key-value pairs of environment variables which will be injected into your Remotion project and which can be accessed by reading the global `process.env` object.

### `dumpBrowserLogs?`

_optional - default `false`_

A boolean value deciding whether Puppeteer logs should be printed to the console, useful for debugging only.

### `onError?`

_optional_

Allows you to react to an exception thrown in your React code. The callback has an argument which is the error.

```tsx twoslash
const renderStill = (options: { onError: (err: Error) => void }) => {};
// ---cut---
renderStill({
  // ... other arguments
  onError: (err: Error) => {
    // Handle error here
  },
});
```

### `overwrite?`

_optional - default `true`_

Whether the file should be overwritten if the output already exists.

### `browserExecutable?`

_optional, available from v2.3.1_

A string defining the absolute path on disk of the browser executable that should be used. By default Remotion will try to detect it automatically and download one if none is available. If `puppeteerInstance` is defined, it will take precedence over `browserExecutable`.

### `timeoutInMilliseconds?`

_optional, available from v2.6.3_

A number describing how long the render may take to resolve all `delayRender()` calls before it times out. Default: `30000`

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

A promise with no value. If the render succeeded, the still has been saved to `output`. If the render failed, the promise rejects.

- [bundle()](/docs/bundle)
- [Server-Side rendering](/docs/ssr)
- [getCompositions()](/docs/get-compositions)
- [renderFrames()](/docs/render-frames)
