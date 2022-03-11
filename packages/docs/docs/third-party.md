---
id: third-party
title: Third party integrations
sidebar_label: Third party integrations
---

All animations in Remotion must be driven by the value returned by the [`useCurrentFrame()`](/docs/use-current-frame) hook. If you would like to use another way of animations in Remotion, you need an integration that supports synchronizing the timing with Remotion.

On this page, we maintain a list of integrations for popular ways of animating on the web, and provide status for popular requests.

## CSS animations

You can synchronize animations with Remotions time using the `animation-play-state` and `animation-delay` CSS properties. Check out [example code](https://github.com/ahgsql/remotion-animation/blob/main/src/index.js) or use the [remotion-animation](https://github.com/ahgsql/remotion-animation/blob/main/src/index.js) library directly (_inofficial library_).

## GIFs

Use the [`@remotion/gif`](/docs/gif) component.

## Framer Motion

At the moment, we don't have a Framer Motion integration, but are discussing the matter on [GitHub Issues](https://github.com/remotion-dev/remotion/issues/399).

## Lottie

Use the [`remotion-lottie`](https://github.com/ahgsql/remotion-lottie) package (_inofficial library_).

## Three.JS

Use the [`@remotion/three`](/docs/three) package.

## react-spring

There is no direct compatibility but Remotion provides it's own [`spring()`](/docs/spring) instead.

## Reanimated

There is no integration available but Remotion shares some code with Reanimated, in particular [`interpolate()`](/docs/interpolate), [`spring()`](/docs/spring) and [`Easing`](/docs/easing). This makes it easier to refactor already existing animation from Reanimated.

## Other libraries

Are you interested in using other libraries with Remotion? You can [file a GitHub issue](https://github.com/remotion-dev/remotion/issues/new) to inquire it. While we cannot guarantee to help you, you can register interest and kick of the discussion.
