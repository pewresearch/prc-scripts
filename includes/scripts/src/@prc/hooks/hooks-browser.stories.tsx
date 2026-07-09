/**
 * Demos for the browser/state hooks in @prc/hooks (no WordPress runtime
 * required): useDebounce, useWindowSize, useKeyPress, useLocalStorage,
 * useClientWidth, useFetch.
 */
import { useRef, useState } from 'react';

import { TextControl } from '@wordpress/components';

import useClientWidth from './use-client-width';
import useDebounce from './use-debounce';
import useFetch from './use-fetch';
import useKeyPress from './use-keypress';
import useLocalStorage from './use-local-storage';
import useWindowSize from './use-window-size';

import type { Meta, StoryObj } from '@storybook/react-webpack5';

const meta: Meta = {
	title: 'Hooks/Browser',
};

export default meta;

function UseDebounceDemo() {
	const [value, setValue] = useState('');
	const debounced = useDebounce(value, 500);
	return (
		<div style={{ maxWidth: 360 }}>
			<TextControl
				label="Type quickly"
				value={value}
				onChange={setValue}
				help="The debounced value updates 500ms after you stop typing."
				__nextHasNoMarginBottom
			/>
			<p>
				Debounced value: <code>{debounced || '(empty)'}</code>
			</p>
		</div>
	);
}

export const UseDebounce: StoryObj = {
	render: () => <UseDebounceDemo />,
};

function UseWindowSizeDemo() {
	const { width, height } = useWindowSize();
	return (
		<p>
			Resize the preview pane — window is{' '}
			<code>
				{width} × {height}
			</code>
			.
		</p>
	);
}

export const UseWindowSize: StoryObj = {
	render: () => <UseWindowSizeDemo />,
};

function UseKeyPressDemo() {
	const isShiftPressed = useKeyPress('Shift');
	const isKPressed = useKeyPress('k');
	return (
		<div>
			<p>Click the preview first, then hold the keys:</p>
			<p>
				Shift: <strong>{isShiftPressed ? 'down' : 'up'}</strong> · K:{' '}
				<strong>{isKPressed ? 'down' : 'up'}</strong>
			</p>
		</div>
	);
}

export const UseKeyPress: StoryObj = {
	render: () => <UseKeyPressDemo />,
};

function UseLocalStorageDemo() {
	const [name, setName] = useLocalStorage(
		'prc-storybook-demo-name',
		'Pew Research Center'
	);
	return (
		<div style={{ maxWidth: 360 }}>
			<TextControl
				label="Name (persisted to localStorage)"
				value={name}
				onChange={setName}
				help="Reload the story — the value survives."
				__nextHasNoMarginBottom
			/>
		</div>
	);
}

export const UseLocalStorage: StoryObj = {
	render: () => <UseLocalStorageDemo />,
};

function UseClientWidthDemo() {
	const ref = useRef<HTMLDivElement>(null);
	const clientWidth = useClientWidth(ref, []);
	return (
		<div
			ref={ref}
			style={{
				border: '1px dashed #999',
				padding: '1em',
				resize: 'horizontal',
				overflow: 'auto',
			}}
		>
			Measured client width: <code>{clientWidth ?? '…'}px</code> (resize
			the pane)
		</div>
	);
}

export const UseClientWidth: StoryObj = {
	render: () => <UseClientWidthDemo />,
};

function UseFetchDemo() {
	// useFetch takes a plain URL (native fetch, not apiFetch); this demo hits
	// Storybook's own static index so it works offline.
	const { status, data, error } = useFetch('./index.json');
	return (
		<div>
			<p>
				Status: <code>{status}</code>
			</p>
			{error !== null && <p>Error: {String(error)}</p>}
			{status === 'fetched' && (
				<pre style={{ maxHeight: 200, overflow: 'auto' }}>
					{JSON.stringify(data, null, 2).slice(0, 1000)}
				</pre>
			)}
		</div>
	);
}

export const UseFetch: StoryObj = {
	render: () => <UseFetchDemo />,
};
