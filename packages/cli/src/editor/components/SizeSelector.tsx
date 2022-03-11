import {PreviewSize} from '@remotion/player';
import React, {useContext, useMemo} from 'react';
import {Checkmark} from '../icons/Checkmark';
import {PreviewSizeContext} from '../state/preview-size';
import {CONTROL_BUTTON_PADDING} from './ControlButton';
import {Combobox, ComboboxValue} from './NewComposition/ComboBox';

export const commonPreviewSizes: PreviewSize[] = ['auto', 0.25, 0.5, 1];

export const getPreviewSizeLabel = (previewSize: PreviewSize) => {
	if (previewSize === 1) {
		return '100%';
	}

	if (previewSize === 0.5) {
		return '50%';
	}

	if (previewSize === 0.25) {
		return '25%';
	}

	if (previewSize === 'auto') {
		return 'Fit';
	}
};

const accessibilityLabel = 'Preview Size';

const comboStyle: React.CSSProperties = {width: 80};

export const SizeSelector: React.FC = () => {
	const {size, setSize} = useContext(PreviewSizeContext);

	const style = useMemo(() => {
		return {
			padding: CONTROL_BUTTON_PADDING,
		};
	}, []);

	const items: ComboboxValue[] = useMemo(() => {
		return commonPreviewSizes.map((newSize): ComboboxValue => {
			return {
				id: String(newSize),
				label: getPreviewSizeLabel(newSize),
				onClick: () => {
					return setSize(() => {
						return newSize;
					});
				},
				type: 'item',
				value: newSize,
				keyHint: null,
				leftItem: String(size) === String(newSize) ? <Checkmark /> : null,
				subMenu: null,
			};
		});
	}, [setSize, size]);

	return (
		<div style={style} aria-label={accessibilityLabel}>
			<Combobox
				title={accessibilityLabel}
				style={comboStyle}
				selectedId={String(size)}
				values={items}
			/>
		</div>
	);
};
