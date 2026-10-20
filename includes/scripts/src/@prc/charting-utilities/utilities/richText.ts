/**
 * Inline rich text for chart labels.
 *
 * Label text is stored as the HTML that the block editor's RichText writes
 * (`<strong>`, `<em>`, `<s>`, `<a>`, underline `<span style>`, text-color
 * `<mark>`). Labels draw into SVG, where HTML does not render, so the text is
 * split into styled runs that each renderer turns into `<tspan>`s or spans.
 * Plain strings come back as a single unstyled run.
 */
import { decodeHtmlEntities } from './helpers';

export type RichTextRun = {
	text: string;
	fontWeight?: 'bold';
	fontStyle?: 'italic';
	textDecoration?: string;
	fill?: string;
	link?: string;
};

type RunStyle = Omit<RichTextRun, 'text'>;

const TAG_PATTERN = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>/g;

// Other angle-bracket text stays literal: data labels can read like "<HS grad>".
const FORMAT_TAGS = new Set([
	'b',
	'strong',
	'i',
	'em',
	's',
	'strike',
	'del',
	'u',
	'a',
	'span',
	'mark',
	'br',
]);

function decodeText(text: string): string {
	return decodeHtmlEntities(text).replace(/&nbsp;|&#160;/g, '\u00A0');
}

function readAttribute(attributes: string, name: string): string | undefined {
	const match = attributes.match(
		new RegExp(`\\b${name}\\s*=\\s*"([^"]*)"`, 'i')
	);
	return match ? match[1] : undefined;
}

function addDecoration(
	current: string | undefined,
	decoration: string
): string {
	const parts = new Set((current || '').split(/\s+/).filter(Boolean));
	decoration
		.split(/\s+/)
		.filter((part) => part && part !== 'none')
		.forEach((part) => parts.add(part));
	return Array.from(parts).join(' ');
}

function isSafeHref(href: string): boolean {
	return !/^\s*(javascript|data|vbscript):/i.test(href);
}

function styleFromInlineCss(css: string, base: RunStyle): RunStyle {
	const style: RunStyle = { ...base };
	css.split(';').forEach((declaration) => {
		const separator = declaration.indexOf(':');
		if (separator === -1) {
			return;
		}
		const value = declaration.slice(separator + 1).trim();
		if (!value) {
			return;
		}
		const property = declaration.slice(0, separator).trim().toLowerCase();
		if (property === 'color') {
			style.fill = value;
		} else if (
			property === 'text-decoration' ||
			property === 'text-decoration-line'
		) {
			style.textDecoration = addDecoration(style.textDecoration, value);
		} else if (
			property === 'font-weight' &&
			/^(bold|[6-9]00)$/.test(value)
		) {
			style.fontWeight = 'bold';
		} else if (property === 'font-style' && value === 'italic') {
			style.fontStyle = 'italic';
		}
	});
	return style;
}

function styleForTag(
	tag: string,
	attributes: string,
	base: RunStyle
): RunStyle {
	switch (tag) {
		case 'b':
		case 'strong':
			return { ...base, fontWeight: 'bold' };
		case 'i':
		case 'em':
			return { ...base, fontStyle: 'italic' };
		case 's':
		case 'strike':
		case 'del':
			return {
				...base,
				textDecoration: addDecoration(
					base.textDecoration,
					'line-through'
				),
			};
		case 'u':
			return {
				...base,
				textDecoration: addDecoration(base.textDecoration, 'underline'),
			};
		case 'a': {
			const href = readAttribute(attributes, 'href');
			return {
				...base,
				textDecoration: addDecoration(base.textDecoration, 'underline'),
				...(href && isSafeHref(href) ? { link: href } : {}),
			};
		}
		case 'span':
		case 'mark': {
			let style = styleFromInlineCss(
				readAttribute(attributes, 'style') || '',
				base
			);
			// Palette colors are saved as a class only: `has-<slug>-color`.
			const presetColor = (
				readAttribute(attributes, 'class') || ''
			).match(/\bhas-(?!inline-color\b)([a-z0-9-]+)-color\b/);
			if (presetColor && !style.fill) {
				style = {
					...style,
					fill: `var(--wp--preset--color--${presetColor[1]})`,
				};
			}
			return style;
		}
		default:
			return base;
	}
}

/**
 * Split label text into styled runs.
 *
 * @param input Label text, plain or RichText HTML.
 * @return Runs in reading order; empty runs are dropped.
 */
export function parseRichText(input: string | null | undefined): RichTextRun[] {
	if (!input) {
		return [];
	}

	const runs: RichTextRun[] = [];
	const stack: Array<{ tag: string; style: RunStyle }> = [];
	const currentStyle = (): RunStyle =>
		stack.length ? stack[stack.length - 1].style : {};
	const pushText = (raw: string) => {
		const text = decodeText(raw);
		if (text) {
			runs.push({ text, ...currentStyle() });
		}
	};

	let cursor = 0;
	for (const match of input.matchAll(TAG_PATTERN)) {
		const [whole, closing, rawTag, attributes] = match;
		const tag = rawTag.toLowerCase();
		if (!FORMAT_TAGS.has(tag)) {
			continue;
		}
		pushText(input.slice(cursor, match.index));
		cursor = (match.index ?? 0) + whole.length;

		if (tag === 'br') {
			runs.push({ text: ' ', ...currentStyle() });
		} else if (closing) {
			const openIndex = stack.map((entry) => entry.tag).lastIndexOf(tag);
			if (openIndex !== -1) {
				stack.length = openIndex;
			}
		} else if (!/\/\s*$/.test(attributes)) {
			stack.push({
				tag,
				style: styleForTag(tag, attributes, currentStyle()),
			});
		}
	}
	pushText(input.slice(cursor));

	return runs;
}

// Breaking whitespace only: a no-break space stays inside its word.
const BREAKING_SPACE = /([^\S\u00A0]+)/;

function sameStyle(a: RichTextRun, b: RichTextRun): boolean {
	return (
		a.fontWeight === b.fontWeight &&
		a.fontStyle === b.fontStyle &&
		a.textDecoration === b.textDecoration &&
		a.fill === b.fill &&
		a.link === b.link
	);
}

function mergeRuns(runs: RichTextRun[]): RichTextRun[] {
	return runs.reduce<RichTextRun[]>((merged, run) => {
		const last = merged[merged.length - 1];
		if (last && sameStyle(last, run)) {
			merged[merged.length - 1] = { ...last, text: last.text + run.text };
		} else {
			merged.push({ ...run });
		}
		return merged;
	}, []);
}

/**
 * Wrap runs into lines no wider than `maxWidth`, breaking between words.
 * A word that is wider than `maxWidth` gets a line to itself.
 *
 * @param runs     Runs from parseRichText.
 * @param maxWidth Line width limit; 0 or less keeps one line.
 * @param measure  Width of one run in the same units as maxWidth.
 * @return Lines of runs, with whitespace at line breaks removed.
 */
export function layoutRichTextLines(
	runs: RichTextRun[],
	maxWidth: number,
	measure: (run: RichTextRun) => number
): RichTextRun[][] {
	const words: Array<{ lead: RichTextRun[]; parts: RichTextRun[] }> = [];
	let lead: RichTextRun[] = [];
	let parts: RichTextRun[] | null = null;

	runs.forEach((run) => {
		run.text.split(BREAKING_SPACE).forEach((piece) => {
			if (!piece) {
				return;
			}
			const segment = { ...run, text: piece };
			if (BREAKING_SPACE.test(piece)) {
				if (parts) {
					words.push({ lead, parts });
					parts = null;
					lead = [];
				}
				lead.push(segment);
			} else {
				parts = parts ?? [];
				parts.push(segment);
			}
		});
	});
	if (parts) {
		words.push({ lead, parts });
	}

	const widthOf = (segments: RichTextRun[]) =>
		maxWidth > 0
			? segments.reduce((total, segment) => total + measure(segment), 0)
			: 0;

	const lines: RichTextRun[][] = [];
	let line: RichTextRun[] | null = null;
	let lineWidth = 0;
	words.forEach((word) => {
		const wordWidth = widthOf(word.parts);
		const leadWidth = widthOf(word.lead);
		if (!line) {
			line = [...word.parts];
			lineWidth = wordWidth;
		} else if (
			maxWidth > 0 &&
			lineWidth + leadWidth + wordWidth > maxWidth
		) {
			lines.push(line);
			line = [...word.parts];
			lineWidth = wordWidth;
		} else {
			line.push(...word.lead, ...word.parts);
			lineWidth += leadWidth + wordWidth;
		}
	});
	if (line) {
		lines.push(line);
	}

	return lines.map(mergeRuns);
}

/**
 * Label text with formatting removed, for measuring, aria labels, and CSV.
 *
 * @param input Label text, plain or RichText HTML.
 * @return Plain text.
 */
export function stripRichText(input: string | null | undefined): string {
	return parseRichText(input)
		.map((run) => run.text)
		.join('');
}
