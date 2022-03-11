---
id: sequence
title: <Sequence />
sidebar_label: <Sequence />
---

import { SequenceForwardExample } from "../components/SequenceExamples/SequenceForward";

```twoslash include example
const BlueSquare: React.FC = () => <div></div>
// - BlueSquare
```

Using a Sequence, you can time-shift certain parts of your animation and therefore make them more reusable. Sequences are also shown in the timeline and help you visually understand the structure of your video.

## API

The Sequence component is a high order component and accepts, besides it's children, the following props:

- `from` _(required)_: At which frame it's children should assume the video starts. When the sequence is at `frame`, it's children are at frame `0`.

- `durationInFrames` _(optional)_: For how many frames the sequence should be displayed. Children are unmounted if they are not within the time range of display. By default it will be `Infinity` to avoid limit the duration of the sequence.

- `name` _(optional)_: You can give your sequence a name and it will be shown as the label of the sequence in the timeline of the Remotion preview. This property is purely for helping you keep track of sequences in the timeline.

- `layout`: _(optional)_: Either `"absolute-fill"` _(default)_ or `"none"` By default, your sequences will be absolutely positioned, so they will overlay each other. If you would like to opt out of it and handle layouting yourself, pass `layout="none"`. Available since v1.4.

:::info
Good to know: You can nest sequences within each other and they will cascade. For example, a sequence that starts at frame 60 which is inside a sequence that starts at frame 30 will have it's children start at frame 90. However, nested sequences are not currently displayed in the timeline.
:::

## Examples

All the examples below are based on the following animation of a blue square:

<SequenceForwardExample type="base" />

<br />

```tsx twoslash
// @include: example-BlueSquare
// ---cut---
const MyVideo = () => {
  return <BlueSquare />;
};
```

### Delay

If you would like to delay the content by say 30 frames, you can wrap it in <br/> `<Sequence from={30}>`.

<SequenceForwardExample type="delay" />
<br />

```tsx twoslash
// @include: example-BlueSquare
import { Sequence } from "remotion";
// ---cut---
const MyVideo = () => {
  return (
    <Sequence from={30}>
      <BlueSquare />
    </Sequence>
  );
};
```

### Trim end

We can clip some content so it only stays visible for a certain time by specifying a non-finite `durationInFrames` number.
In this example, we wrap the square in `<Sequence from={0} durationInFrames={45}>` and as you can see, it disappears after 45 frames.

<SequenceForwardExample type="clip" />
<br />

### Trim start

To trim the start of some content, we can pass a negative value to `from`.
In this example, we wrap the square in `<Sequence from={-15}>` and as a result, the animation has already progressed by 15 frames at the start of the video.

<SequenceForwardExample type="trim-start" />

### Trim and delay

What if you want to trim the start of the content and delay it at the same time?
You need to wrap the videos in two sequences. To the inner one we pass a negative start value `from={-15}` to trim away the first 15 frames of the content, to the outer one we pass a positive value `from={30}` to then shift it forwards by 30 frames.

<SequenceForwardExample type="trim-and-delay" />
<br />

```tsx twoslash
// @include: example-BlueSquare
import { Sequence } from "remotion";
// ---cut---
const TrimAndDelayExample: React.FC = () => {
  return (
    <Sequence from={30}>
      <Sequence from={-15}>
        <BlueSquare />
      </Sequence>
    </Sequence>
  );
};
```

## Play Sequences sequentially

See the [`<Series />`](/docs/series) helper component, which helps you calculate markup that makes sequences play after each other.

## See also

- [Reuse components using Sequences](/docs/reusability)
- [`<Series />`](/docs/series)
