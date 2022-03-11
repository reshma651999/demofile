import {useCallback, useEffect, useRef, useState} from 'react';
import {continueRender, delayRender} from 'remotion';
import {getAudioData} from './get-audio-data';
import {AudioData} from './types';

export const useAudioData = (src: string): AudioData | null => {
	if (!src) {
		throw new TypeError("useAudioMetadata requires a 'src' parameter");
	}

	const mountState = useRef({isMounted: true});

	useEffect(() => {
		const {current} = mountState;
		current.isMounted = true;
		return () => {
			current.isMounted = false;
		};
	}, []);

	const [metadata, setMetadata] = useState<AudioData | null>(null);

	const fetchMetadata = useCallback(async () => {
		const handle = delayRender();
		const data = await getAudioData(src);
		if (mountState.current.isMounted) {
			setMetadata(data);
		}

		continueRender(handle);
	}, [src]);

	useEffect(() => {
		fetchMetadata();
	}, [fetchMetadata]);

	return metadata;
};
