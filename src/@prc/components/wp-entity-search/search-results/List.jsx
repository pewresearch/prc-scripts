/**
 * WordPress Dependencies
 */
import { Card, CardBody, NavigableMenu } from '@wordpress/components';
import { date as formatDate } from '@wordpress/date';
import { decodeEntities } from '@wordpress/html-entities';
import { useState, useEffect } from '@wordpress/element';

function SearchItem({ item, onSelect, entityType, selectedId, setSelectedId, showExcerpt }) {
	if (!item) {
		return null;
	}
	console.log("SearchItem: ", item);
	// if item has post_title then use that otherwise use title.rendered
	const title = 'taxonomy' === entityType ? item.name : ( item.post_title ? item.post_title : item.title.rendered );
	// if item has post_date then use that otherwise use date
	const date = 'taxonomy' === entityType ? null : ( item.post_date ? item.post_date : item.date );
	const excerpt = 'taxonomy' === entityType ? item.description : item.excerpt.rendered;

	const canonicalUrl = item.link;

	return (
		// eslint-disable-next-line jsx-a11y/click-events-have-key-events
		<Card
			onClick={() => {
				console.log('On click', onSelect, item);
				// onSelect(item);
				setSelectedId(item.id);
			}}
			size="small"
			style={{
				cursor: 'pointer',
				'box-shadow': 'none',
				'border': '1px solid #eee',
				':hover': {
					'background-color': '#f0f0f0',
				},
				'background-color': selectedId === item.id ? '#f0f0f0' : 'transparent',
			}}
			tabIndex="0"
		>
			<CardBody
				style={{
					display: 'flex',
				}}
			>
				<div>
					{'taxonomy' !== entityType && (
						<div
							style={{
								fontSize: '0.8em',
								color: '#666',
							}}
						>
							{`${formatDate('M j, Y', date)}`}
						</div>
					)}
					<strong>{decodeEntities(title)}</strong>
					{(true === showExcerpt && excerpt) && (
						<div
							style={{
								fontSize: '0.8em',
								color: '#666',
								lineHeight: '1.5em',
							}}
						>
							{decodeEntities(excerpt)}
						</div>
					)}
					<div
						style={{
							fontSize: '0.8em',
							fontStyle: 'italic',
							color: '#666',
							lineHeight: '1.5em',
						}}
					>
						{canonicalUrl}
					</div>
				</div>
			</CardBody>
		</Card>
	);
}

export default function List({ searchRecords, onSelect, entityType, selectedId, setSelectedId, showExcerpt = false }) {
	return searchRecords.map((item) => (
		<SearchItem key={item.id} item={item} onSelect={onSelect} entityType={entityType} selectedId={selectedId} showExcerpt={showExcerpt} setSelectedId={setSelectedId} />
	));
}
