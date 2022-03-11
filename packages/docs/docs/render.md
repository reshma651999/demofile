---
id: render
title: Render your video
---

Now here comes the magic! Turn your creation into an MP4.

```bash
npm run build
```

The underlying command in package.json is defined as follows:

```bash
npx remotion render src/index.tsx HelloWorld out/video.mp4
```

Modify it to select a different video to render, or change its output location.
Learn about all the options on the [CLI reference page](/docs/cli).

## More ways to render

### SSR

Remotion has a full-featured server-side rendering API. Read more about it on the [server-side rendering API](/docs/ssr).

### Github Actions

You can also render a [video using a Github Action.](/docs/ssr#render-using-github-actions)

### Serverless

We are also working on a Serverless solution for rendering videos, [which is in private beta](/docs/ssr#rendering-a-video-using-serverless).

### Only audio

Instead of rendering a video, [you can also just export the audio.](/docs/encoding#audio-only-export)

### Image Sequence

Instead of encoding as a video, you can use the [`--sequence`](/docs/cli#--sequence) command to output a series of image.

### Still images

If you want a single image, you can do so using [the CLI or Node.JS API](/docs/stills).

## See also

- [CLI options](/docs/cli)
