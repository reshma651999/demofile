import {StandardLonghandProperties} from 'csstype';
import React, {
	forwardRef,
	MouseEventHandler,
	Suspense,
	SyntheticEvent,
	useCallback,
	useEffect,
	useImperativeHandle,
	useMemo,
	useRef,
	useState,
} from 'react';
import {Internals} from 'remotion';
import {calculateScale} from './calculate-scale';
import {ErrorBoundary} from './error-boundary';
import {PLAYER_CSS_CLASSNAME} from './player-css-classname';
import {PlayerMethods, PlayerRef} from './player-methods';
import {Controls} from './PlayerControls';
import {useHoverState} from './use-hover-state';
import {usePlayback} from './use-playback';
import {usePlayer} from './use-player';
import {browserSupportsFullscreen} from './utils/browser-supports-fullscreen';
import {calculatePlayerSize} from './utils/calculate-player-size';
import {IS_NODE} from './utils/is-node';
import {useClickPreventionOnDoubleClick} from './utils/use-click-prevention-on-double-click';
import {useElementSize} from './utils/use-element-size';

export type ErrorFallback = (info: {error: Error}) => React.ReactNode;
export type RenderLoading = (canvas: {
	height: number;
	width: number;
}) => React.ReactChild;

const PlayerUI: React.ForwardRefRenderFunction<
	PlayerRef,
	{
		controls: boolean;
		loop: boolean;
		autoPlay: boolean;
		allowFullscreen: boolean;
		inputProps: unknown;
		showVolumeControls: boolean;
		mediaMuted: boolean;
		style?: React.CSSProperties;
		clickToPlay: boolean;
		doubleClickToFullscreen: boolean;
		spaceKeyToPlayOrPause: boolean;
		setMediaVolume: (v: number) => void;
		setMediaMuted: (v: boolean) => void;
		mediaVolume: number;
		errorFallback: ErrorFallback;
		playbackRate: number;
		renderLoading?: RenderLoading;
	}
> = (
	{
		controls,
		style,
		loop,
		autoPlay,
		allowFullscreen,
		inputProps,
		clickToPlay,
		showVolumeControls,
		mediaVolume,
		mediaMuted,
		doubleClickToFullscreen,
		setMediaMuted,
		setMediaVolume,
		spaceKeyToPlayOrPause,
		errorFallback,
		playbackRate,
		renderLoading,
	},
	ref
) => {
	const config = Internals.useUnsafeVideoConfig();
	const video = Internals.useVideo();
	const container = useRef<HTMLDivElement>(null);
	const hovered = useHoverState(container);
	const canvasSize = useElementSize(container, {triggerOnWindowResize: false});

	const [hasPausedToResume, setHasPausedToResume] = useState(false);
	const [shouldAutoplay, setShouldAutoPlay] = useState(autoPlay);
	const [isFullscreen, setIsFullscreen] = useState(() => false);
	usePlayback({loop, playbackRate});
	const player = usePlayer();

	useEffect(() => {
		if (hasPausedToResume && !player.playing) {
			setHasPausedToResume(false);
			player.play();
		}
	}, [hasPausedToResume, player]);

	useEffect(() => {
		const {current} = container;

		if (!current) {
			return;
		}

		const onFullscreenChange = () => {
			setIsFullscreen(
				document.fullscreenElement === current ||
					document.webkitFullscreenElement === current
			);
		};

		document.addEventListener('fullscreenchange', onFullscreenChange);
		document.addEventListener('webkitfullscreenchange', onFullscreenChange);
		return () => {
			document.removeEventListener('fullscreenchange', onFullscreenChange);
			document.removeEventListener(
				'webkitfullscreenchange',
				onFullscreenChange
			);
		};
	}, []);

	const toggle = useCallback(
		(e?: SyntheticEvent) => {
			if (player.isPlaying()) {
				player.pause();
			} else {
				player.play(e);
			}
		},
		[player]
	);

	const requestFullscreen = useCallback(() => {
		if (!allowFullscreen) {
			throw new Error('allowFullscreen is false');
		}

		if (!browserSupportsFullscreen) {
			throw new Error('Browser doesnt support fullscreen');
		}

		if (!container.current) {
			throw new Error('No player ref found');
		}

		if (container.current.webkitRequestFullScreen) {
			container.current.webkitRequestFullScreen();
		} else {
			container.current.requestFullscreen();
		}
	}, [allowFullscreen]);

	const exitFullscreen = useCallback(() => {
		if (document.webkitExitFullscreen) {
			document.webkitExitFullscreen();
		} else {
			document.exitFullscreen();
		}
	}, []);

	const durationInFrames = config?.durationInFrames ?? 1;

	useImperativeHandle(
		ref,
		() => {
			const methods: PlayerMethods = {
				play: player.play,
				pause: player.pause,
				toggle,
				getContainerNode: () => container.current,
				getCurrentFrame: player.getCurrentFrame,
				isPlaying: () => player.playing,
				seekTo: (f) => {
					const lastFrame = durationInFrames - 1;
					const frameToSeekTo = Math.max(0, Math.min(lastFrame, f));
					if (player.isPlaying()) {
						const pauseToResume = frameToSeekTo !== lastFrame || loop;
						setHasPausedToResume(pauseToResume);
						player.pause();
					}

					if (frameToSeekTo === lastFrame && !loop) {
						player.emitter.dispatchEnded();
					}

					player.seek(frameToSeekTo);
				},
				isFullscreen: () => isFullscreen,
				requestFullscreen,
				exitFullscreen,
				getVolume: () => {
					if (mediaMuted) {
						return 0;
					}

					return mediaVolume;
				},
				setVolume: (vol: number) => {
					if (typeof vol !== 'number') {
						throw new TypeError(
							`setVolume() takes a number, got value of type ${typeof vol}`
						);
					}

					if (isNaN(vol)) {
						throw new TypeError(
							`setVolume() got a number that is NaN. Volume must be between 0 and 1.`
						);
					}

					if (vol < 0 || vol > 1) {
						throw new TypeError(
							`setVolume() got a number that is out of range. Must be between 0 and 1, got ${typeof vol}`
						);
					}

					setMediaVolume(vol);
				},
				isMuted: () => mediaMuted || mediaVolume === 0,
				mute: () => {
					setMediaMuted(true);
				},
				unmute: () => {
					setMediaMuted(false);
				},
			};
			return Object.assign(player.emitter, methods);
		},
		[
			durationInFrames,
			exitFullscreen,
			isFullscreen,
			loop,
			mediaMuted,
			mediaVolume,
			player,
			requestFullscreen,
			setMediaMuted,
			setMediaVolume,
			toggle,
		]
	);

	const VideoComponent = video ? video.component : null;

	const outerStyle: React.CSSProperties = useMemo(() => {
		if (!config) {
			return {};
		}

		return {
			position: 'relative',
			overflow: 'hidden',
			...calculatePlayerSize({
				compositionHeight: config.height,
				compositionWidth: config.width,
				currentSize: canvasSize,
				height: style?.height as StandardLonghandProperties['width'],
				width: style?.width as StandardLonghandProperties['height'],
			}),
			...style,
		};
	}, [canvasSize, config, style]);

	const layout = useMemo(() => {
		if (!config || !canvasSize) {
			return null;
		}

		return calculateScale({
			canvasSize,
			compositionHeight: config.height,
			compositionWidth: config.width,
			previewSize: 'auto',
		});
	}, [canvasSize, config]);

	const outer: React.CSSProperties = useMemo(() => {
		if (!layout || !config) {
			return {};
		}

		const {centerX, centerY, scale} = layout;

		return {
			width: config.width * scale,
			height: config.height * scale,
			display: 'flex',
			flexDirection: 'column',
			position: 'absolute',
			left: centerX,
			top: centerY,
			overflow: 'hidden',
		};
	}, [config, layout]);

	const containerStyle: React.CSSProperties = useMemo(() => {
		if (!config || !canvasSize) {
			return {};
		}

		const {scale, xCorrection, yCorrection} = calculateScale({
			canvasSize,
			compositionHeight: config.height,
			compositionWidth: config.width,
			previewSize: 'auto',
		});

		return {
			position: 'absolute',
			width: config.width,
			height: config.height,
			display: 'flex',
			transform: `scale(${scale})`,
			marginLeft: xCorrection,
			marginTop: yCorrection,
			overflow: 'hidden',
		};
	}, [canvasSize, config]);

	const onError = useCallback(
		(error: Error) => {
			player.pause();
			// Pay attention to `this context`
			player.emitter.dispatchError(error);
		},
		[player]
	);

	const onFullscreenButtonClick: MouseEventHandler<HTMLButtonElement> =
		useCallback(
			(e) => {
				e.stopPropagation();
				requestFullscreen();
			},
			[requestFullscreen]
		);

	const onExitFullscreenButtonClick: MouseEventHandler<HTMLButtonElement> =
		useCallback(
			(e) => {
				e.stopPropagation();
				exitFullscreen();
			},
			[exitFullscreen]
		);

	const onSingleClick = useCallback(
		(e: SyntheticEvent) => {
			toggle(e);
		},
		[toggle]
	);

	const onDoubleClick = useCallback(() => {
		if (isFullscreen) {
			exitFullscreen();
		} else {
			requestFullscreen();
		}
	}, [exitFullscreen, isFullscreen, requestFullscreen]);

	const [handleClick, handleDoubleClick] = useClickPreventionOnDoubleClick(
		onSingleClick,
		onDoubleClick,
		doubleClickToFullscreen
	);

	useEffect(() => {
		if (shouldAutoplay) {
			player.play();
			setShouldAutoPlay(false);
		}
	}, [shouldAutoplay, player]);

	if (!config) {
		return null;
	}

	const content = (
		<>
			<div
				style={outer}
				onClick={clickToPlay ? handleClick : undefined}
				onDoubleClick={doubleClickToFullscreen ? handleDoubleClick : undefined}
			>
				<div style={containerStyle} className={PLAYER_CSS_CLASSNAME}>
					{VideoComponent ? (
						<ErrorBoundary onError={onError} errorFallback={errorFallback}>
							<VideoComponent
								{...((video?.defaultProps as unknown as {}) ?? {})}
								{...((inputProps as unknown as {}) ?? {})}
							/>
						</ErrorBoundary>
					) : null}
				</div>
			</div>
			{controls ? (
				<Controls
					fps={config.fps}
					durationInFrames={config.durationInFrames}
					hovered={hovered}
					player={player}
					onFullscreenButtonClick={onFullscreenButtonClick}
					isFullscreen={isFullscreen}
					allowFullscreen={allowFullscreen}
					showVolumeControls={showVolumeControls}
					onExitFullscreenButtonClick={onExitFullscreenButtonClick}
					spaceKeyToPlayOrPause={spaceKeyToPlayOrPause}
				/>
			) : null}
		</>
	);
	// Don't render suspense on Node.js
	if (IS_NODE) {
		return (
			<div ref={container} style={outerStyle}>
				{content}
			</div>
		);
	}

	const loadingMarkup = renderLoading
		? renderLoading({
				height: outerStyle.height as number,
				width: outerStyle.width as number,
		  })
		: null;

	return (
		<div ref={container} style={outerStyle}>
			<Suspense fallback={loadingMarkup}>{content}</Suspense>
		</div>
	);
};

export default forwardRef(PlayerUI);
