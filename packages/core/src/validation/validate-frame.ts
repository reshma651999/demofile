export const validateFrame = (frame: number, durationInFrames: number) => {
	if (typeof frame === 'undefined') {
		throw new TypeError(`Argument missing for parameter "frame"`);
	}

	if (typeof frame !== 'number') {
		throw new TypeError(
			`Argument passed for "frame" is not a number: ${frame}`
		);
	}

	if (frame < 0) {
		throw new RangeError(`Frame ${frame} cannot be negative`);
	}

	if (!Number.isFinite(frame)) {
		throw new RangeError(`Frame ${frame} is not finite`);
	}

	if (frame % 1 !== 0) {
		throw new RangeError(
			`Argument for frame must be an integer, but got ${frame}`
		);
	}

	if (frame > durationInFrames - 1) {
		throw new RangeError(
			`Cannot use frame ${frame}: Duration of composition is ${durationInFrames}, therefore the highest frame that can be rendered is ${
				durationInFrames - 1
			}`
		);
	}
};
