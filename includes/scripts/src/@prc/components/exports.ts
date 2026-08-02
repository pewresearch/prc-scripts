/**
 * Public API for @prc/components.
 * Re-exports all components from their modules.
 */

// Auth Provider Context
export { ProvideAuth, useAuth } from './auth-provider-context';

// Detach Blocks Toolbar Control
export { default as DetachBlocksToolbarControl } from './detach-blocks-toolbar-control';

// Entity Create New Modal
export { default as EntityCreateNewModal } from './entity-create-new-modal';

// Entity Pattern Modal
export { default as EntityPatternModal } from './entity-pattern-modal';

// Heading Level Toolbar
export { default as HeadingLevelToolbar } from './heading-level-toolbar';

// Icon Picker
export { default as IconPicker } from './icon-picker';
export type {
	IconPickerProps,
	IconPickerValue,
	IconPosition,
} from './icon-picker';

// InnerBlocks utilities
export {
	InnerBlocksAsContextTemplate,
	useInnerBlocksContextAsQuery,
	InnerBlocksAsSyncedContent,
} from './innerblocks';

// Inspector Popout Panel
export { default as InspectorPopoutPanel } from './inspector-popout-panel';

// List Store
export {
	registerListStore,
	ListStoreItem,
	actions as listStoreActions,
	reducer as listStoreReducer,
} from './list-store';

// Loading Indicator
export { default as LoadingIndicator } from './loading-indicator';

// Mailchimp Segment List
export { default as MailchimpSegmentList } from './mailchimp-segment-list';

// Mailchimp Segment Select
export { default as MailchimpSegmentSelect } from './mailchimp-segment-select';

// Mailchimp data hooks (same REST as prc-email-builder)
export {
	useMailchimpAudiences,
	useMailchimpSegments,
	getMailchimpRestNamespace,
} from './mailchimp/use-mailchimp-data';

// Marked Range Control
export { default as MarkedRangeControl } from './marked-range-control';

// Media Dropzone
export { default as MediaDropZone } from './media-dropzone';

// Media Image Slot
export { default as MediaImageSlot, Overlay } from './media-image-slot';

// Placeholder
export { default as Placeholder } from './placeholder';

// Responsive Image
export { default as ResponsiveImage } from './responsive-image';

// Social Image Generator
export {
	SocialImageGenerator,
	renderToCanvas,
	generateImage,
	generateImageFile,
	DEFAULT_PLATFORM_SIZES,
	PLATFORM_NAMES,
	DEFAULT_FONT_FAMILY_OPTIONS,
	ColorPickerButton,
} from './social-image-generator';

// Social Preview (wrapper + individual previews + types)
export {
	SocialPreview,
	FacebookPreview,
	TwitterPreview,
	ThreadsPreview,
	BlueskyPreview,
	SlackPreview,
	DiscordPreview,
	GooglePreview,
	LinkedInPreview,
	TeamsPreview,
	InstagramStoryPreview,
	InstagramReelPreview,
	InstagramPostPreview,
} from './social-preview';

// Styled Component Context
export { default as StyledComponentContext } from './styled-component-context';

// Synced Entity Blocks
export { default as SyncedEntityIcon } from './synced-entity-icon';
export { default as SyncedEntityIsolationControls } from './synced-entity-isolation-controls';
export { default as SyncedEntityPlaceholder } from './synced-entity-placeholder';
export { default as SyncedEntityCreateModal } from './synced-entity-create-modal';
export { default as SyncedEntityEdit } from './synced-entity-edit';

// Taxonomy Select
export { default as TaxonomySelect } from './taxonomy-select';

// Term Select
export { default as TermSelect } from './term-select';

// Transition
export { default as Transition } from './transition';

// URL Search
export { URLSearchField, URLSearchToolbar } from './url-search';

// WP Entity Search
export { default as WPEntitySearch } from './wp-entity-search';

// AI Components
export {
	useAISuggest,
	AISuggestButton,
	AISuggestToolbarButton,
	AILoadingIndicator,
	AISuggestModal,
	AISuggestionPreview,
	AISuggestionsList,
	AINumberCheckBadge,
} from './ai';

// Editable Text
export { EditableText } from './social-preview/editable-text';
export { EditableMedia } from './social-preview/editable-media';
export type {
	EditablePreviewProps,
	EditablePreviewCallbacks,
} from './social-preview/types';

// Browser Chrome
export { MobileSafariChrome, DesktopSafariChrome } from './browser-chrome';

// Character Counter
export { default as CharacterCounter } from './character-counter';
export type { CharacterCounterProps } from './character-counter';
export { default as CharacterCounterRing } from './character-counter/ring';
export type { CharacterCounterRingProps } from './character-counter/ring';

// Settings Page (WP Admin)
export {
	SettingsAccordion,
	SettingsSubSection,
	SettingsPage,
	SettingsFieldsSection,
	ConnectionBadge,
	SettingsSectionFooter,
	createSettingsStore,
	createSettingsClient,
	createPartialSaveClient,
	useSettingsDraft,
	mountSettingsPage,
} from './settings-page';
export type {
	SettingsApiResponse,
	SettingsStoreState,
	SettingsFieldConfig,
	SettingsFieldOption,
	SettingsFieldType,
	SettingsAccordionProps,
	SettingsSubSectionProps,
	SettingsSectionConfig,
	SettingsPageProps,
	SettingsFieldsSectionProps,
	ConnectionBadgeProps,
	SettingsSectionFooterProps,
	CreateSettingsStoreConfig,
	CreateSettingsClientConfig,
	CreatePartialSaveClientConfig,
	SaveSettingsOptions,
} from './settings-page';
