import {LooseAnyComponent} from './any-component';
import {
	SharedAudioContext,
	SharedAudioContextProvider,
} from './audio/shared-audio-tags';
import {CompProps} from './Composition';
import {
	CompositionManager,
	CompositionManagerContext,
	RenderAssetInfo,
	TAsset,
	TCompMetadata,
	TComposition,
	TSequence,
} from './CompositionManager';
import {DEFAULT_BROWSER, getBrowser} from './config/browser';
import {getBrowserExecutable} from './config/browser-executable';
import {getCustomFfmpegExecutable} from './config/ffmpeg-executable';
import {
	DEFAULT_CODEC,
	getFinalOutputCodec,
	getOutputCodecOrUndefined,
} from './config/codec';
import {getConcurrency} from './config/concurrency';
import {
	getActualCrf,
	getDefaultCrfForCodec,
	validateSelectedCrfAndCodecCombination,
} from './config/crf';
import {getDotEnvLocation} from './config/env-file';
import {
	getRange,
	setFrameRangeFromCli,
	validateFrameRange,
} from './config/frame-range';
import {
	getUserPreferredImageFormat,
	validateSelectedPixelFormatAndImageFormatCombination,
} from './config/image-format';
import {getShouldOutputImageSequence} from './config/image-sequence';
import {INPUT_PROPS_KEY} from './config/input-props';
import * as Logging from './config/log';
import {getMaxTimelineTracks} from './config/max-timeline-tracks';
import {
	getWebpackOverrideFn,
	WebpackOverrideFn,
} from './config/override-webpack';
import {getShouldOverwrite} from './config/overwrite';
import {
	DEFAULT_PIXEL_FORMAT,
	getPixelFormat,
	validateSelectedPixelFormatAndCodecCombination,
} from './config/pixel-format';
import {getServerPort} from './config/preview-server';
import {
	getProResProfile,
	ProResProfile,
	setProResProfile,
	validateSelectedCodecAndProResCombination,
} from './config/prores-profile';
import {getQuality} from './config/quality';
import {getScale} from './config/scale';
import {getStillFrame, setStillFrame} from './config/still-frame';
import {
	DEFAULT_WEBPACK_CACHE_ENABLED,
	getWebpackCaching,
} from './config/webpack-caching';
import * as CSSUtils from './default-css';
import {FEATURE_FLAG_FIREFOX_SUPPORT} from './feature-flags';
import {getRemotionEnvironment, RemotionEnvironment} from './get-environment';
import {
	INITIAL_FRAME_LOCAL_STORAGE_KEY,
	setupInitialFrame,
} from './initial-frame';
import {isAudioCodec} from './is-audio-codec';
import * as perf from './perf';
import {
	getCompositionName,
	getIsEvaluation,
	getRoot,
	isPlainIndex,
} from './register-root';
import {RemotionRoot} from './RemotionRoot';
import {SequenceContext} from './sequencing';
import {
	ENV_VARIABLES_ENV_NAME,
	ENV_VARIABLES_LOCAL_STORAGE_KEY,
	setupEnvVariables,
} from './setup-env-variables';
import * as TimelineInOutPosition from './timeline-inout-position-state';
import {
	SetTimelineInOutContextValue,
	TimelineInOutContextValue,
} from './timeline-inout-position-state';
import * as TimelinePosition from './timeline-position-state';
import {
	SetTimelineContextValue,
	TimelineContextValue,
} from './timeline-position-state';
import {truthy} from './truthy';
import {useLazyComponent} from './use-lazy-component';
import {useUnsafeVideoConfig} from './use-unsafe-video-config';
import {useVideo} from './use-video';
import {
	invalidCompositionErrorMessage,
	isCompositionIdValid,
} from './validation/validate-composition-id';
import {validateDimension} from './validation/validate-dimensions';
import {validateDurationInFrames} from './validation/validate-duration-in-frames';
import {validateFps} from './validation/validate-fps';
import {validateFrame} from './validation/validate-frame';
import {validateNonNullImageFormat} from './validation/validate-image-format';
import {validateQuality} from './validation/validate-quality';
import {
	MediaVolumeContext,
	MediaVolumeContextValue,
	SetMediaVolumeContext,
	SetMediaVolumeContextValue,
	useMediaMutedState,
	useMediaVolumeState,
} from './volume-position-state';
import {
	RemotionContextProvider,
	useRemotionContexts,
} from './wrap-remotion-context';
import * as AssetCompression from './compress-assets';
import {
	DEFAULT_PUPPETEER_TIMEOUT,
	PUPPETEER_TIMEOUT_KEY,
	setupPuppeteerTimeout,
} from './timeout';
import {
	getCurrentPuppeteerTimeout,
	setPuppeteerTimeout,
} from './config/timeout';
import {
	DEFAULT_OPENGL_RENDERER,
	getChromiumDisableWebSecurity,
	getChromiumHeadlessMode,
	getChromiumOpenGlRenderer,
	getIgnoreCertificateErrors,
} from './config/chromium-flags';
import {validateOpenGlRenderer} from './validation/validate-opengl-renderer';
import {OpenGlRenderer} from './validation/validate-opengl-renderer';
import {getPreviewDomElement} from './get-preview-dom-element';
const Timeline = {...TimelinePosition, ...TimelineInOutPosition};

// Mark them as Internals so use don't assume this is public
// API and are less likely to use it
export const Internals = {
	perf,
	useUnsafeVideoConfig,
	Timeline,
	CompositionManager,
	RemotionRoot,
	useVideo,
	getRoot,
	getBrowserExecutable,
	getCustomFfmpegExecutable,
	getCompositionName,
	getIsEvaluation,
	getPixelFormat,
	getConcurrency,
	getRange,
	getShouldOverwrite,
	getOutputCodecOrUndefined,
	getWebpackOverrideFn,
	getQuality,
	getScale,
	getShouldOutputImageSequence,
	validateSelectedCrfAndCodecCombination,
	getFinalOutputCodec,
	useMediaVolumeState,
	useMediaMutedState,
	DEFAULT_CODEC,
	DEFAULT_PIXEL_FORMAT,
	FEATURE_FLAG_FIREFOX_SUPPORT,
	DEFAULT_WEBPACK_CACHE_ENABLED,
	getBrowser,
	DEFAULT_BROWSER,
	getDefaultCrfForCodec,
	getActualCrf,
	setFrameRangeFromCli,
	getUserPreferredImageFormat,
	validateSelectedPixelFormatAndImageFormatCombination,
	validateSelectedPixelFormatAndCodecCombination,
	validateFrameRange,
	validateNonNullImageFormat,
	getWebpackCaching,
	useLazyComponent,
	truthy,
	isAudioCodec,
	INPUT_PROPS_KEY,
	Logging,
	SequenceContext,
	useRemotionContexts,
	RemotionContextProvider,
	isPlainIndex,
	CSSUtils,
	setupEnvVariables,
	setupInitialFrame,
	ENV_VARIABLES_ENV_NAME,
	ENV_VARIABLES_LOCAL_STORAGE_KEY,
	INITIAL_FRAME_LOCAL_STORAGE_KEY,
	getDotEnvLocation,
	getServerPort,
	MediaVolumeContext,
	SetMediaVolumeContext,
	validateDurationInFrames,
	validateFps,
	validateDimension,
	getRemotionEnvironment,
	getProResProfile,
	setProResProfile,
	validateSelectedCodecAndProResCombination,
	getMaxTimelineTracks,
	SharedAudioContext,
	SharedAudioContextProvider,
	validateQuality,
	validateFrame,
	setStillFrame,
	getStillFrame,
	invalidCompositionErrorMessage,
	isCompositionIdValid,
	AssetCompression,
	DEFAULT_PUPPETEER_TIMEOUT,
	PUPPETEER_TIMEOUT_KEY,
	setupPuppeteerTimeout,
	setPuppeteerTimeout,
	getCurrentPuppeteerTimeout,
	getChromiumDisableWebSecurity,
	getIgnoreCertificateErrors,
	validateOpenGlRenderer,
	getChromiumOpenGlRenderer,
	getChromiumHeadlessMode,
	DEFAULT_OPENGL_RENDERER,
	getPreviewDomElement,
};

export type {
	TComposition,
	Timeline,
	TCompMetadata,
	TSequence,
	WebpackOverrideFn,
	TAsset,
	RenderAssetInfo,
	TimelineContextValue,
	SetTimelineContextValue,
	TimelineInOutContextValue,
	SetTimelineInOutContextValue,
	CompProps,
	CompositionManagerContext,
	MediaVolumeContextValue,
	SetMediaVolumeContextValue,
	LooseAnyComponent,
	RemotionEnvironment,
	ProResProfile,
	OpenGlRenderer,
};
