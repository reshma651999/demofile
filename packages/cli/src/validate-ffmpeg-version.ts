import {RenderInternals} from '@remotion/renderer';
import {Log} from './log';
import {warnAboutFfmpegVersion} from './warn-about-ffmpeg-version';

export const checkAndValidateFfmpegVersion = async (options: {
	ffmpegExecutable: string | null;
}) => {
	const ffmpegVersion = await RenderInternals.getFfmpegVersion({
		ffmpegExecutable: options.ffmpegExecutable,
	});
	const buildConf = await RenderInternals.getFfmpegBuildInfo({
		ffmpegExecutable: options.ffmpegExecutable,
	});
	Log.verbose(
		'Your FFMPEG version:',
		ffmpegVersion ? ffmpegVersion.join('.') : 'Built from source'
	);
	warnAboutFfmpegVersion({ffmpegVersion, buildConf});
};
