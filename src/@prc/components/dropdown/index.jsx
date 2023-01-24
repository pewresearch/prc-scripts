/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import { useState, RawHTML, useEffect, useRef } from '@wordpress/element';
import Search from './components/Search';
import Multiple from './components/Multiple';
import MultipleSearch from './components/MultipleSearch';

export default function Dropdown({
	className,
	options,
	onChange,
	search,
	multiple,
	multipleSearch,
	placeholder,
	inline,
	checkId,
}) {
	const [visible, setVisible] = useState(false);
	const [selected, setSelected] = useState('');
	const [focusIndex, setFocusIndex] = useState(0);
	const [initialClicked, setInitialClicked] = useState(false);

	const formRef = useRef(null);

	const handleKeyDown = (e) => {
		// If the selection list is visible, navigate to the first item in the list on keydown,
		// then loop through the list with up and down arrows. focusIndex is then used in the
		// render to set a selected class on the appropriate list item.
		e.preventDefault();
		if (visible && 'ArrowDown' === e.key && options.length - 1 > focusIndex) {
			console.log('DOWN');
			setFocusIndex(focusIndex + 1);
		}
		if (visible && 'ArrowUp' === e.key && 0 < focusIndex) {
			console.log('UP');
			setFocusIndex(focusIndex - 1);
		}
		if (visible && 'Enter' === e.key) {
			setSelected(options[focusIndex].content);
			setDropdownVisible(false);
		}
		if (visible && 'Escape' === e.key) {
			setDropdownVisible(false);
		}
	};

	// Update the Ref to the current state. This allows for the correct state to be
	// accessed in the event listener for clicks outside the component.
	const visibleStateRef = useRef(visible);

	const setDropdownVisible = (data) => {
		visibleStateRef.current = data;
		setVisible(data);
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

	if (multipleSearch) {
		return (
			<MultipleSearch
				className={className}
				options={options}
				onChange={onChange}
				placeholder={placeholder}
				inline={inline}
			/>
		);
	}
	if (search) {
		return (
			<Search
				className={className}
				options={options}
				onChange={onChange}
				placeholder={placeholder}
				inline={inline}
			/>
		);
	}
	if (multiple) {
		return (
			<Multiple
				className={className}
				options={options}
				onChange={onChange}
				placeholder={placeholder}
				inline={inline}
			/>
		);
	}

	// console.log(formRef.current);

	return (
		<form
			className={inline ? `${className}--inline` : className}
			onKeyDown={handleKeyDown}
			id={
				visible
					? 'wp-block-prc-block-form-input-dropdown--active'
					: 'wp-block-prc-block-form-input-dropdown'
			}
			ref={formRef}
		>
			<div
				className="selection"
				onClick={() => setDropdownVisible(!visible)}
				// onClick={() => {
				// 	setDropdownVisible(!visible);
				// 	console.log(formRef.current.getAttribute('id'));
				// 	if (!initialClicked) {
				// 		// checkId(formRef.current);
				// 		setInitialClicked(true);
				// 	}
				// }}
				tabIndex={0}
			>
				<div className="selection__text">
					<RawHTML>{selected || options[0].content}</RawHTML>
				</div>
				<i className="selection__icon" />
			</div>
			{visible && (
				<ul className="selection-list">
					{options.map((option, i) => (
						<li
							className={
								focusIndex === i
									? `${option.className} selection-list__item--selected`
									: `${option.className} selection-list__item`
							}
							value={option.value}
							style={option.style}
							onClick={() => {
								setSelected(option.content);
								setDropdownVisible(false);
								onChange(option.value);

								// if option.value is a link, navigate to the link
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
