import React, {MouseEventHandler, useEffect, useMemo, useRef} from 'react';
import {Internals} from 'remotion';
import {formatTime} from './format-time';
import {FullscreenIcon, PauseIcon, PlayIcon} from './icons';
import {MediaVolumeSlider} from './MediaVolumeSlider';
import {PlayerSeekBar} from './PlayerSeekBar';
import {usePlayer} from './use-player';
import {browserSupportsFullscreen} from './utils/browser-supports-fullscreen';

const containerStyle: React.CSSProperties = {
	boxSizing: 'border-box',
	position: 'absolute',
	bottom: 0,
	width: '100%',
	paddingTop: 10,
	paddingBottom: 10,
	background: 'linear-gradient(transparent, rgba(0, 0, 0, 0.4))',
	display: 'flex',
	paddingRight: 12,
	paddingLeft: 12,
	flexDirection: 'column',
	transition: 'opacity 0.3s',
};

const buttonStyle: React.CSSProperties = {
	appearance: 'none',
	backgroundColor: 'transparent',
	border: 'none',
	cursor: 'pointer',
	padding: 0,
	display: 'inline',
	marginBottom: 0,
	marginTop: 0,
	height: 25,
};

const controlsRow: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'row',
	width: '100%',
	alignItems: 'center',
	justifyContent: 'center',
	userSelect: 'none',
};

const leftPartStyle: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'row',
	userSelect: 'none',
	alignItems: 'center',
};

const xSpacer: React.CSSProperties = {
	width: 10,
};

const ySpacer: React.CSSProperties = {
	height: 8,
};

const flex1: React.CSSProperties = {
	flex: 1,
};

const fullscreen: React.CSSProperties = {};

const timeLabel: React.CSSProperties = {
	color: 'white',
	fontFamily: 'sans-serif',
	fontSize: 14,
};

export const Controls: React.FC<{
	fps: number;
	durationInFrames: number;
	hovered: boolean;
	showVolumeControls: boolean;
	player: ReturnType<typeof usePlayer>;
	onFullscreenButtonClick: MouseEventHandler<HTMLButtonElement>;
	isFullscreen: boolean;
	allowFullscreen: boolean;
	onExitFullscreenButtonClick: MouseEventHandler<HTMLButtonElement>;
	spaceKeyToPlayOrPause: boolean;
}> = ({
	durationInFrames,
	hovered,
	isFullscreen,
	fps,
	player,
	showVolumeControls,
	onFullscreenButtonClick,
	allowFullscreen,
	onExitFullscreenButtonClick,
	spaceKeyToPlayOrPause,
}) => {
	const playButtonRef = useRef<HTMLButtonElement | null>(null);
	const frame = Internals.Timeline.useTimelinePosition();

	const containerCss: React.CSSProperties = useMemo(() => {
		// Hide if playing and mouse outside
		const shouldShow = hovered || !player.playing;
		return {
			...containerStyle,
			opacity: Number(shouldShow),
		};
	}, [hovered, player.playing]);

	useEffect(() => {
		if (playButtonRef.current && spaceKeyToPlayOrPause) {
			// This switches focus to play button when player.playing flag changes
			playButtonRef.current.focus();
		}
	}, [player.playing, spaceKeyToPlayOrPause]);

	return (
		<div style={containerCss}>
			<div style={controlsRow}>
				<div style={leftPartStyle}>
					<button
						ref={playButtonRef}
						type="button"
						style={buttonStyle}
						onClick={player.playing ? player.pause : player.play}
						aria-label={player.playing ? 'Pause video' : 'Play video'}
						title={player.playing ? 'Pause video' : 'Play video'}
					>
						{player.playing ? <PauseIcon /> : <PlayIcon />}
					</button>
					{showVolumeControls ? (
						<>
							<div style={xSpacer} />
							<MediaVolumeSlider />
						</>
					) : null}
					<div style={xSpacer} />
					<div style={timeLabel}>
						{formatTime(frame / fps)} / {formatTime(durationInFrames / fps)}
					</div>
					<div style={xSpacer} />
				</div>
				<div style={flex1} />
				{browserSupportsFullscreen && allowFullscreen ? (
					<div style={fullscreen}>
						<button
							type="button"
							aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter Fullscreen'}
							title={isFullscreen ? 'Exit fullscreen' : 'Enter Fullscreen'}
							style={buttonStyle}
							onClick={
								isFullscreen
									? onExitFullscreenButtonClick
									: onFullscreenButtonClick
							}
						>
							<FullscreenIcon minimized={!isFullscreen} />
						</button>
					</div>
				) : null}
			</div>
			<div style={ySpacer} />
			<PlayerSeekBar durationInFrames={durationInFrames} />
		</div>
	);
};
