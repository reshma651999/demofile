import {Sequence, staticFile, useVideoConfig, Video} from 'remotion';

export const VideoTesting: React.FC<{
	codec: 'mp4' | 'webm' | string;
}> = ({codec}) => {
	const {durationInFrames} = useVideoConfig();
	const videoMp4 = staticFile('./framer.mp4');
	const videoWebm = staticFile('./framer.webm');
	return (
		<div>
			<Sequence from={0} durationInFrames={durationInFrames}>
				<Video src={codec === 'mp4' ? videoMp4 : videoWebm} />
			</Sequence>
		</div>
	);
};
