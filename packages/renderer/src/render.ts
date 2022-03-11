import path from 'path';
import {Browser as PuppeteerBrowser} from 'puppeteer-core';
import {
	Browser,
	BrowserExecutable,
	FrameRange,
	ImageFormat,
	Internals,
	TAsset,
	VideoConfig,
} from 'remotion';
import {cycleBrowserTabs} from './cycle-browser-tabs';
import {getActualConcurrency} from './get-concurrency';
import {getFrameCount} from './get-frame-range';
import {getFrameToRender} from './get-frame-to-render';
import {DEFAULT_IMAGE_FORMAT} from './image-format';
import {ChromiumOptions, openBrowser} from './open-browser';
import {Pool} from './pool';
import {provideScreenshot} from './provide-screenshot';
import {seekToFrame} from './seek-to-frame';
import {serveStatic} from './serve-static';
import {setPropsAndEnv} from './set-props-and-env';
import {OnErrorInfo, OnStartData, RenderFramesOutput} from './types';
import {validatePuppeteerTimeout} from './validate-puppeteer-timeout';
import {validateScale} from './validate-scale';

export const renderFrames = async ({
	config,
	parallelism,
	onFrameUpdate,
	compositionId,
	outputDir,
	onStart,
	inputProps,
	envVariables = {},
	webpackBundle,
	quality,
	imageFormat = DEFAULT_IMAGE_FORMAT,
	browser = Internals.DEFAULT_BROWSER,
	frameRange,
	dumpBrowserLogs = false,
	puppeteerInstance,
	onError,
	browserExecutable,
	timeoutInMilliseconds,
	chromiumOptions,
	scale,
}: {
	config: VideoConfig;
	compositionId: string;
	onStart: (data: OnStartData) => void;
	onFrameUpdate: (f: number) => void;
	outputDir: string;
	inputProps: unknown;
	envVariables?: Record<string, string>;
	webpackBundle: string;
	imageFormat: ImageFormat;
	parallelism?: number | null;
	quality?: number;
	browser?: Browser;
	frameRange?: FrameRange | null;
	dumpBrowserLogs?: boolean;
	puppeteerInstance?: PuppeteerBrowser;
	browserExecutable?: BrowserExecutable;
	onError?: (info: OnErrorInfo) => void;
	timeoutInMilliseconds?: number;
	chromiumOptions?: ChromiumOptions;
	scale?: number;
}): Promise<RenderFramesOutput> => {
	Internals.validateDimension(
		config.height,
		'height',
		'in the `config` object passed to `renderFrames()`'
	);
	Internals.validateDimension(
		config.width,
		'width',
		'in the `config` object passed to `renderFrames()`'
	);
	Internals.validateFps(
		config.fps,
		'in the `config` object of `renderFrames()`'
	);
	Internals.validateDurationInFrames(
		config.durationInFrames,
		'in the `config` object passed to `renderFrames()`'
	);
	if (quality !== undefined && imageFormat !== 'jpeg') {
		throw new Error(
			"You can only pass the `quality` option if `imageFormat` is 'jpeg'."
		);
	}

	Internals.validateQuality(quality);
	validatePuppeteerTimeout(timeoutInMilliseconds);
	validateScale(scale);

	const actualParallelism = getActualConcurrency(parallelism ?? null);

	const [{port, close}, browserInstance] = await Promise.all([
		serveStatic(webpackBundle),
		puppeteerInstance ??
			openBrowser(browser, {
				shouldDumpIo: dumpBrowserLogs,
				browserExecutable,
				chromiumOptions,
			}),
	]);
	const pages = new Array(actualParallelism).fill(true).map(async () => {
		const page = await browserInstance.newPage();
		page.setViewport({
			width: config.width,
			height: config.height,
			deviceScaleFactor: scale ?? 1,
		});
		const errorCallback = (err: Error) => {
			onError?.({error: err, frame: null});
		};

		page.on('pageerror', errorCallback);

		const initialFrame =
			typeof frameRange === 'number'
				? frameRange
				: frameRange === null || frameRange === undefined
				? 0
				: frameRange[0];

		await setPropsAndEnv({
			inputProps,
			envVariables,
			page,
			port,
			initialFrame,
			timeoutInMilliseconds,
		});

		const site = `http://localhost:${port}/index.html?composition=${compositionId}`;
		await page.goto(site);
		page.off('pageerror', errorCallback);
		return page;
	});
	const {stopCycling} = cycleBrowserTabs(browserInstance);

	const puppeteerPages = await Promise.all(pages);
	const pool = new Pool(puppeteerPages);

	const frameCount = getFrameCount(config.durationInFrames, frameRange ?? null);
	// Substract one because 100 frames will be 00-99
	// --> 2 digits
	let filePadLength = 0;
	if (frameCount) {
		filePadLength = String(frameCount - 1).length;
	}

	let framesRendered = 0;

	onStart({
		frameCount,
	});
	const assets: TAsset[][] = new Array(frameCount).fill(undefined);
	await Promise.all(
		new Array(frameCount)
			.fill(Boolean)
			.map((x, i) => i)
			.map(async (index) => {
				const frame = getFrameToRender(frameRange ?? null, index);
				const freePage = await pool.acquire();
				const paddedIndex = String(frame).padStart(filePadLength, '0');

				const errorCallback = (err: Error) => {
					onError?.({error: err, frame});
				};

				freePage.on('pageerror', errorCallback);
				try {
					await seekToFrame({frame, page: freePage});
				} catch (err) {
					const error = err as Error;
					if (
						error.message.includes('timeout') &&
						error.message.includes('exceeded')
					) {
						errorCallback(
							new Error(
								'The rendering timed out. See https://www.remotion.dev/docs/timeout/ for possible reasons.'
							)
						);
					} else {
						errorCallback(error);
					}

					throw error;
				}

				if (imageFormat !== 'none') {
					await provideScreenshot({
						page: freePage,
						imageFormat,
						quality,
						options: {
							frame,
							output: path.join(
								outputDir,
								`element-${paddedIndex}.${imageFormat}`
							),
						},
					});
				}

				const collectedAssets = await freePage.evaluate(() => {
					return window.remotion_collectAssets();
				});
				const compressedAssets = collectedAssets.map((asset) =>
					Internals.AssetCompression.compressAsset(
						assets.filter(Internals.truthy).flat(1),
						asset
					)
				);
				assets[index] = compressedAssets;
				pool.release(freePage);
				framesRendered++;
				onFrameUpdate(framesRendered);
				freePage.off('pageerror', errorCallback);
			})
	);
	close().catch((err) => {
		console.log('Unable to close web server', err);
	});
	stopCycling();
	// If browser instance was passed in, we close all the pages
	// we opened.
	// If new browser was opened, then closing the browser as a cleanup.

	if (puppeteerInstance) {
		await Promise.all(puppeteerPages.map((p) => p.close())).catch((err) => {
			console.log('Unable to close browser tab', err);
		});
	} else {
		browserInstance.close().catch((err) => {
			console.log('Unable to close browser', err);
		});
	}

	return {
		assetsInfo: {
			assets,
			bundleDir: webpackBundle,
		},
		frameCount,
	};
};
