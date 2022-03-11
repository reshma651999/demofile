import chalk from 'chalk';
import degit from 'degit';
import execa from 'execa';
import fs from 'fs-extra';
import path from 'path';
import stripAnsi from 'strip-ansi';
import {Log} from './log';
import {openInEditorFlow} from './open-in-editor-flow';
import {
	getRenderCommand,
	getStartCommand,
	selectPackageManager,
} from './pkg-managers';
import prompts, {selectAsync} from './prompts';

type TEMPLATES = {
	shortName: string;
	name: string;
	description: string;
};

const FEATURED_TEMPLATES: TEMPLATES[] = [
	{
		shortName: 'Hello World',
		name: 'remotion-dev/template-helloworld',
		description: 'The default starter template (recommended)',
	},
	{
		shortName: 'Blank',
		name: 'remotion-dev/template-empty',
		description: 'Nothing except an empty canvas',
	},
	{
		shortName: 'Hello World (Javascript)',
		name: 'remotion-dev/template-helloworld-javascript',
		description: 'The default starter template in plain JS',
	},
	{
		shortName: 'React Three Fiber',
		name: 'remotion-dev/template-three',
		description: 'Remotion + React Three Fiber Starter Template',
	},
	{
		shortName: 'Still images',
		name: 'remotion-dev/template-still',
		description: 'Dynamic PNG/JPEG template with built-in server',
	},
	{
		shortName: 'Text To Speech',
		name: 'FelippeChemello/Remotion-TTS-Example',
		description: 'Turns text into speech and makes a video',
	},
	{
		shortName: 'Audiogram',
		name: 'marcusstenbeck/remotion-template-audiogram',
		description: 'Text and waveform visualization for podcasts',
	},
];

function padEnd(str: string, width: number): string {
	// Pulled from commander for overriding
	const len = Math.max(0, width - stripAnsi(str).length);
	return str + Array(len + 1).join(' ');
}

function validateName(name?: string): string | true {
	if (typeof name !== 'string' || name === '') {
		return 'The project name can not be empty.';
	}

	if (!/^[a-z0-9@.\-_]+$/i.test(name)) {
		return 'The project name can only contain URL-friendly characters (alphanumeric and @ . -  _)';
	}

	return true;
}

function assertValidName(folderName: string) {
	const validation = validateName(folderName);
	if (typeof validation === 'string') {
		throw new Error(
			`Cannot create an app named ${chalk.red(
				`"${folderName}"`
			)}. ${validation}`
		);
	}
}

function assertFolderEmptyAsync(projectRoot: string): {exists: boolean} {
	const conflicts = fs
		.readdirSync(projectRoot)
		.filter((file: string) => !/\.iml$/.test(file));

	if (conflicts.length > 0) {
		Log.newLine();
		Log.error(`Something already exists at "${projectRoot}"`);
		Log.error('Try using a new directory name, or moving these files.');
		Log.newLine();
		return {exists: true};
	}

	return {exists: false};
}

const isGitExecutableAvailable = async () => {
	try {
		await execa('git', ['--version']);
		return true;
	} catch (e) {
		if ((e as {errno: string}).errno === 'ENOENT') {
			Log.warn('Unable to find `git` command. `git` not in PATH.');
			return false;
		}
	}
};

const initGitRepoAsync = async (
	root: string,
	flags: {silent: boolean; commit: boolean} = {silent: false, commit: true}
) => {
	// let's see if we're in a git tree
	try {
		await execa('git', ['rev-parse', '--is-inside-work-tree'], {
			cwd: root,
		});
		if (!flags.silent) {
			Log.info(
				'New project is already inside of a git repo, skipping git init.'
			);
		}
	} catch (e) {
		if ((e as {errno: string}).errno === 'ENOENT') {
			if (!flags.silent) {
				Log.warn('Unable to initialize git repo. `git` not in PATH.');
			}

			return false;
		}
	}

	// not in git tree, so let's init
	try {
		await execa('git', ['init'], {cwd: root});
		if (!flags.silent) {
			Log.info('Initialized a git repository.');
		}

		if (flags.commit) {
			await execa('git', ['add', '--all'], {cwd: root, stdio: 'ignore'});
			await execa('git', ['commit', '-m', 'Create a new Remotion video'], {
				cwd: root,
				stdio: 'ignore',
			});
			await execa('git', ['branch', '-M', 'main'], {
				cwd: root,
				stdio: 'ignore',
			});
		}

		return true;
	} catch (e) {
		Log.verbose('git error:', e);
		// no-op -- this is just a convenience and we don't care if it fails
		return false;
	}
};

const resolveProjectRootAsync = async (): Promise<[string, string]> => {
	let projectName = '';
	try {
		const {answer} = await prompts({
			type: 'text',
			name: 'answer',
			message: 'What would you like to name your video?',
			initial: 'my-video',
			validate: (name) => {
				const validation = validateName(path.basename(path.resolve(name)));
				if (typeof validation === 'string') {
					return 'Invalid project name: ' + validation;
				}

				return true;
			},
		});

		if (typeof answer === 'string') {
			projectName = answer.trim();
		}
	} catch (error) {
		// Handle the aborted message in a custom way.
		if ((error as {code: string}).code !== 'ABORTED') {
			throw error;
		}
	}

	const projectRoot = path.resolve(projectName);
	const folderName = path.basename(projectRoot);

	assertValidName(folderName);

	await fs.ensureDir(projectRoot);

	if (assertFolderEmptyAsync(projectRoot).exists) {
		return resolveProjectRootAsync();
	}

	return [projectRoot, folderName];
};

export const init = async () => {
	const [projectRoot, folderName] = await resolveProjectRootAsync();
	await isGitExecutableAvailable();

	const descriptionColumn =
		Math.max(
			...FEATURED_TEMPLATES.map((t) =>
				typeof t === 'object' ? t.shortName.length : 0
			)
		) + 2;

	const selectedTemplate = await selectAsync(
		{
			message: 'Choose a template:',
			optionsPerPage: 20,
			choices: FEATURED_TEMPLATES.map((template) => {
				if (typeof template === 'string') {
					return prompts.separator(template);
				}

				return {
					value: template.name,
					title:
						chalk.bold(padEnd(template.shortName, descriptionColumn)) +
						template.description.trim(),
				};
			}),
		},
		{}
	);

	try {
		const emitter = degit(`https://github.com/${selectedTemplate}`);
		await emitter.clone(projectRoot);
	} catch (e) {
		Log.error(e);
		Log.error('Error with template cloning. Aborting');
		process.exit(1);
	}

	Log.info(
		`Created project at ${chalk.blueBright(
			folderName
		)}. Installing dependencies...`
	);

	const pkgManager = selectPackageManager();

	if (pkgManager === 'yarn') {
		Log.info('> yarn');
		const promise = execa('yarn', [], {
			cwd: projectRoot,
			stdio: 'inherit',
			env: {...process.env, ADBLOCK: '1', DISABLE_OPENCOLLECTIVE: '1'},
		});
		promise.stderr?.pipe(process.stderr);
		promise.stdout?.pipe(process.stdout);
		await promise;
	} else if (pkgManager === 'pnpm') {
		Log.info('> pnpm i');
		const promise = execa('pnpm', ['i'], {
			cwd: projectRoot,
			stdio: 'inherit',
			env: {...process.env, ADBLOCK: '1', DISABLE_OPENCOLLECTIVE: '1'},
		});
		promise.stderr?.pipe(process.stderr);
		promise.stdout?.pipe(process.stdout);
		await promise;
	} else {
		Log.info('> npm install');
		const promise = execa('npm', ['install', '--no-fund'], {
			stdio: 'inherit',
			cwd: projectRoot,
			env: {...process.env, ADBLOCK: '1', DISABLE_OPENCOLLECTIVE: '1'},
		});
		promise.stderr?.pipe(process.stderr);
		promise.stdout?.pipe(process.stdout);
		await promise;
	}

	await initGitRepoAsync(projectRoot, {
		silent: true,
		commit: true,
	});

	Log.info();
	Log.info(`Welcome to ${chalk.blueBright('Remotion')}!`);
	Log.info(
		`✨ Your video has been created at ${chalk.blueBright(folderName)}.`
	);
	await openInEditorFlow(projectRoot);

	Log.info('Get started by running');
	Log.info(chalk.blueBright(`cd ${folderName}`));
	Log.info(chalk.blueBright(getStartCommand(pkgManager)));
	Log.info('');
	Log.info('To render a video, run');
	Log.info(chalk.blueBright(getRenderCommand(pkgManager)));
	Log.info('');
	Log.info(
		'Docs to get you started:',
		chalk.underline('https://www.remotion.dev/docs/the-fundamentals')
	);
	Log.info('Enjoy Remotion!');
};
