import React, {useState} from 'react';
import {continueRender, delayRender, Img, staticFile} from 'remotion';

export const StaticDemo: React.FC = () => {
	const [handle1] = useState(() => delayRender());
	const [handle2] = useState(() => delayRender());
	return (
		<>
			<Img
				src={staticFile('logo.png')}
				onLoad={() => continueRender(handle1)}
			/>
			<Img
				src={staticFile('/nested/mp4.png')}
				onLoad={() => continueRender(handle2)}
			/>
		</>
	);
};
