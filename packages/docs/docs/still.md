---
id: still
title: <Still />
---

A `<Still />` is a [`<Composition />`](/docs/composition) that is only 1 frame long. It is a convienience component for defining a composition that is meant to be rendered an image rather than a video.

## Example

The `<Still />` component has the same API as a [`<Composition />`](/docs/composition) except it's not necessary to pass `durationInFrames` and `fps`.

```tsx twoslash
// @allowUmdGlobalAccess
// @filename: ./MyComp.tsx
export const MyComp = () => <></>;

// @filename: index.tsx
// ---cut---
import { Composition, Still } from "remotion";
import { MyComp } from "./MyComp";

export const MyVideo = () => {
  return (
    <>
      <Composition
        id="my-video"
        component={MyComp}
        width={1080}
        height={1080}
        fps={30}
        durationInFrames={3 * 30}
      />
      <Still id="my-image" component={MyComp} width={1080} height={1080} />
    </>
  );
};
```

## See also

- [`<Composition />`](/docs/composition)
