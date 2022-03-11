/*
	Source code adapted from https://github.com/facebook/create-react-app/tree/main/packages/react-error-overlay and refactored in Typescript. This file is MIT-licensed.
*/

/* eslint-disable eqeqeq */
/* eslint-disable no-eq-null */
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {Internals} from 'remotion';
import {getLinesAround} from './get-lines-around';
import {getSourceMap, SourceMap} from './get-source-map';
import {
	SomeStackFrame,
	StackFrame,
	SymbolicatedStackFrame,
} from './stack-frame';

const getFileContents = async (fileName: string) => {
	const res = await fetch(fileName as string);
	const fileContents = await res.text();

	return fileContents;
};

export const unmap = async (
	frames: SomeStackFrame[],
	contextLines: number
): Promise<SymbolicatedStackFrame[]> => {
	const transpiled = frames
		.filter((s) => s.type === 'transpiled')
		.map((s) => s.frame) as StackFrame[];
	const uniqueFileNames = [
		...new Set(transpiled.map((f) => f.fileName).filter(Internals.truthy)),
	];
	const maps = await Promise.all(
		uniqueFileNames.map(async (fileName) => {
			const fileContents = await getFileContents(fileName);
			return getSourceMap(fileName as string, fileContents as string);
		})
	);
	const mapValues: Record<string, SourceMap> = {};
	for (let i = 0; i < uniqueFileNames.length; i++) {
		mapValues[uniqueFileNames[i]] = maps[i];
	}

	return frames.map((frame): SymbolicatedStackFrame => {
		if (frame.type === 'symbolicated') {
			return frame.frame;
		}

		const map = mapValues[frame.frame.fileName as string];
		const pos = map.getOriginalPosition(
			frame.frame.lineNumber as number,
			frame.frame.columnNumber as number
		);

		const {functionName} = frame.frame;
		const hasSource = map.getSource(pos.source);
		const scriptCode = hasSource
			? getLinesAround(pos.line, contextLines, hasSource.split('\n'))
			: null;

		return {
			originalColumnNumber: pos.column,
			originalFileName: pos.source,
			originalFunctionName: functionName,
			originalLineNumber: pos.line,
			originalScriptCode: scriptCode,
		};
	});
};
