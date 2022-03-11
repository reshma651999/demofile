import puppeteer from 'puppeteer-core';
import {ImageFormat} from 'remotion';
import {screenshotDOMElement} from './screenshot-dom-element';

export const provideScreenshot = async ({
	page,
	imageFormat,
	options,
	quality,
}: {
	page: puppeteer.Page;
	imageFormat: ImageFormat;
	quality: number | undefined;
	options: {
		frame: number;
		output: string;
	};
}): Promise<void> => {
	await screenshotDOMElement({
		page,
		opts: {
			path: options.output,
			selector: '#remotion-canvas',
		},
		imageFormat,
		quality,
	});
};
