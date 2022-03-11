import path from 'path';
import {Log} from './log';
import {
	getDisplayNameForEditor,
	guessEditor,
	isTerminalEditor,
	isVsCodeDerivative,
	launchEditor,
} from './open-in-editor';
import {yesOrNo} from './yesno';

export const openInEditorFlow = async (projectRoot: string) => {
	const editors = await guessEditor();
	const [guiEditor] = editors.filter((e) => !isTerminalEditor(e));

	if (!guiEditor) {
		return;
	}

	const displayName = getDisplayNameForEditor(guiEditor);

	const should = await yesOrNo({
		defaultValue: true,
		question: `💻 Do you want to open the project in ${displayName}? (Y/n):`,
	});

	if (should) {
		await launchEditor({
			colNumber: 1,
			editor: guiEditor,
			fileName: projectRoot,
			vsCodeNewWindow: true,
			lineNumber: 1,
		});
		if (isVsCodeDerivative(guiEditor)) {
			await new Promise((resolve) => {
				setTimeout(resolve, 1000);
			});
			await launchEditor({
				colNumber: 1,
				editor: guiEditor,
				fileName: path.join(projectRoot, 'README.md'),
				vsCodeNewWindow: false,
				lineNumber: 1,
			});
		}

		Log.info(`Opened in ${displayName}.`);
	}

	Log.info();
};
