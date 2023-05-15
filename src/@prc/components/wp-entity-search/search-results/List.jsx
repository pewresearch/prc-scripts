/**
 * WordPress Dependencies
 */
import { Card, CardBody, NavigableMenu } from '@wordpress/components';
import { date as formatDate } from '@wordpress/date';

function SearchItem({ item, onSelect }) {
	if (!item) {
		return null;
	}
	// if item has post_title then use that otherwise use title.rendered
	const title = item.post_title ? item.post_title : item.title.rendered;
	// if item has post_date then use that otherwise use date
	const date = item.post_date ? item.post_date : item.date;

	const canonicalUrl = item.link;

	return (
		// eslint-disable-next-line jsx-a11y/click-events-have-key-events
		<Card
			onClick={() => {
				console.log('On click', onSelect, item);
				onSelect(item);
			}}
			size="small"
			style={{
				cursor: 'pointer',
				':hover': {
					'background-color': '#f3f4f5',
				},
			}}
			tabIndex="0"
		>
			<CardBody
				style={{
					display: 'flex',
				}}
			>
				<div>
					<div
						style={{
							fontSize: '0.8em',
							color: '#666',
						}}
					>
						{`${formatDate('M j, Y', date)}`}
					</div>
					<strong>{title}</strong>
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

export default function List({ searchRecords, onSelect }) {
	return searchRecords.map((item) => (
		<SearchItem key={item.id} item={item} onSelect={onSelect} />
	));
}
