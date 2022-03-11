import {getShouldOverwrite, setOverwriteOutput} from '../config/overwrite';
import {expectToThrow} from './expect-to-throw';

const invalidOverwrite = 555;
let defaultOverwriteValue: boolean;

beforeAll(() => {
	defaultOverwriteValue = getShouldOverwrite();
});
afterEach(() => {
	setOverwriteOutput(defaultOverwriteValue);
});

test('setOverwriteOutput should throw if overwrite is not a boolean value', () => {
	expectToThrow(
		// @ts-expect-error
		() => setOverwriteOutput(invalidOverwrite),
		/overwriteExisting must be a boolean but got number [(]555[)]/
	);
});
test('setOverwriteOutput should NOT throw if image format is a boolean value', () => {
	expect(() => setOverwriteOutput(true)).not.toThrow();
});
test('getShouldOverwrite should return true by default', () => {
	expect(getShouldOverwrite()).toEqual(true);
});
test('setOverwriteOutput should return a boolean value', () => {
	setOverwriteOutput(false);
	expect(getShouldOverwrite()).toEqual(false);
});
