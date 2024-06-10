/* eslint-disable max-lines-per-function */
/**
 * External Dependencies
 */
import { List, arrayMove } from 'react-movable';
import styled from '@emotion/styled';
/**
 * Wordpress Dependencies
 */
import { useState, useRef, Fragment } from 'react';
import { __ } from '@wordpress/i18n';
import {
	Icon,
	__experimentalInputControl as InputControl,
	Button,
	CardDivider,
	PanelRow,
	DropZone,
} from '@wordpress/components';

import handleCSV from './csv-parser';

const PanelDescription = styled.div`
	grid-column: span 2;
`;
function Sorter({ options, setAttributes, attribute, onChange, clientId }) {
	const [items, setItems] = useState(options);
	const [inputValue, setInputValue] = useState('');
	const hiddenFileInput = useRef(null);

	return (
		<Fragment>
			<div>
				<List
					values={items}
					onChange={({ oldIndex, newIndex }) => {
						const newItems = arrayMove(items, oldIndex, newIndex);
						setItems(newItems);
						// check if onChange is a function
						if (typeof onChange === 'function') {
							onChange(newItems, oldIndex, newIndex);
						} else if (typeof setAttributes === 'function') {
							setAttributes({
								[attribute]: newItems
									.filter((i) => !i.disabled)
									.map((i) => ({
										label: i.label,
										value: i.value,
									})),
							});
						}
					}}
					renderList={({ children, props }) => (
						<ul {...props}>{children}</ul>
					)}
					renderItem={({
						value,
						props,
						index,
						isDragged,
						isSelected,
					}) => (
						<li
							{...props}
							style={{
								...props.style,
								listStyleType: 'none',
								cursor: isDragged ? 'grabbing' : 'grab',
								color: value.disabled ? '#888' : '#333',
								textDecoration: value.disabled
									? 'line-through'
									: 'none',
								backgroundColor:
									isDragged || isSelected ? '#EEE' : '#FFF',
								paddingTop: '5px',
								paddingBottom: '5px',
								borderBottom: '1px solid #CCC',
							}}
						>
							<div
								style={{
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'space-between',
								}}
							>
								{value.label}
								<button
									type="button"
									onClick={({ oldIndex, newIndex }) => {
										items[index].disabled =
											!items[index].disabled;
										const newItems = arrayMove(
											items,
											oldIndex,
											newIndex
										);
										setItems(newItems);
										if (typeof onChange === 'function') {
											onChange(newItems);
										} else if (
											typeof setAttributes === 'function'
										) {
											setAttributes({
												[attribute]: newItems
													.filter((i) => !i.disabled)
													.map((i) => ({
														label: i.label,
														value: i.value,
													})),
											});
										}
									}}
									style={{
										border: 'none',
										margin: 0,
										padding: 0,
										width: 'auto',
										overflow: 'visible',
										cursor: 'pointer',
										background: 'transparent',
									}}
								>
									{!value.disabled ? (
										<Icon icon="visibility" />
									) : (
										<Icon icon="hidden" />
									)}
								</button>
							</div>
						</li>
					)}
				/>
			</div>
			<div>
				{/*
			@TODO: InputControl doesn't yet have an onEnter event.
			Ideally keying enter on your keyboard should update the
			list of options.
			*/}
				<InputControl
					style={{ width: '100%' }}
					value={inputValue}
					placeholder="A new option ..."
					onChange={(val) => {
						setInputValue(val);
					}}
				/>
				<Button
					style={{ width: '100%', marginBottom: '24px' }}
					type="button"
					variant="secondary"
					onClick={() => {
						const formattedValue = inputValue
							.toLowerCase()
							.replace(/\s/g, '-')
							.replace(/[^a-zA-Z0-9-]/g, '');
						const newItems = [
							...items,
							{ label: inputValue, value: formattedValue },
						];
						setItems(newItems);
						if (typeof onChange === 'function') {
							onChange(newItems);
						} else if (typeof setAttributes === 'function') {
							setAttributes({
								[attribute]: newItems
									.filter((i) => !i.disabled)
									.map((i) => ({
										label: i.label,
										value: i.value,
									})),
							});
						}
						setInputValue('');
					}}
				>
					Add New Option
				</Button>
				<Button
					style={{ width: '100%' }}
					type="button"
					className="is-secondary is-destructive"
					onClick={() => {
						setItems([]);
						if (typeof onChange === 'function') {
							onChange([]);
						} else if (typeof setAttributes === 'function') {
							setAttributes({ [attribute]: [] });
						}
					}}
				>
					Remove All Options
				</Button>
			</div>

			<div>
				<PanelDescription>
					Generating a select's options via CSV will take the first
					column of a CSV and generate them as the labels for their
					respsective options.
				</PanelDescription>

				<Button
					variant="primay"
					onClick={() => {
						hiddenFileInput.current.click();
					}}
				>
					{__(`Import options from CSV`, 'prc-block-library')}
				</Button>
				<input
					ref={hiddenFileInput}
					type="file"
					accept="text/csv"
					onChange={(e) => {
						handleCSV(
							e.target.files,
							attribute,
							setItems,
							setAttributes,
							onChange
						);
					}}
					style={{ display: 'none' }}
				/>
				<DropZone
					onFilesDrop={(droppedFiles) => {
						handleCSV(
							droppedFiles,
							attribute,
							setItems,
							setAttributes,
							onChange
						);
					}}
				/>
			</div>
		</Fragment>
	);
}

export default Sorter;
