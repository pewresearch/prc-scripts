/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import { useState, RawHTML, useEffect, useRef } from '@wordpress/element';
import classNames from 'classnames';
import Search from './components/Search';
import Multiple from './components/Multiple';
import MultipleSearch from './components/MultipleSearch';

export default function Dropdown({
	className,
	id,
	options,
	onChange,
	search,
	multiple,
	multipleSearch,
	placeholder,
	inline,
	animated,
}) {
	const [visible, setVisible] = useState(false);
	const [selected, setSelected] = useState('');
	const [focusIndex, setFocusIndex] = useState(0);

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

	// // Run this on dropdown initial click....
	// function checkId(elm) {
	// 	const id = elm.getAttribute('id');
	// 	const { active } = dropDownBlockArgs;
	// 	if (false !== id && active !== id) {
	// 		// do close function against window.prcBlocks.dropDownBlockArgs.active id
	// 		console.log('CLOSING OTHER DROPDOWNS');
	// 	}
	// }

	if (multipleSearch) {
		return (
			<MultipleSearch
				className={className}
				id={id}
				options={options}
				onChange={onChange}
				placeholder={placeholder}
				inline={inline}
				animated={animated}
			/>
		);
	}
	if (search) {
		return (
			<Search
				className={className}
				id={id}
				options={options}
				onChange={onChange}
				placeholder={placeholder}
				inline={inline}
				animated={animated}
			/>
		);
	}
	if (multiple) {
		return (
			<Multiple
				className={className}
				id={id}
				options={options}
				onChange={onChange}
				placeholder={placeholder}
				inline={inline}
				animated={animated}
			/>
		);
	}

	// console.log(formRef.current);

	return (
		<form
			id={id}
			className={classNames('wp-block-prc-block-form-input-dropdown', {
				'wp-block-prc-block-form-input-dropdown--active': visible,
				'wp-block-prc-block-form-input-dropdown--inline': inline,
				'wp-block-prc-block-form-input-dropdown--animated': animated,
			})}
			onKeyDown={handleKeyDown}
		>
			<div
				className="selection"
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
				tabIndex={0}
			>
				<div className="selection__text">
					<RawHTML>{selected || options[0].content}</RawHTML>
				</div>
				<i className="selection__icon" />
			</div>

			<ul className={animated ? 'selection-list--animated' : 'selection-list'}>
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
		</form>
	);
}
