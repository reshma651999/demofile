import {SyntheticEvent, useCallback, useContext, useMemo, useRef} from 'react';
import {Internals} from 'remotion';
import {PlayerEventEmitterContext} from './emitter-context';
import {PlayerEmitter} from './event-emitter';

export const usePlayer = (): {
	frameBack: (frames: number) => void;
	frameForward: (frames: number) => void;
	isLastFrame: boolean;
	emitter: PlayerEmitter;
	playing: boolean;
	play: (e?: SyntheticEvent) => void;
	pause: () => void;
	seek: (newFrame: number) => void;
	getCurrentFrame: () => number;
	isPlaying: () => boolean;
} => {
	const [playing, setPlaying, imperativePlaying] =
		Internals.Timeline.usePlayingState();
	const frame = Internals.Timeline.useTimelinePosition();
	const setFrame = Internals.Timeline.useTimelineSetFrame();
	const setTimelinePosition = Internals.Timeline.useTimelineSetFrame();
	const audioContext = useContext(Internals.SharedAudioContext);
	const {audioAndVideoTags} = useContext(Internals.Timeline.TimelineContext);

	const frameRef = useRef<number>();
	frameRef.current = frame;
	const video = Internals.useVideo();
	const config = Internals.useUnsafeVideoConfig();
	const emitter = useContext(PlayerEventEmitterContext);

	const lastFrame = (config?.durationInFrames ?? 1) - 1;
	const isLastFrame = frame === lastFrame;

	if (!emitter) {
		throw new TypeError('Expected Player event emitter context');
	}

	const seek = useCallback(
		(newFrame: number) => {
			setTimelinePosition(newFrame);
			emitter.dispatchSeek(newFrame);
		},
		[emitter, setTimelinePosition]
	);

	const play = useCallback(
		(e?: SyntheticEvent) => {
			if (imperativePlaying.current) {
				return;
			}

			if (isLastFrame) {
				seek(0);
			}

			/**
			 * Play silent audio tags to warm them up for autoplay
			 */
			if (audioContext && audioContext.numberOfAudioTags > 0 && e) {
				audioContext.playAllAudios();
			}

			/**
			 * Play audios and videos directly here so they can benefit from
			 * being triggered by a click
			 */
			audioAndVideoTags.current.forEach((a) => a.play());

			imperativePlaying.current = true;
			setPlaying(true);
			emitter.dispatchPlay();
		},
		[
			imperativePlaying,
			isLastFrame,
			audioContext,
			setPlaying,
			emitter,
			seek,
			audioAndVideoTags,
		]
	);

	const pause = useCallback(() => {
		if (imperativePlaying.current) {
			imperativePlaying.current = false;

			setPlaying(false);
			emitter.dispatchPause();
		}
	}, [emitter, imperativePlaying, setPlaying]);

	const hasVideo = Boolean(video);

	const frameBack = useCallback(
		(frames: number) => {
			if (!hasVideo) {
				return null;
			}

			if (imperativePlaying.current) {
				return;
			}

			setFrame((f) => {
				return Math.max(0, f - frames);
			});
		},
		[hasVideo, imperativePlaying, setFrame]
	);

	const frameForward = useCallback(
		(frames: number) => {
			if (!hasVideo) {
				return null;
			}

			if (imperativePlaying.current) {
				return;
			}

			setFrame((f) => Math.min(lastFrame, f + frames));
		},
		[hasVideo, imperativePlaying, lastFrame, setFrame]
	);

	const returnValue = useMemo(() => {
		return {
			frameBack,
			frameForward,
			isLastFrame,
			emitter,
			playing,
			play,
			pause,
			seek,
			getCurrentFrame: () => frameRef.current as number,
			isPlaying: () => imperativePlaying.current as boolean,
		};
	}, [
		emitter,
		frameBack,
		frameForward,
		imperativePlaying,
		isLastFrame,
		pause,
		play,
		playing,
		seek,
	]);

	return returnValue;
};
