/**
 * External Dependencies
 */
import * as React from 'react';
import styled from '@emotion/styled';

/**
 * WordPress Dependencies
 */
import { RichText } from '@wordpress/block-editor';

/**
 * Internal Dependencies
 */
import type { ThreadsPreviewProps } from './types';
import CharacterCounterRing from '../character-counter/ring';
import AINumberCheckBadge from '../ai/ai-number-check-badge';
import { previewBody, showBodyChrome } from './preview-body';

const PreviewContainer = styled.div`
	font-family:
		-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial,
		sans-serif;
	margin-bottom: 1rem;
`;

const Label = styled.div`
	font-size: 12px;
	font-weight: 600;
	color: #737373;
	margin-bottom: 8px;
	text-transform: uppercase;
	letter-spacing: 0.5px;
`;

const Card = styled.div`
	border: 1px solid #dbdbdb;
	border-radius: 12px;
	overflow: hidden;
	background: #ffffff;
	max-width: 400px;
`;

const ImageContainer = styled.div`
	width: 100%;
	height: 0;
	padding-bottom: 100%; /* Square aspect ratio for Threads */
	position: relative;
	overflow: hidden;
	background: #fafafa;
`;

const Image = styled.img`
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	object-fit: cover;
`;

const Content = styled.div`
	padding: 12px;
`;

const Title = styled.div`
	font-size: 14px;
	font-weight: 600;
	color: #262626;
	line-height: 1.4;
	margin-bottom: 4px;
	word-wrap: break-word;
`;

const Description = styled.div`
	font-size: 14px;
	color: #737373;
	line-height: 1.4;
	margin-bottom: 8px;
	word-wrap: break-word;
`;

const Domain = styled.div`
	font-size: 12px;
	color: #737373;
	text-transform: uppercase;
	letter-spacing: 0.5px;
`;

/**
 * Threads link preview component
 * Displays how content will appear when shared on Threads
 *
 * @param props                   - SocialPreviewProps
 * @param props.title             - Link title
 * @param props.description       - Link description
 * @param props.url               - URL
 * @param props.image             - Image URL
 * @param props.children          - Optional custom image content
 * @param props.showLabel         - When false, hides the platform name label above the preview
 * @param props.isEditable        - When true, body text is a RichText field
 * @param props.isSelected        - When true, shows the character counter ring
 * @param props.charLimit         - Character limit for the counter ring
 * @param props.editableCallbacks - Change handlers for editable mode
 * @param props.numberCheck       - Number-check verdict for the badge
 * @param props.textSlot          - Optional node that replaces the body string or RichText
 */
export function ThreadsPreview({
	title,
	description,
	url,
	image,
	children,
	showLabel = true,
	isEditable = false,
	isSelected = false,
	charLimit,
	editableCallbacks,
	numberCheck,
	textSlot,
}: ThreadsPreviewProps): JSX.Element {
	const domain = React.useMemo(() => {
		try {
			return new URL(url).hostname.replace('www.', '');
		} catch {
			return url;
		}
	}, [url]);

	const truncatedTitle =
		!textSlot && !isEditable && title.length > 60
			? `${title.slice(0, 57)}...`
			: title;
	const truncatedDescription =
		description.length > 100
			? `${description.slice(0, 97)}...`
			: description;
	const onContentChange = editableCallbacks?.onContentChange;
	const showEditableText = isEditable && onContentChange;

	return (
		<PreviewContainer>
			{showLabel && <Label>Threads</Label>}
			<Card>
				{(image || children) && (
					<ImageContainer>
						{children || <Image src={image} alt="" />}
					</ImageContainer>
				)}
				<Content>
					<Title data-text-slot={textSlot ? true : undefined}>
						{previewBody(
							textSlot,
							showEditableText,
							<RichText
								tagName="span"
								value={title}
								onChange={onContentChange}
								allowedFormats={[]}
								placeholder="Write your post..."
							/>,
							truncatedTitle
						)}
					</Title>
					{showBodyChrome(
						textSlot,
						showEditableText,
						charLimit,
						isSelected
					) && (
						<div
							style={{
								marginBottom: 8,
								display: 'flex',
								justifyContent: 'flex-end',
								alignItems: 'center',
								gap: 6,
							}}
						>
							<AINumberCheckBadge
								numberCheck={numberCheck ?? undefined}
							/>
							<CharacterCounterRing
								current={title.length}
								limit={charLimit ?? 0}
							/>
						</div>
					)}
					<Description>{truncatedDescription}</Description>
					<Domain>{domain}</Domain>
				</Content>
			</Card>
		</PreviewContainer>
	);
}

export default ThreadsPreview;
