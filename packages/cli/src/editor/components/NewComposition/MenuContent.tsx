import React, {useCallback, useEffect, useRef, useState} from 'react';
import {INPUT_BORDER_COLOR_UNHOVERED} from '../../helpers/colors';
import {useKeybinding} from '../../helpers/use-keybinding';
import {MenuDivider} from '../Menu/MenuDivider';
import {MenuSubItem, SubMenuActivated} from '../Menu/MenuSubItem';
import {MENU_VERTICAL_PADDING} from '../Menu/styles';
import {ComboboxValue} from './ComboBox';

const BORDER_SIZE = 1;
const container: React.CSSProperties = {
	paddingTop: MENU_VERTICAL_PADDING,
	paddingBottom: MENU_VERTICAL_PADDING,
	border: `${BORDER_SIZE}px solid ${INPUT_BORDER_COLOR_UNHOVERED}`,
	marginLeft: 0 - BORDER_SIZE,
};

export const MenuContent: React.FC<{
	values: ComboboxValue[];
	onHide: () => void;
	onNextMenu: () => void;
	onPreviousMenu: () => void;
	leaveLeftSpace: boolean;
	preselectIndex: false | number;
	topItemCanBeUnselected: boolean;
}> = ({
	onHide,
	values,
	preselectIndex,
	onNextMenu,
	onPreviousMenu,
	leaveLeftSpace,
	topItemCanBeUnselected,
}) => {
	const keybindings = useKeybinding();
	const containerRef = useRef<HTMLDivElement>(null);

	const [subMenuActivated, setSubMenuActivated] = useState<SubMenuActivated>(
		false
	);

	if (values[0].type === 'divider') {
		throw new Error('first value cant be divide');
	}

	const [selectedItem, setSelectedItem] = useState<string | null>(
		typeof preselectIndex === 'number' ? values[preselectIndex].id : null
	);

	const onEscape = useCallback(() => {
		onHide();
	}, [onHide]);

	const onItemSelected = useCallback((id: string) => {
		setSelectedItem(id);
	}, []);

	const onArrowUp = useCallback(() => {
		setSelectedItem((prevItem) => {
			if (prevItem === null) {
				return null;
			}

			const index = values.findIndex((val) => val.id === prevItem);
			if ((topItemCanBeUnselected && index === 0) || prevItem === null) {
				return null;
			}

			const previousItems = values.filter(
				(v, i) => i < index && v.type !== 'divider'
			);
			if (previousItems.length > 0) {
				return previousItems[previousItems.length - 1].id;
			}

			const firstNonDivider = values.find((v) => v.type !== 'divider');
			if (firstNonDivider) {
				return firstNonDivider.id;
			}

			throw new Error('could not find previous item');
		});
	}, [topItemCanBeUnselected, values]);

	const onArrowDown = useCallback(() => {
		setSelectedItem((prevItem) => {
			const index = values.findIndex((val) => val.id === prevItem);
			const nextItem = values.find((v, i) => i > index && v.type !== 'divider');
			if (nextItem) {
				return nextItem.id;
			}

			const lastNonDivider = values
				.slice()
				.reverse()
				.find((v) => v.type !== 'divider');

			if (lastNonDivider) {
				return lastNonDivider.id;
			}

			throw new Error('could not find next item');
		});
	}, [values]);

	const onEnter = useCallback(() => {
		if (selectedItem === null) {
			return onHide();
		}

		const item = values.find((i) => i.id === selectedItem);
		if (!item) {
			throw new Error('cannot find item');
		}

		if (item.type === 'divider') {
			throw new Error('cannot find divider');
		}

		if (item.subMenu) {
			return setSubMenuActivated('without-mouse');
		}

		item.onClick(item.id);
	}, [onHide, selectedItem, values]);

	const onArrowRight = useCallback(() => {
		if (selectedItem === null) {
			return onNextMenu();
		}

		const item = values.find((i) => i.id === selectedItem);
		if (!item) {
			throw new Error('cannot find item');
		}

		if (item.type === 'divider') {
			throw new Error('cannot find divider');
		}

		if (!item.subMenu) {
			return onNextMenu();
		}

		setSubMenuActivated('without-mouse');
	}, [onNextMenu, selectedItem, values]);

	useEffect(() => {
		const escapeBinding = keybindings.registerKeybinding(
			'keydown',
			'Escape',
			onEscape
		);
		const rightBinding = keybindings.registerKeybinding(
			'keydown',
			'ArrowRight',
			onArrowRight
		);
		const leftBinding = keybindings.registerKeybinding(
			'keydown',
			'ArrowLeft',
			onPreviousMenu
		);
		const downBinding = keybindings.registerKeybinding(
			'keydown',
			'ArrowDown',
			onArrowDown
		);
		const upBinding = keybindings.registerKeybinding(
			'keydown',
			'ArrowUp',
			onArrowUp
		);
		const enterBinding = keybindings.registerKeybinding(
			'keydown',
			'Enter',
			onEnter
		);
		const spaceBinding = keybindings.registerKeybinding('keyup', ' ', onEnter);
		return () => {
			escapeBinding.unregister();
			leftBinding.unregister();
			rightBinding.unregister();
			downBinding.unregister();
			upBinding.unregister();
			enterBinding.unregister();
			spaceBinding.unregister();
		};
	}, [
		keybindings,
		onEscape,
		onNextMenu,
		onPreviousMenu,
		onArrowDown,
		onArrowUp,
		onEnter,
		onArrowRight,
	]);

	// Disable submenu if not selected
	useEffect(() => {
		if (!subMenuActivated) {
			return;
		}

		if (selectedItem === null) {
			return setSubMenuActivated(false);
		}

		const item = values.find((i) => i.id === selectedItem);
		if (!item) {
			throw new Error('cannot find item');
		}

		if (item.type === 'divider') {
			throw new Error('should not select divider');
		}

		if (!item.subMenu && subMenuActivated) {
			setSubMenuActivated(false);
		}
	}, [selectedItem, subMenuActivated, values]);

	useEffect(() => {
		const {current} = containerRef;
		if (!current) {
			return;
		}

		const onPointerLeave = () => {
			if (subMenuActivated) {
				return;
			}

			setSelectedItem(null);
		};

		current.addEventListener('pointerleave', onPointerLeave);
		return () => current.removeEventListener('pointerleave', onPointerLeave);
	}, [onHide, subMenuActivated]);

	return (
		<div ref={containerRef} style={container}>
			{values.map((item) => {
				if (item.type === 'divider') {
					return <MenuDivider key={item.id} />;
				}

				const onClick = () => {
					onHide();
					item.onClick(item.id);
				};

				return (
					<MenuSubItem
						key={item.id}
						selected={item.id === selectedItem}
						onActionChosen={onClick}
						onItemSelected={onItemSelected}
						label={item.label}
						id={item.id}
						keyHint={item.keyHint}
						leaveLeftSpace={leaveLeftSpace}
						leftItem={item.leftItem}
						subMenu={item.subMenu}
						onQuitMenu={onHide}
						onNextMenu={onNextMenu}
						subMenuActivated={subMenuActivated}
						setSubMenuActivated={setSubMenuActivated}
					/>
				);
			})}
		</div>
	);
};
