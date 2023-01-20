/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import { useState, useRef, RawHTML } from '@wordpress/element';
import { useEffect } from 'react';

export default function MultipleSearch({
	className,
	options,
	onChange,
	placeholder,
	inline,
}) {
	// States
	const [visible, setVisible] = useState(false);
	const [searchInput, setSearchInput] = useState('');
	const [selected, setSelected] = useState([]);
	const [listItems, setListItems] = useState([...options]);
	const [focusIndex, setFocusIndex] = useState(0);

	// Input Ref
	const inputRef = useRef(null);

	// Methods
	const searchFilter = (input, list) => {
		const filteredList = list.filter((item) =>
			item.content.toLowerCase().includes(input.toLowerCase()),
		);
		return filteredList;
	};
	const handleInputChange = (e) => {
		setSearchInput(e.target.value);
	};

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
		// Keep the dropdown open
		setDropdownVisible(true);
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
		// Clear the search input
		setSearchInput('');
		// Focus the input
		inputRef.current.focus();
	};

	// Keyboard navigation, selection, closing, and deletion
	const handleKeyDown = (e) => {
		// If the selection list is visible, navigate to the first item in the list on keydown,
		// then loop through the list with up and down arrows. focusIndex is then used in the
		// render to set a selected class on the appropriate list item.
		if (visible && 'ArrowDown' === e.key && listItems.length - 1 > focusIndex) {
			setFocusIndex(focusIndex + 1);
		}
		if (visible && 'ArrowUp' === e.key && 0 < focusIndex) {
			setFocusIndex(focusIndex - 1);
		}
		if (visible && 'Enter' === e.key) {
			e.preventDefault();
			handleSelectItem(listItems[focusIndex]);
		}
		if (visible && 'Escape' === e.key) {
			setDropdownVisible(false);
		}
		if ('Backspace' === e.key && !searchInput) {
			handleRemoveItem(selected[selected.length - 1]);
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
					console.log('inside dropdown');
				}
			} catch (e) {
				console.log('outside dropdown');
				setDropdownVisible(false);
			}
		});
	}, []);

	return (
		<form className={inline ? `${className}--inline` : className}>
			<div className="multi-search-selection">
				<div
					className="multi-search-selection__text"
					onClick={() => {
						setDropdownVisible(true);
						inputRef.current.focus();
					}}
				>
					{selected.map((selectedOption) => (
						<div className="multi-search-selection__text__item">
							<RawHTML>{selectedOption.content}</RawHTML>
							<span
								className="dashicons dashicons-no"
								onClick={() => handleRemoveItem(selectedOption)}
							/>
						</div>
					))}
					<input
						ref={inputRef}
						className="multi-search-selection__input"
						onChange={handleInputChange}
						onKeyDown={handleKeyDown}
						// onKeyDown={(e) => handleKeyDown(e)}
						value={searchInput}
					/>
				</div>

				<i
					className="multi-selection__icon"
					onClick={() => {
						!visible ? inputRef.current.focus() : null;
						setDropdownVisible(!visible);
					}}
				/>
			</div>
			{visible && (
				<ul className="selection-list">
					{searchFilter(searchInput, listItems).map((option, i) => (
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
