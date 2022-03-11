import React from 'react';
import {TIMELINE_PADDING} from '../../helpers/timeline-layout';

export const MAX_TIMELINE_TRACKS =
	typeof process.env.MAX_TIMELINE_TRACKS === 'undefined'
		? 15
		: Number(process.env.MAX_TIMELINE_TRACKS);

const container: React.CSSProperties = {
	paddingTop: 6,
	paddingBottom: 6,
	color: 'rgba(255, 255, 255, 0.6)',
	fontFamily: 'sans-serif',
	fontSize: 12,
	backgroundColor: 'rgba(255, 255, 255, 0.1)',
	paddingLeft: TIMELINE_PADDING + 5,
};

export const MaxTimelineTracksReached: React.FC = () => {
	return (
		<div style={container}>
			Limited display to {MAX_TIMELINE_TRACKS} tracks to sustain performance.
			{''}
			You can change this by setting Config.Preview.setMaxTimelineTracks() in
			your remotion.config.ts file.
		</div>
	);
};
