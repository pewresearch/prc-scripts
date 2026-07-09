/* eslint-disable @wordpress/i18n-text-domain -- textDomain is supplied by consumer plugins */
import { useEffect, useMemo, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Page } from '@wordpress/admin-ui';
import {
	Spinner,
	Notice,
	Card,
	__experimentalVStack as VStack,
} from '@wordpress/components';

import SettingsAccordion from './settings-accordion';
import SettingsFieldsSection from './settings-fields-section';
import { SettingsPageContext } from './settings-page-context';
import type { SettingsPageProps } from './types';

import './style.scss';

export default function SettingsPage({
	title,
	description,
	textDomain,
	sections,
	onLoad,
	store,
	saveSettings,
	actions,
	intro,
	errorLoadingLabel,
	errorRetryLabel,
	className = 'prc-settings',
	idPrefix = 'prc-settings',
}: SettingsPageProps) {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const usesFieldsSections = sections.some(
		(section) => section.fields?.length
	);

	useEffect(() => {
		onLoad()
			.then(() => setError(null))
			.catch((e: Error) => setError(e.message))
			.finally(() => setLoading(false));
	}, [onLoad]);

	const contextValue = useMemo(() => {
		if (!store || !saveSettings) {
			return null;
		}

		return {
			store,
			saveSettings,
			textDomain,
		};
	}, [store, saveSettings, textDomain]);

	useEffect(() => {
		if (usesFieldsSections && !contextValue) {
			throw new Error(
				'SettingsPage sections with fields require store and saveSettings props.'
			);
		}
	}, [contextValue, usesFieldsSections]);

	const pageContent = (
		<div className={`${className}__container`}>
			{error && (
				<Notice status="error" isDismissible={false}>
					<VStack spacing={2}>
						<span>
							{errorLoadingLabel ??
								__('Error loading settings:', textDomain)}{' '}
							{error}
						</span>
						{errorRetryLabel && <span>{errorRetryLabel}</span>}
					</VStack>
				</Notice>
			)}

			{intro ? (
				<Card className={`${className}__intro-card`}>
					<div className={`${className}__intro-card-content`}>
						{intro}
					</div>
				</Card>
			) : null}

			{loading ? (
				<div className={`${className}__loading`}>
					<Spinner />
				</div>
			) : (
				!error && (
					<VStack spacing={4} className={`${className}__content`}>
						<ul className={`${className}__list`}>
							{sections.map((section) => {
								const contentId = `${idPrefix}-${section.slug}`;
								const headingId = `${idPrefix}-${section.slug}-heading`;
								const descriptionId = `${idPrefix}-${section.slug}-description`;
								const badge = section.badge?.();
								const sectionIntro = section.intro?.();
								const sectionFooter = section.footer?.();

								if (section.fields?.length) {
									return (
										<li
											key={section.slug}
											className={`${className}__list-item`}
										>
											<SettingsFieldsSection
												slug={section.slug}
												title={section.title}
												description={
													section.description
												}
												fields={section.fields}
												intro={sectionIntro}
												badge={badge}
												footer={sectionFooter}
												defaultOpen={
													section.defaultOpen
												}
											/>
										</li>
									);
								}

								return (
									<li
										key={section.slug}
										className={`${className}__list-item`}
									>
										<SettingsAccordion
											slug={section.slug}
											title={section.title}
											description={section.description}
											textDomain={textDomain}
											contentId={contentId}
											headingId={headingId}
											descriptionId={descriptionId}
											badge={badge}
											intro={sectionIntro}
											defaultOpen={section.defaultOpen}
										>
											{section.render?.()}
										</SettingsAccordion>
									</li>
								);
							})}
						</ul>
					</VStack>
				)
			)}
		</div>
	);

	return (
		<Page
			className={className}
			title={title}
			subTitle={description}
			actions={actions}
		>
			{contextValue ? (
				<SettingsPageContext.Provider value={contextValue}>
					{pageContent}
				</SettingsPageContext.Provider>
			) : (
				pageContent
			)}
		</Page>
	);
}
