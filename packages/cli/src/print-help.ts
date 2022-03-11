import chalk from 'chalk';
import {Log} from './log';
import {VERSIONS_COMMAND} from './versions';

const packagejson = require('../package.json');

const printFlags = (flags: [string, string][]) => {
	flags.forEach(([flag, description]) => {
		Log.info(chalk.blue(`${flag.padEnd(22, ' ')} ${description}`));
	});
};

export const printHelp = () => {
	Log.info(
		`@remotion/cli ${
			packagejson.version
		} © ${new Date().getFullYear()} Jonny Burger`
	);
	Log.info();
	Log.info('Available commands:');
	Log.info('');
	Log.info('remotion preview <index-file.ts>');
	Log.info(chalk.gray('Start the preview server.'));
	printFlags([['--props', 'Pass input props as filename or as JSON']]);
	Log.info();
	Log.info('remotion render <index-file.ts> <comp-name> <output-file.mp4>');
	Log.info(chalk.gray('Render video, audio or an image sequence.'));
	printFlags([
		['--props', 'Pass input props as filename or as JSON'],
		['--concurrency', 'How many frames to render in parallel'],
		['--image-format', 'Format to render the frames in, "jpeg" or "png"'],
		['--pixel-format', 'Custom pixel format, see docs for available values'],
		['--config', 'Custom location for a Remotion config file'],
		['--quality', 'Quality for rendered frames, JPEG only, 0-100'],
		['--overwrite', 'Overwrite if file exists, default true'],
		['--sequence', 'Output as an image sequence'],
		['--codec', 'Video of audio codec'],
		['--crf', 'FFMPEG CRF value, controls quality, see docs for info'],
		['--browser-executable', 'Custom path for browser executable'],
		['--frames', 'Render a portion or a still of a video'],
		['--bundle-cache', 'Cache webpack bundle, boolean, default true'],
		['--log', 'Log level, "error", "warning", "verbose", "info" (default)'],
		['--port', 'Custom port to use for the HTTP server'],
		['--env-file', 'Specify a location for a dotenv file'],
	]);
	Log.info();
	Log.info('remotion still <index-file.ts> <comp-name> <still.png>');
	Log.info(chalk.gray('Render a still frame and save it as an image.'));
	printFlags([
		['--frame', 'Which frame to render (default 0)'],
		['--image-format', 'Format to render the frames in, "jpeg" or "png"'],
		['--props', 'Pass input props as filename or as JSON'],
		['--config', 'Custom location for a Remotion config file'],
		['--quality', 'Quality for rendered frames, JPEG only, 0-100'],
		['--overwrite', 'Overwrite if file exists, default true'],
		['--browser-executable', 'Custom path for browser executable'],
		['--bundle-cache', 'Cache webpack bundle, boolean, default true'],
		['--log', 'Log level, "error", "warning", "verbose", "info" (default)'],
		['--port', 'Custom port to use for the HTTP server'],
		['--env-file', 'Specify a location for a dotenv file'],
	]);
	Log.info();
	Log.info('remotion ' + VERSIONS_COMMAND);
	Log.info(
		chalk.gray('Prints and validates versions of all Remotion packages.')
	);
	Log.info();
	Log.info('remotion upgrade');
	Log.info(chalk.gray('Ensure Remotion is on the newest version.'));
	Log.info();
	Log.info(
		'Visit https://www.remotion.dev/docs/cli for browsable CLI documentation.'
	);
};
