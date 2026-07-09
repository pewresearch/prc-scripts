/**
 * WordPress Dependencies
 */
import { useMemo } from '@wordpress/element';
import { InspectorControls, BlockControls } from '@wordpress/block-editor';
import {
	Button,
	TextControl,
	PanelBody,
	PanelRow,
	ToolbarGroup,
	ToolbarButton,
} from '@wordpress/components';
import { edit, seen } from '@wordpress/icons';
import { addQueryArgs } from '@wordpress/url';

export default function SyncedEntityIsolationControls({
	attributes,
	panelTitle,
	entityTitle = '',
	entityTitleLabel,
	editLink: editLinkProp,
	previewLink = '',
	labels,
	extraToolbarItems = null,
	extraInspectorContent = null,
}) {
	const { ref } = attributes;

	const editLink = useMemo(() => {
		if (editLinkProp) {
			return editLinkProp;
		}
		if (!ref) {
			return '';
		}
		return addQueryArgs('post.php', { post: ref, action: 'edit' });
	}, [editLinkProp, ref]);

	const openEdit = () => window.open(editLink, '_blank');
	const openPreview = () => window.open(previewLink, '_blank');
	const showPreview = !!labels.preview;

	return (
		<>
			{ref && (
				<BlockControls>
					<ToolbarGroup>
						{showPreview && (
							<ToolbarButton
								icon={seen}
								label={labels.preview}
								onClick={openPreview}
								disabled={!previewLink}
							/>
						)}
						<ToolbarButton
							icon={edit}
							label={labels.edit}
							onClick={openEdit}
							disabled={!editLink}
						/>
					</ToolbarGroup>
					{extraToolbarItems}
				</BlockControls>
			)}
			<InspectorControls>
				<PanelBody title={panelTitle}>
					{extraInspectorContent}
					<TextControl
						__next40pxDefaultSize
						__nextHasNoMarginBottom
						label={entityTitleLabel}
						value={entityTitle}
						onChange={() => {}}
						disabled
					/>
					{showPreview && (
						<PanelRow>
							<Button
								variant="secondary"
								onClick={openPreview}
								disabled={!previewLink}
							>
								{labels.preview}
							</Button>
						</PanelRow>
					)}
					<PanelRow>
						<Button
							variant="secondary"
							onClick={openEdit}
							disabled={!editLink}
						>
							{labels.edit}
						</Button>
					</PanelRow>
				</PanelBody>
			</InspectorControls>
		</>
	);
}
