import {SymbolicatedStackFrame} from './utils/stack-frame';

export type ErrorRecord = {
	error: Error;
	contextSize: number;
	stackFrames: SymbolicatedStackFrame[];
};

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
	register as registerError,
	unregister as unregisterError,
} from './effects/unhandled-error';
import {
	register as registerPromise,
	unregister as unregisterPromise,
} from './effects/unhandled-rejection';
import {
	register as registerStackTraceLimit,
	unregister as unregisterStackTraceLimit,
} from './effects/stack-trace-limit';
import {
	permanentRegister as permanentRegisterConsole,
	registerReactStack,
	unregisterReactStack,
} from './effects/proxy-console';
import {massageWarning} from './effects/format-warning';
import {getStackFrames} from './utils/get-stack-frames';
import {setErrorsRef} from '../remotion-overlay/Overlay';

const CONTEXT_SIZE = 3;

export const getErrorRecord = async (
	error: Error
): Promise<ErrorRecord | null> => {
	const stackFrames = await getStackFrames(error, CONTEXT_SIZE);

	if (stackFrames === null || stackFrames === undefined) {
		return null;
	}

	return {
		error,
		contextSize: CONTEXT_SIZE,
		stackFrames,
	};
};

const crashWithFrames = (crash: () => void) => async (error: Error) => {
	setErrorsRef.current?.addError(error);

	crash();
};

export function listenToRuntimeErrors(crash: () => void) {
	const crashWithFramesRunTime = crashWithFrames(crash);

	registerError(window, (error) => {
		return crashWithFramesRunTime({
			message: error.message,
			stack: error.stack,
			name: error.name,
		});
	});
	registerPromise(window, (error) => {
		return crashWithFramesRunTime(error);
	});
	registerStackTraceLimit();
	registerReactStack();
	permanentRegisterConsole('error', (d) => {
		if (d.type === 'webpack-error') {
			const {message, frames} = d;
			const data = massageWarning(message, frames);

			crashWithFramesRunTime({
				message: data.message,
				stack: data.stack,
				name: '',
			});
		}

		if (d.type === 'build-error') {
			crashWithFramesRunTime(d.error);
		}
	});

	return function () {
		unregisterStackTraceLimit();
		unregisterPromise(window);
		unregisterError(window);
		unregisterReactStack();
	};
}
