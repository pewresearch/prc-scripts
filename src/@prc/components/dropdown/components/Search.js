/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import { useState, RawHTML, useEffect, useRef } from '@wordpress/element';
import classNames from 'classnames';

export default function Search({
	className,
	id,
	options,
	onChange,
	placeholder,
	inline,
	animated,
}) {
	const [visible, setVisible] = useState(false);
	const [searchInput, setSearchInput] = useState('');
	const [selected, setSelected] = useState('');
	const [focusIndex, setFocusIndex] = useState(0);

	const searchFilter = (input, list) => {
		const filteredList = list.filter((item) =>
			item.content.toLowerCase().includes(input.toLowerCase()),
		);
		return filteredList;
	};
	const handleInputChange = (e) => {
		setSelected('');
		setSearchInput(e.target.value);
		// Focus index back to zero here?
		setFocusIndex(0);
	};

	const handleKeyDown = (e) => {
		// If the selection list is visible, navigate to the first item in the list on keydown,
		// then loop through the list with up and down arrows. focusIndex is then used in the
		// render to set a selected class on the appropriate list item.

		if (
			visible &&
			'ArrowDown' === e.key &&
			searchFilter(searchInput, options).length - 1 > focusIndex
		) {
			console.log('DOWN');
			setFocusIndex(focusIndex + 1);
		}
		if (visible && 'ArrowUp' === e.key && 0 < focusIndex) {
			console.log('UP');
			setFocusIndex(focusIndex - 1);
		}
		if (visible && 'Escape' === e.key) {
			setDropdownVisible(false);
		}
		if (visible && 'Enter' === e.key) {
			e.preventDefault();
			setSearchInput('');
			setSelected(searchFilter(searchInput, options)[focusIndex].content);
			setDropdownVisible(false);
			onChange(searchFilter(searchInput, options)[focusIndex].value);
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
			id={id}
			className={classNames('wp-block-prc-block-form-input-dropdown', {
				'wp-block-prc-block-form-input-dropdown--active': visible,
				'wp-block-prc-block-form-input-dropdown--inline': inline,
				'wp-block-prc-block-form-input-dropdown--animated': animated,
			})}
		>
			<div className="search-selection">
				<div
					className={
						!visible && selected
							? 'search-selection__text'
							: 'search-selection__text--light'
					}
				>
					<RawHTML>
						{!selected && !searchInput ? placeholder : selected}
					</RawHTML>
				</div>
				<i
					className="search-selection__icon"
					// onClick={() => setDropdownVisible(!visible)}
					onClick={() => {
						const currentlyActive = document.querySelector(
							'.wp-block-prc-block-form-input-dropdown.wp-block-prc-block-form-input-dropdown--active',
						);
						if (currentlyActive) {
							currentlyActive.classList.toggle(
								'wp-block-prc-block-form-input-dropdown--active',
							);
						}

						setDropdownVisible(!visible);
					}}
				/>
				<input
					onChange={handleInputChange}
					onKeyDown={handleKeyDown}
					className="search-selection__input"
					value={searchInput}
					// onClick={() => setDropdownVisible(true)}
					onClick={() => {
						const currentlyActive = document.querySelector(
							'.wp-block-prc-block-form-input-dropdown.wp-block-prc-block-form-input-dropdown--active',
						);
						// if currently active is THIS form, don't toggle
						if (currentlyActive) {
							currentlyActive.classList.toggle(
								'wp-block-prc-block-form-input-dropdown--active',
							);
						}

						setDropdownVisible(!visible);
					}}
				/>
			</div>

			<ul className={animated ? 'selection-list--animated' : 'selection-list'}>
				{searchFilter(searchInput, options).length > 0 ? (
					searchFilter(searchInput, options).map((option, i) => (
						<li
							className={
								focusIndex === i
									? `${option.className} selection-list__item--selected`
									: `${option.className} selection-list__item`
							}
							style={option.style}
							onClick={() => {
								setSearchInput('');
								setSelected(option.content);
								setDropdownVisible(false);
								onChange(option.value);
							}}
						>
							<RawHTML>{option.content}</RawHTML>
						</li>
					))
				) : (
					<li className="selection-list__item--no-results">No results found</li>
				)}
			</ul>
		</form>
	);
}
