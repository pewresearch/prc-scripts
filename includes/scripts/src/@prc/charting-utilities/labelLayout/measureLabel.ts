/**
 * Canvas-based text measurement utilities for label layout.
 * Shared by DraggableLabel word-wrap and the auto-declutter engine.
 */
/* eslint-disable jsdoc/require-param */
import { DEFAULT_FONT_FAMILY } from '../utilities/defaultFontFamily';

export interface MeasureLabelOptions {
	text: string;
	fontSize: number;
	fontFamily: string;
	maxWidth?: number;
	fontWeight?: string | number;
}

let measureContext: CanvasRenderingContext2D | null = null;

function getMeasureContext(): CanvasRenderingContext2D | null {
	if (typeof document === 'undefined') {
		return null;
	}
	if (!measureContext) {
		const canvas = document.createElement('canvas');
		measureContext = canvas.getContext('2d');
	}
	return measureContext;
}

export function measureTextWidth(
	text: string,
	fontSize: number,
	fontFamily: string = DEFAULT_FONT_FAMILY,
	fontWeight: string | number = 'normal'
): number {
	const context = getMeasureContext();
	if (!context || !text) {
		return text.length * fontSize * 0.55;
	}
	context.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
	return context.measureText(text).width;
}

/**
 * Break text into lines by word boundaries to fit maxWidth.
 */
export function wordWrap(
	text: string,
	maxWidth: number,
	fontSize: number,
	fontFamily: string = DEFAULT_FONT_FAMILY,
	fontWeight: string | number = 'normal'
): string[] {
	if (!maxWidth || maxWidth <= 0) {
		return [text];
	}

	const context = getMeasureContext();
	if (!context) {
		return [text];
	}

	context.font = `${fontWeight} ${fontSize}px ${fontFamily}`;

	const words = text.split(/(\s+)/);
	const lines: string[] = [];
	let currentLine = words[0] || '';

	for (let i = 1; i < words.length; i++) {
		const word = words[i];
		const testLine = currentLine + word;
		const metrics = context.measureText(testLine);
		const isWhitespace = /^\s+$/.test(word);

		if (metrics.width > maxWidth && currentLine !== '' && !isWhitespace) {
			lines.push(currentLine);
			currentLine = word;
		} else {
			currentLine = testLine;
		}
	}

	lines.push(currentLine);
	return lines;
}

export interface LabelBBox {
	width: number;
	height: number;
	offsetX: number;
	offsetY: number;
}

export interface MeasureLabelBBoxOptions extends MeasureLabelOptions {
	textAnchor?: 'start' | 'middle' | 'end';
	dominantBaseline?: 'middle' | 'hanging' | 'auto' | 'central' | 'alphabetic';
}

/**
 * Measure a label's axis-aligned bounding box relative to its anchor point.
 */
export function measureLabelBBox({
	text,
	fontSize,
	fontFamily = DEFAULT_FONT_FAMILY,
	fontWeight = 'normal',
	maxWidth = 0,
	textAnchor = 'middle',
	dominantBaseline = 'middle',
}: MeasureLabelBBoxOptions): LabelBBox {
	const lines = wordWrap(text, maxWidth, fontSize, fontFamily, fontWeight);
	const lineHeight = fontSize * 1.2;
	const width = Math.max(
		...lines.map((line) =>
			measureTextWidth(line, fontSize, fontFamily, fontWeight)
		),
		0
	);
	// Use the visual glyph extent (~fontSize), not the typographic line-height,
	// so the collision box matches what the eye sees. Inflating by line-height
	// makes clearly-separated labels register as overlapping and get nudged.
	const height = fontSize + (lines.length - 1) * lineHeight;

	let offsetX = 0;
	if (textAnchor === 'middle') {
		offsetX = -width / 2;
	} else if (textAnchor === 'end') {
		offsetX = -width;
	}

	let offsetY = 0;
	if (dominantBaseline === 'middle' || dominantBaseline === 'central') {
		offsetY = -height / 2;
	} else if (dominantBaseline === 'hanging' || dominantBaseline === 'auto') {
		offsetY = 0;
	} else {
		offsetY = -fontSize;
	}

	return { width, height, offsetX, offsetY };
}
