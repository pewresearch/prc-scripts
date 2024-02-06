/**
 * WordPress Dependencies
 */
import { useState } from 'react';
import { __, sprintf } from '@wordpress/i18n';
import {
	TextControl,
	Button,
	Modal,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';

export default function EntityCreateNewModal( { defaultTitle, onClose, onSubmit } ) {
	const [ title, setTitle ] = useState( __( defaultTitle ) );

	const submitForCreation = ( event ) => {
		event.preventDefault();
		onSubmit( title );
	};

	return (
		<Modal
			title={ sprintf(
				// Translators: %s as defaultTitle ("Header", "Footer", etc.).
				__( 'Name and create your new %s' ),
				defaultTitle.toLowerCase()
			) }
			overlayClassName="wp-block-template-part__placeholder-create-new__title-form"
			onRequestClose={ onClose }
		>
			<form onSubmit={ submitForCreation }>
				<VStack spacing="5">
					<TextControl
						__nextHasNoMarginBottom
						label={ __( 'Name' ) }
						value={ title }
						onChange={ setTitle }
					/>
					<HStack justify="right">
						<Button
							variant="primary"
							type="submit"
							disabled={ ! title.length }
							aria-disabled={ ! title.length }
						>
							{ __( 'Create' ) }
						</Button>
					</HStack>
				</VStack>
			</form>
		</Modal>
	);
}
