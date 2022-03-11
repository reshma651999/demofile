import {getRemotionEnvironment} from './get-environment';
import {DEFAULT_PUPPETEER_TIMEOUT} from './timeout';

if (typeof window !== 'undefined') {
	window.ready = false;
}

let handles: number[] = [];
const timeouts: {[key: string]: number | NodeJS.Timeout} = {};

export const delayRender = (): number => {
	const handle = Math.random();
	handles.push(handle);
	const called = Error().stack?.replace(/^Error/g, '') ?? '';

	if (getRemotionEnvironment() === 'rendering') {
		const timeoutToUse =
			typeof window === 'undefined'
				? DEFAULT_PUPPETEER_TIMEOUT
				: window.remotion_puppeteerTimeout - 2000;
		timeouts[handle] = setTimeout(() => {
			throw new Error(
				`A delayRender was called but not cleared after ${timeoutToUse}ms. See https://remotion.dev/docs/timeout for help. The delayRender was called: ${called}`
			);
		}, timeoutToUse);
	}

	if (typeof window !== 'undefined') {
		window.ready = false;
	}

	return handle;
};

export const continueRender = (handle: number): void => {
	handles = handles.filter((h) => {
		if (h === handle) {
			if (getRemotionEnvironment() === 'rendering') {
				clearTimeout(timeouts[handle] as number);
			}

			return false;
		}

		return true;
	});
	if (handles.length === 0 && typeof window !== 'undefined') {
		window.ready = true;
	}
};
