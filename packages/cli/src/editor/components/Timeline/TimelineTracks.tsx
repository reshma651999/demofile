import React, {useMemo} from 'react';
import {TrackWithHash} from '../../helpers/get-timeline-sequence-sort-key';
import {
	TIMELINE_BORDER,
	TIMELINE_LAYER_HEIGHT,
	TIMELINE_PADDING,
} from '../../helpers/timeline-layout';
import {isTrackHidden} from './is-collapsed';
import {MaxTimelineTracksReached} from './MaxTimelineTracks';
import {TimelineViewState} from './timeline-state-reducer';
import {TimelineSequence} from './TimelineSequence';

const content: React.CSSProperties = {
	paddingLeft: TIMELINE_PADDING,
	paddingRight: TIMELINE_PADDING,
};

const timelineContent: React.CSSProperties = {
	flex: 1,
	backgroundColor: '#111111',
	width: '100%',
};

export const TimelineTracks: React.FC<{
	timeline: TrackWithHash[];
	fps: number;
	viewState: TimelineViewState;
	hasBeenCut: boolean;
}> = ({timeline, fps, viewState, hasBeenCut}) => {
	const inner: React.CSSProperties = useMemo(() => {
		return {
			height: TIMELINE_LAYER_HEIGHT + TIMELINE_BORDER * 2,
		};
	}, []);
	return (
		<div style={timelineContent}>
			<div style={content}>
				{timeline.map((track) => {
					if (isTrackHidden(track, timeline, viewState)) {
						return null;
					}

					return (
						<div key={track.sequence.id} style={inner}>
							<TimelineSequence fps={fps} s={track.sequence} />
						</div>
					);
				})}
			</div>
			{hasBeenCut ? <MaxTimelineTracksReached /> : null}
		</div>
	);
};
