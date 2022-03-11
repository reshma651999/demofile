import {DevMiddlewareContext} from './types';

import memfs from 'memfs';

export function setupOutputFileSystem(context: DevMiddlewareContext) {
	const outputFileSystem = memfs.createFsFromVolume(new memfs.Volume());

	context.compiler.outputFileSystem = outputFileSystem;

	context.outputFileSystem = outputFileSystem;
}
