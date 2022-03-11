---
title: visualizeAudio()
id: visualize-audio
---

_Part of the `@remotion/media-utils` package of helper functions._

This function takes in `AudioData` (preferrably fetched by the [`useAudioData()`](/docs/use-audio-data) hook) and processes it in a way that makes visualizing the audio that is playing at the current frame easy.

## Arguments

### `options`

The only argument for this function is an object containing the following values:

- `audioData`: `AudioData` - an object containing audio data. You can fetch this object using [`useAudioData()`](/docs/use-audio-data) or [`getAudioData()`](/docs/get-audio-data).

- `frame`: `number` - the time of the track that you want to get the audio information for. The `frame` always refers to the position in the audio track - if you have shifted or trimmed the audio in your timeline, the frame returned by `useCurrentFrame` must also be tweaked before you pass it into this function.

- `fps`: `number` - the frame rate of the composition. This helps the function understand the meaning of the `frame` input.

- `numberOfSamples`: `number` - must be a power of two, such as `32`, `64`, `128`, etc. This parameter controls the length of the output array. A lower number will simplify the spectrum and is useful if you want to animate elements roughly based on the level of lows, mids and highs. A higher number will give the spectrum in more detail, which is useful for displaying a bar chart or waveform-style visualization of the audio.

## Return value

`number[]` - An array of values describing the amplitude of each frequency range. Each value is between 0 and 1. The array is of length defined by the `numberOfSamples` parameter.

The values on the left of the array are low frequencies (for example bass) and as we move towards the right, we go through the mid and high frequencies like drums and vocals.

Usually the values on left side of the array can become much larger than the values on the right. This is not a mistake, but for some visualizations you might have to apply some postprocessing to it, you can flatten the curve by for example mapping each value to a logarithm of the original function.

## Example

In this example, we render a bar chart visualizing the audio spectrum of an audio file we imported using [`useAudioData()`](/docs/use-audio-data) and `visualizeAudio()`.

```tsx twoslash
import { Audio, useCurrentFrame, useVideoConfig } from "remotion";
import { useAudioData, visualizeAudio } from "@remotion/media-utils";
import music from "./music.mp3";

export const MyComponent: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const audioData = useAudioData(music);

  if (!audioData) {
    return null;
  }

  const visualization = visualizeAudio({
    fps,
    frame,
    audioData,
    numberOfSamples: 16,
  }); // [0.22, 0.1, 0.01, 0.01, 0.01, 0.02, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

  // Render a bar chart for each frequency, the higher the amplitude,
  // the longer the bar
  return (
    <div>
      <Audio src={music} />
      {visualization.map((v) => {
        return (
          <div
            style={{ width: 1000 * v, height: 15, backgroundColor: "blue" }}
          />
        );
      })}
    </div>
  );
};
```

## See also

- [Audio visualization](/docs/audio-visualization)
- [`useAudioData()`](/docs/use-audio-data)
- [`getAudioData()`](/docs/get-audio-data)
- [`<Audio/>`](/docs/audio)
- [Using audio](/docs/using-audio)
