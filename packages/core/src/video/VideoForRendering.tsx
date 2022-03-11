import React, {
	forwardRef,
	useContext,
	useEffect,
	useImperativeHandle,
	useMemo,
	useRef,
} from 'react';
import {getAbsoluteSrc} from '../absolute-src';
import {
	useFrameForVolumeProp,
	useMediaStartsAt,
} from '../audio/use-audio-frame';
import {CompositionManager} from '../CompositionManager';
import {isApproximatelyTheSame} from '../is-approximately-the-same';
import {isRemoteAsset} from '../is-remote-asset';
import {random} from '../random';
import {continueRender, delayRender} from '../ready-manager';
import {SequenceContext} from '../sequencing';
import {useAbsoluteCurrentFrame, useCurrentFrame} from '../use-frame';
import {useUnsafeVideoConfig} from '../use-unsafe-video-config';
import {evaluateVolume} from '../volume-prop';
import {getMediaTime} from './get-current-time';
import {RemotionVideoProps} from './props';

const VideoForRenderingForwardFunction: React.ForwardRefRenderFunction<
	HTMLVideoElement,
	RemotionVideoProps
> = ({onError, volume: volumeProp, playbackRate, ...props}, ref) => {
	const absoluteFrame = useAbsoluteCurrentFrame();

	const frame = useCurrentFrame();
	const volumePropsFrame = useFrameForVolumeProp();
	const videoConfig = useUnsafeVideoConfig();
	const videoRef = useRef<HTMLVideoElement>(null);
	const sequenceContext = useContext(SequenceContext);
	const mediaStartsAt = useMediaStartsAt();

	const {registerAsset, unregisterAsset} = useContext(CompositionManager);

	// Generate a string that's as unique as possible for this asset
	// but at the same time the same on all threads
	const id = useMemo(
		() =>
			`video-${random(props.src ?? '')}-${sequenceContext?.cumulatedFrom}-${
				sequenceContext?.relativeFrom
			}-${sequenceContext?.durationInFrames}-muted:${props.muted}`,
		[
			props.src,
			props.muted,
			sequenceContext?.cumulatedFrom,
			sequenceContext?.relativeFrom,
			sequenceContext?.durationInFrames,
		]
	);

	if (!videoConfig) {
		throw new Error('No video config found');
	}

	const volume = evaluateVolume({
		volume: volumeProp,
		frame: volumePropsFrame,
		mediaVolume: 1,
	});

	useEffect(() => {
		if (!props.src) {
			throw new Error('No src passed');
		}

		if (props.muted) {
			return;
		}

		registerAsset({
			type: 'video',
			src: getAbsoluteSrc(props.src),
			id,
			frame: absoluteFrame,
			volume,
			isRemote: isRemoteAsset(getAbsoluteSrc(props.src), false),
			mediaFrame: frame,
			playbackRate: playbackRate ?? 1,
		});

		return () => unregisterAsset(id);
	}, [
		props.muted,
		props.src,
		registerAsset,
		id,
		unregisterAsset,
		volume,
		frame,
		absoluteFrame,
		playbackRate,
	]);

	useImperativeHandle(ref, () => {
		return videoRef.current as HTMLVideoElement;
	});

	useEffect(() => {
		if (!videoRef.current) {
			return;
		}

		const currentTime = (() => {
			return getMediaTime({
				fps: videoConfig.fps,
				frame,
				src: props.src as string,
				playbackRate: playbackRate || 1,
				startFrom: -mediaStartsAt,
			});
		})();
		const handle = delayRender();
		if (process.env.NODE_ENV === 'test') {
			continueRender(handle);
			return;
		}

		if (isApproximatelyTheSame(videoRef.current.currentTime, currentTime)) {
			if (videoRef.current.readyState >= 2) {
				continueRender(handle);
				return;
			}

			videoRef.current.addEventListener(
				'loadeddata',
				() => {
					continueRender(handle);
				},
				{once: true}
			);
			return;
		}

		videoRef.current.currentTime = currentTime;

		videoRef.current.addEventListener(
			'seeked',
			() => {
				if (window.navigator.platform.startsWith('Mac')) {
					// Improve me: This is ensures frame perfectness but slows down render.
					// Please see this issue for context: https://github.com/remotion-dev/remotion/issues/200

					// Only affects macOS since it uses VideoToolbox decoding.
					setTimeout(() => {
						continueRender(handle);
					}, 100);
				} else {
					continueRender(handle);
				}
			},
			{once: true}
		);
		videoRef.current.addEventListener(
			'ended',
			() => {
				continueRender(handle);
			},
			{once: true}
		);
		videoRef.current.addEventListener(
			'error',
			(err) => {
				console.error('Error occurred in video', err);
				continueRender(handle);
			},
			{once: true}
		);
	}, [
		volumePropsFrame,
		props.src,
		playbackRate,
		videoConfig.fps,
		frame,
		mediaStartsAt,
	]);

	return <video ref={videoRef} {...props} onError={onError} />;
};

export const VideoForRendering = forwardRef(VideoForRenderingForwardFunction);
