import {
	OpenGlRenderer,
	validateOpenGlRenderer,
} from '../validation/validate-opengl-renderer';

export const DEFAULT_OPENGL_RENDERER: OpenGlRenderer = 'angle';

let chromiumDisableWebSecurity = false;
let ignoreCertificateErrors = false;
let openGlRenderer: OpenGlRenderer = DEFAULT_OPENGL_RENDERER;
let headlessMode = true;

export const getChromiumDisableWebSecurity = () => chromiumDisableWebSecurity;
export const setChromiumDisableWebSecurity = (should: boolean) => {
	chromiumDisableWebSecurity = should;
};

export const getIgnoreCertificateErrors = () => ignoreCertificateErrors;
export const setChromiumIgnoreCertificateErrors = (should: boolean) => {
	ignoreCertificateErrors = should;
};

export const getChromiumOpenGlRenderer = () => openGlRenderer;
export const setChromiumOpenGlRenderer = (renderer: OpenGlRenderer) => {
	validateOpenGlRenderer(renderer);
	openGlRenderer = renderer;
};

export const getChromiumHeadlessMode = () => headlessMode;
export const setChromiumHeadlessMode = (should: boolean) => {
	headlessMode = should;
};
