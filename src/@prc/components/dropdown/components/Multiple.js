/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import { useState, RawHTML, useEffect, useRef } from '@wordpress/element';

export default function Multiple({ className, options, onChange, inline }) {
	const [visible, setVisible] = useState(false);
	const [selected, setSelected] = useState([]);
	const [listItems, setListItems] = useState([...options]);
	const [focusIndex, setFocusIndex] = useState(0);

	const selectionEl = useRef(null);

	// console.log('SELECTED ARRAY');
	// console.log(selected);

	// console.log('LIST ARRAY');
	// console.log(listItems);

	useEffect(() => {
		console.log(focusIndex);
	}, [focusIndex]);

	const handleRemoveItem = (item) => {
		// Remove the item from the selected array displayed in the input
		const newSelected = selected.filter(
			(selectedItem) => selectedItem.content !== item.content,
		);
		setSelected(newSelected);
		// Add the item back to the list of options, in the original order the editor set
		setListItems((listItems) =>
			[...listItems, item].sort((a, b) => a.index - b.index),
		);
	};

	// Find the max value of an attribute in an array of objects
	const isLargest = (arr, attr) => {
		const max = Math.max(...arr.map((o) => o.index));
		return attr === max;
	};

	const handleSelectItem = (item) => {
		// Add the item to the selected array displayed in the input
		setSelected((selectedArr) => [...selectedArr, item]);
		// Remove the item from the list of options
		setListItems(() =>
			listItems.filter((listItem) => listItem.content !== item.content),
		);
		// Fire the passed onChange function
		onChange(item.value);

		// Check if the item index is the largest one remaining in the list and if the focus
		// index is equal to the listItems lenght -1, if so, set the focus index to the
		// previous item in the list.

		if (
			isLargest(listItems, item.index) &&
			focusIndex === listItems.length - 1
		) {
			console.log('FOCUS RESET HAPPENED');
			setFocusIndex(listItems.length - 2);
		}

		// Return focus to the selection box
		selectionEl.current.focus();
	};

	// Scroll to the selected item in the dropdown
	const handleKeyDown = (e) => {
		// If the selection list is visible, navigate to the first item in the list on keydown,
		// then loop through the list with up and down arrows. focusIndex is then used in the
		// render to set a selected class on the appropriate list item.
		e.preventDefault();
		if (visible && 'ArrowDown' === e.key && listItems.length - 1 > focusIndex) {
			setFocusIndex(focusIndex + 1);
		}
		if (visible && 'ArrowUp' === e.key && 0 < focusIndex) {
			setFocusIndex(focusIndex - 1);
		}
		if (visible && 'Enter' === e.key) {
			handleSelectItem(listItems[focusIndex]);
		}
		if (visible && 'Escape' === e.key) {
			setDropdownVisible(false);
		}
	};

	// Scroll to the selected item in the dropdown
	useEffect(() => {
		const selectedElement = document.querySelector(
			'.selection-list__item--selected',
		);
		if (selectedElement) {
			selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
		}
	}, [focusIndex]);

	// Update the Ref to the current state. This allows for the correct state to be
	// accessed in the event listener for clicks outside the component.
	const visibleStateRef = useRef(visible);

	const setDropdownVisible = (data) => {
		visibleStateRef.current = data;
		setVisible(data);
	};

	// Watch for clicks outside the component to close the dropdown
	useEffect(() => {
		document.addEventListener('click', (event) => {
			// console.log('EVENT?', event.target);
			const dropdownWindow =
				event.target.closest('.wp-block-prc-block-form-input-dropdown') ||
				event.target.closest('.wp-block-prc-block-form-input-dropdown--inline');
			try {
				if (dropdownWindow.contains(event.target)) {
					// console.log('inside dropdown');
				}
			} catch (e) {
				// console.log('outside dropdown');
				setDropdownVisible(false);
			}
		});
	}, []);

	return (
		<form
			className={inline ? `${className}--inline` : className}
			onKeyDown={handleKeyDown}
		>
			<div
				className="multi-selection"
				tabIndex={0}
				ref={selectionEl}
				onClick={() => {
					setDropdownVisible(!visible);
				}}
			>
				<div
					className="multi-selection__text"
					// onClick={() => {
					// 	setDropdownVisible(true);
					// }}
				>
					{selected.map((selectedOption) => (
						<div
							className="multi-selection__text__item"
							onClick={(e) => e.stopPropagation()}
						>
							<RawHTML>{selectedOption.content}</RawHTML>
							<span
								className="dashicons dashicons-no"
								onClick={() => handleRemoveItem(selectedOption)}
							/>
						</div>
					))}
				</div>
				<i
					className="multi-selection__icon"
					onClick={() => {
						setDropdownVisible(!visible);
					}}
				/>
			</div>
			{visible && (
				<ul className="selection-list">
					{listItems.map((option, i) => (
						<li
							className={
								focusIndex === i
									? `${option.className} selection-list__item--selected`
									: `${option.className} selection-list__item`
							}
							value={option.value}
							style={option.style}
							index={option.index}
							onClick={() => {
								handleSelectItem(option);
							}}
						>
							<RawHTML>{option.content}</RawHTML>
						</li>
					))}
				</ul>
			)}
		</form>
	);
}
