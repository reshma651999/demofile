import {PlayerInternals} from '@remotion/player';
import React, {useCallback, useEffect, useState} from 'react';
import {Internals, interpolate} from 'remotion';
import {useGetXPositionOfItemInTimeline} from '../../helpers/get-left-of-timeline-slider';
import {TIMELINE_PADDING} from '../../helpers/timeline-layout';
import {persistCurrentFrame} from '../FramePersistor';
import {sliderAreaRef} from './timeline-refs';
import {inMarkerAreaRef, outMarkerAreaRef} from './TimelineInOutPointer';
import {
	inPointerHandle,
	outPointerHandle,
	TimelineInOutPointerHandle,
} from './TimelineInOutPointerHandle';

const inner: React.CSSProperties = {
	overflowY: 'auto',
	overflowX: 'hidden',
};

const container: React.CSSProperties = {
	userSelect: 'none',
	overflow: 'hidden',
	position: 'absolute',
	width: '100%',
	height: '100%',
};

const getFrameFromX = (
	clientX: number,
	durationInFrames: number,
	width: number,
	extrapolate: 'clamp' | 'extend'
) => {
	const pos = clientX - TIMELINE_PADDING;
	const frame = Math.round(
		interpolate(
			pos,
			[0, width - TIMELINE_PADDING * 2],
			[0, durationInFrames - 1 ?? 0],
			{
				extrapolateLeft: extrapolate,
				extrapolateRight: extrapolate,
			}
		)
	);
	return frame;
};

export const TimelineDragHandler: React.FC = () => {
	const size = PlayerInternals.useElementSize(sliderAreaRef, {
		triggerOnWindowResize: true,
	});
	const [inOutDragging, setInOutDragging] = useState<
		| {
				dragging: false;
		  }
		| {
				dragging: 'in' | 'out';
				initialOffset: number;
				boundaries: [number, number];
		  }
	>({
		dragging: false,
	});
	const width = size?.width ?? 0;
	const left = size?.left ?? 0;
	const {
		inFrame,
		outFrame,
	} = Internals.Timeline.useTimelineInOutFramePosition();

	const {
		setInAndOutFrames,
	} = Internals.Timeline.useTimelineSetInOutFramePosition();

	const {get} = useGetXPositionOfItemInTimeline();
	const [dragging, setDragging] = useState<
		| {
				dragging: false;
		  }
		| {
				dragging: true;
				wasPlaying: boolean;
		  }
	>({
		dragging: false,
	});
	const {playing, play, pause, seek} = PlayerInternals.usePlayer();
	const videoConfig = Internals.useUnsafeVideoConfig();

	const onPointerDown = useCallback(
		(e: React.PointerEvent<HTMLDivElement>) => {
			if (!videoConfig) {
				return;
			}

			if ((e.target as Node) === inPointerHandle.current) {
				if (inFrame === null) {
					throw new Error('expected outframe');
				}

				const inMarker = get(inFrame);
				const outMarker = outFrame === null ? Infinity : get(outFrame - 1);
				setInOutDragging({
					dragging: 'in',
					initialOffset: e.clientX,
					boundaries: [-Infinity, outMarker - inMarker],
				});
				return;
			}

			if ((e.target as Node) === outPointerHandle.current) {
				if (outFrame === null) {
					throw new Error('expected outframe');
				}

				const outMarker = get(outFrame);
				const inMarker = inFrame === null ? -Infinity : get(inFrame + 1);
				setInOutDragging({
					dragging: 'out',
					initialOffset: e.clientX,
					boundaries: [inMarker - outMarker, Infinity],
				});

				return;
			}

			const frame = getFrameFromX(
				e.clientX - left,
				videoConfig.durationInFrames,
				width,
				'clamp'
			);
			seek(frame);
			setDragging({
				dragging: true,
				wasPlaying: playing,
			});
			pause();
		},
		[videoConfig, left, width, seek, playing, pause, outFrame, get, inFrame]
	);

	const onPointerMoveScrubbing = useCallback(
		(e: PointerEvent) => {
			if (!videoConfig) {
				return;
			}

			if (!dragging.dragging) {
				return;
			}

			const frame = getFrameFromX(
				e.clientX - left,
				videoConfig.durationInFrames,
				width,
				'clamp'
			);
			seek(frame);
		},
		[dragging.dragging, seek, left, videoConfig, width]
	);

	const onPointerMoveInOut = useCallback(
		(e: PointerEvent) => {
			if (!videoConfig) {
				return;
			}

			if (!inOutDragging.dragging) {
				return;
			}

			const offset = Math.max(
				inOutDragging.boundaries[0],
				Math.min(
					inOutDragging.boundaries[1],
					e.clientX - inOutDragging.initialOffset
				)
			);
			if (inOutDragging.dragging === 'in') {
				if (!inPointerHandle.current) {
					throw new Error('in pointer handle');
				}

				if (!inMarkerAreaRef.current) {
					throw new Error('expected inMarkerAreaRef');
				}

				if (!inFrame) {
					throw new Error('expected inframes');
				}

				inPointerHandle.current.style.transform = `translateX(${
					get(inFrame) + offset
				}px)`;
				inMarkerAreaRef.current.style.width =
					String(get(inFrame) + offset) + 'px';
			}

			if (inOutDragging.dragging === 'out') {
				if (!outPointerHandle.current) {
					throw new Error('in pointer handle');
				}

				if (!outMarkerAreaRef.current) {
					throw new Error('in outMarkerAreaRef');
				}

				if (!outFrame) {
					throw new Error('expected outframes');
				}

				outPointerHandle.current.style.transform = `translateX(${
					get(outFrame) + offset
				}px)`;
				outMarkerAreaRef.current.style.left =
					String(get(outFrame) + offset) + 'px';
				outMarkerAreaRef.current.style.width =
					String(width - get(outFrame) - offset) + 'px';
			}
		},
		[get, inFrame, inOutDragging, outFrame, videoConfig, width]
	);

	const onPointerUpScrubbing = useCallback(
		(e: PointerEvent) => {
			if (!videoConfig) {
				return;
			}

			if (!dragging.dragging) {
				return;
			}

			setDragging({
				dragging: false,
			});

			const frame = getFrameFromX(
				e.clientX - left,
				videoConfig.durationInFrames,
				width,
				'clamp'
			);

			persistCurrentFrame(frame);

			if (dragging.wasPlaying) {
				play();
			}
		},
		[dragging, left, play, videoConfig, width]
	);

	const onPointerUpInOut = useCallback(
		(e: PointerEvent) => {
			if (!videoConfig) {
				return;
			}

			if (!inOutDragging.dragging) {
				return;
			}

			setInOutDragging({
				dragging: false,
			});

			const frame = getFrameFromX(
				e.clientX - left,
				videoConfig.durationInFrames,
				width,
				'extend'
			);
			if (inOutDragging.dragging === 'in') {
				if (frame < 1) {
					return setInAndOutFrames((prev) => ({
						...prev,
						inFrame: null,
					}));
				}

				const maxFrame = outFrame === null ? Infinity : outFrame - 1;
				setInAndOutFrames((prev) => ({
					...prev,
					inFrame: Math.min(maxFrame, frame),
				}));
			} else {
				if (frame > videoConfig.durationInFrames - 2) {
					return setInAndOutFrames((prev) => ({
						...prev,
						outFrame: null,
					}));
				}

				const minFrame = inFrame === null ? -Infinity : inFrame + 1;
				setInAndOutFrames((prev) => ({
					...prev,
					outFrame: Math.max(minFrame, frame),
				}));
			}
		},
		[
			inFrame,
			inOutDragging.dragging,
			left,
			outFrame,
			setInAndOutFrames,
			videoConfig,
			width,
		]
	);

	useEffect(() => {
		if (!dragging.dragging) {
			return;
		}

		window.addEventListener('pointermove', onPointerMoveScrubbing);
		window.addEventListener('pointerup', onPointerUpScrubbing);
		return () => {
			window.removeEventListener('pointermove', onPointerMoveScrubbing);
			window.removeEventListener('pointerup', onPointerUpScrubbing);
		};
	}, [dragging.dragging, onPointerMoveScrubbing, onPointerUpScrubbing]);

	useEffect(() => {
		if (inOutDragging.dragging === false) {
			return;
		}

		window.addEventListener('pointermove', onPointerMoveInOut);
		window.addEventListener('pointerup', onPointerUpInOut);
		return () => {
			window.removeEventListener('pointermove', onPointerMoveInOut);
			window.removeEventListener('pointerup', onPointerUpInOut);
		};
	}, [inOutDragging.dragging, onPointerMoveInOut, onPointerUpInOut]);

	return (
		<div ref={sliderAreaRef} style={container} onPointerDown={onPointerDown}>
			<div style={inner} />
			{inFrame !== null && (
				<TimelineInOutPointerHandle
					type="in"
					atFrame={inFrame}
					dragging={inOutDragging.dragging === 'in'}
				/>
			)}
			{outFrame !== null && (
				<TimelineInOutPointerHandle
					type="out"
					dragging={inOutDragging.dragging === 'out'}
					atFrame={outFrame}
				/>
			)}
		</div>
	);
};
