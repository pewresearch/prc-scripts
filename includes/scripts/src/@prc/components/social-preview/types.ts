/**
 * External Dependencies
 */
import type { ReactNode } from 'react';

/**
 * Shared TypeScript types for social preview components
 */

export type SocialPreviewProps = {
	title: string;
	description: string;
	url: string;
	image?: string;
	siteName?: string; // Optional: for og:site_name
	favicon?: string; // Optional: for Slack/Discord
	children?: ReactNode; // Optional: custom content for ImageContainer/Thumbnail
	/** When false, hides the platform name label above the preview. Default true. */
	showLabel?: boolean;
};

export type InstagramPreviewProps = SocialPreviewProps & {
	username?: string;
	profilePicture?: string;
	videoUrl?: string; // For Reels
	likes?: number;
	comments?: number;
};

export interface EditablePreviewCallbacks {
	onContentChange?: (content: string) => void;
	onMediaSelect?: (media: { id: number; url: string; type?: string }) => void;
	onMediaRemove?: () => void;
	onLinkUrlChange?: (url: string) => void;
}

export interface EditablePreviewProps {
	isEditable?: boolean;
	/** When false, hides the inline character counter ring. Default false. */
	isSelected?: boolean;
	charLimit?: number;
	mediaId?: number;
	editableCallbacks?: EditablePreviewCallbacks;
	/** Number-check verdict for the content; shows a badge beside the counter ring. */
	numberCheck?: { valid: boolean; flagged: string[] } | null;
	/** Replaces the post-body string or RichText. Use for InnerBlocks compose. */
	textSlot?: ReactNode;
}

export type TwitterPreviewProps = SocialPreviewProps &
	EditablePreviewProps & {
		displayName?: string; // "Pew Research Center"
		username?: string; // "@pewresearch"
		profilePicture?: string; // Avatar URL
		tweetText?: string; // Actual tweet content
		verified?: boolean; // Show verified badge
		timestamp?: string; // "1m", "2h", etc.
		likes?: number;
		replies?: number;
		retweets?: number;
	};

export type BlueskyPreviewProps = SocialPreviewProps &
	EditablePreviewProps & {
		displayName?: string; // "Pew Research Center"
		handle?: string; // "@pewresearch.org"
		profilePicture?: string; // Avatar URL
		postText?: string; // Actual post content
		verified?: boolean; // Show verified badge
		timestamp?: string; // "10:51 AM · Dec 9, 2025"
		likes?: number;
		reposts?: number;
		quotes?: number;
		replies?: number;
		saves?: number;
	};

export type SlackPreviewProps = SocialPreviewProps & {
	displayName?: string; // "Seth Rubenstein"
	profilePicture?: string; // User avatar URL
	messageText?: string; // Message text (URL shown inline)
	timestamp?: string; // "1:36 PM"
	readingTime?: string; // "3 minutes"
	author?: string; // "Shanay Gracia"
};

export type LinkedInPreviewProps = SocialPreviewProps &
	EditablePreviewProps & {
		displayName?: string; // "Pew Research Center"
		profilePicture?: string; // Logo/avatar URL
		followers?: string; // "166,244 followers"
		postText?: string; // Post content text
		timestamp?: string; // "6h"
		shortUrl?: string; // Shortened URL to display in post
		reactions?: number; // Reaction count
		comments?: number; // Comment count
		reposts?: number; // Repost count
	};

export type FacebookPreviewProps = SocialPreviewProps &
	EditablePreviewProps & {
		displayName?: string; // "Pew Research Center"
		profilePicture?: string; // Avatar URL
		postText?: string; // Post content text
		timestamp?: string; // "5h"
		verified?: boolean; // Show verified badge
		reactions?: number; // Reaction count
		comments?: number; // Comment count
		shares?: number; // Share count
	};

export type SocialNetwork =
	| 'facebook'
	| 'twitter'
	| 'threads'
	| 'bluesky'
	| 'slack'
	| 'discord'
	| 'google'
	| 'linkedin'
	| 'teams'
	| 'instagram-story'
	| 'instagram-reel'
	| 'instagram-post';

export type ThreadsPreviewProps = SocialPreviewProps & EditablePreviewProps;

export type SocialPreviewWrapperProps = SocialPreviewProps & {
	networks?: SocialNetwork[];
};
