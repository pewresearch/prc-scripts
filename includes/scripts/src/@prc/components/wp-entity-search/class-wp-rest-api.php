<?php // phpcs:ignore WordPress.Files.FileName.InvalidClassFileName -- REST endpoints in this folder share class-wp-rest-api.php.
/**
 * WP Entity Search REST API Endpoint.
 *
 * @package PRC\Platform\Scripts\WP_Entity_Search
 */

namespace PRC\Platform\Scripts\WP_Entity_Search;

use WP_Error;
use WP_Query;
use WP_User;
use WP_User_Query;
use WP_Term_Query;
use WP_REST_Request;
use PRC\URL_Helper;

/**
 * WP Entity Search REST API Endpoint.
 */
class Rest_API_Endpoint {
	/**
	 * Allowed entity_type values.
	 *
	 * @var string[]
	 */
	const ALLOWED_ENTITY_TYPES = array( 'postType', 'taxonomy', 'user' );

	/**
	 * Allowed post status values for entity_status.
	 *
	 * @var string[]
	 */
	const ALLOWED_ENTITY_STATUSES = array( 'publish', 'draft', 'future', 'pending', 'private' );

	/**
	 * Endpoint.
	 *
	 * @var array
	 */
	public static $endpoint = array();

	/**
	 * Constructor.
	 */
	public function __construct() {
		self::$endpoint = array(
			'route'               => '/components/wp-entity-search',
			'methods'             => 'GET',
			'callback'            => array( $this, 'restfully_handle_wp_entity_search' ),
			'permission_callback' => function () {
				return current_user_can( 'edit_posts' );
			},
			'args'                => array(
				'entity_type'     => array(
					'required'          => false,
					'type'              => 'string',
					'default'           => 'postType',
					'enum'              => self::ALLOWED_ENTITY_TYPES,
					'sanitize_callback' => 'sanitize_text_field',
				),
				'entity_sub_type' => array(
					'required' => true,
					'type'     => array( 'string', 'array' ),
					'default'  => 'post',
				),
				'entity_status'   => array(
					'required' => false,
					'type'     => array( 'string', 'array' ),
					'default'  => array( 'publish' ),
				),
				'search'          => array(
					'required'          => true,
					'type'              => 'string',
					'description'       => 'The search term to use.',
					'sanitize_callback' => 'sanitize_text_field',
				),
				'taxonomy'        => array(
					'required'          => false,
					'type'              => 'string',
					'description'       => 'Optional taxonomy to limit post results to a term.',
					'sanitize_callback' => 'sanitize_key',
				),
				'term_id'         => array(
					'required'          => false,
					'type'              => 'integer',
					'description'       => 'Optional term ID used with taxonomy.',
					'sanitize_callback' => 'absint',
				),
			),
		);
		add_action( 'rest_api_init', array( $this, 'register_rest_endpoints' ) );
	}

	/**
	 * Get the endpoint.
	 *
	 * @return array
	 */
	public function get_endpoint() {
		return self::$endpoint;
	}

	/**
	 * Normalize a request param that may be a CSV string or array into a string list.
	 *
	 * @param mixed $value Raw request value.
	 * @return string[]
	 */
	protected function normalize_string_list( $value ) {
		if ( null === $value || '' === $value ) {
			return array();
		}
		if ( ! is_array( $value ) ) {
			$value = explode( ',', (string) $value );
		}
		$normalized = array();
		foreach ( $value as $item ) {
			if ( ! is_string( $item ) && ! is_numeric( $item ) ) {
				continue;
			}
			$item = sanitize_text_field( (string) $item );
			if ( '' !== $item ) {
				$normalized[] = $item;
			}
		}
		return array_values( array_unique( $normalized ) );
	}

	/**
	 * Filter entity statuses to the allowlist; default to publish when empty.
	 *
	 * @param mixed $value Raw entity_status param.
	 * @return string[]
	 */
	protected function sanitize_entity_statuses( $value ) {
		$statuses = array_values(
			array_intersect(
				$this->normalize_string_list( $value ),
				self::ALLOWED_ENTITY_STATUSES
			)
		);
		if ( empty( $statuses ) ) {
			return array( 'publish' );
		}
		return $statuses;
	}

	/**
	 * Allowlist entity subtypes against registered REST post types or taxonomies.
	 *
	 * @param string   $entity_type Entity type.
	 * @param string[] $sub_types   Requested subtypes.
	 * @return string[]|WP_Error
	 */
	protected function sanitize_entity_sub_types( $entity_type, array $sub_types ) {
		if ( 'user' === $entity_type ) {
			return array( 'user' );
		}

		if ( 'taxonomy' === $entity_type ) {
			$allowed = array_keys( get_taxonomies( array( 'show_in_rest' => true ), 'names' ) );
		} else {
			$allowed = array_keys( get_post_types( array( 'show_in_rest' => true ), 'names' ) );
		}

		$filtered = array_values( array_intersect( $sub_types, $allowed ) );
		if ( empty( $filtered ) ) {
			return new WP_Error(
				'invalid_entity_sub_type',
				__( 'No valid entity_sub_type values were provided.', 'prc-scripts' ),
				array( 'status' => 400 )
			);
		}
		return $filtered;
	}

	/**
	 * Resolve a canonical entity URL for REST responses.
	 *
	 * @param mixed $item WP_Post or WP_Term.
	 * @return string
	 */
	protected function resolve_entity_url( $item ) {
		if ( is_a( $item, 'WP_Post' ) ) {
			$redirect = get_post_meta( $item->ID, '_redirect', true );
			if ( is_string( $redirect ) && '' !== $redirect ) {
				return $redirect;
			}
			$permalink = get_permalink( $item->ID );
			return is_string( $permalink ) ? $permalink : '';
		}

		if ( is_a( $item, 'WP_Term' ) ) {
			$term_link = get_term_link( $item );
			if ( is_wp_error( $term_link ) || ! is_string( $term_link ) ) {
				return '';
			}
			return $term_link;
		}

		return '';
	}

	/**
	 * Shape a user into the shared entity DTO (no email, password, or activation key).
	 *
	 * @param WP_User $user User object.
	 * @return object
	 */
	protected function shape_user( WP_User $user ) {
		return (object) array(
			'entityName'          => $user->display_name,
			'entityDescription'   => null,
			'entityDate'          => null,
			'entityType'          => 'user',
			'entitySubType'       => 'user',
			'entitySlug'          => $user->user_nicename,
			'entityId'            => (int) $user->ID,
			'entityUrl'           => '',
			'entityFeaturedImage' => null,
		);
	}

	/**
	 * Shape the item.
	 *
	 * @param mixed $item WP_Post, WP_Term, or WP_User.
	 * @return object
	 */
	protected function shape_item( $item ) {
		if ( is_a( $item, 'WP_User' ) ) {
			return $this->shape_user( $item );
		}

		$new_item = array();
		if ( is_a( $item, 'WP_Post' ) ) {
			$new_item['entityName']          = $item->post_title;
			$new_item['entityDescription']   = $item->post_excerpt;
			$new_item['entityDate']          = $item->post_date;
			$new_item['entityType']          = 'postType';
			$new_item['entitySubType']       = $item->post_type;
			$new_item['entitySlug']          = $item->post_name;
			$new_item['entityId']            = $item->ID;
			$new_item['entityUrl']           = $this->resolve_entity_url( $item );
			$thumbnail                       = get_the_post_thumbnail_url( $item->ID, 'thumbnail' );
			$new_item['entityFeaturedImage'] = false !== $thumbnail ? $thumbnail : null;
		} elseif ( is_a( $item, 'WP_Term' ) ) {
			$new_item['entityName']          = $item->name;
			$new_item['entityDescription']   = $item->description;
			$new_item['entityDate']          = null;
			$new_item['entityType']          = 'taxonomy';
			$new_item['entitySubType']       = $item->taxonomy;
			$new_item['entitySlug']          = $item->slug;
			$new_item['entityId']            = $item->term_id;
			$new_item['entityUrl']           = $this->resolve_entity_url( $item );
			$new_item['entityFeaturedImage'] = null;
		}
		return (object) $new_item;
	}

	/**
	 * Get the ID from the URL.
	 *
	 * Pasted URLs identify an exact post; post type is not filtered here (unlike keyword search).
	 *
	 * @param string $url URL to resolve.
	 * @param array  $entity_status Allowed statuses.
	 * @param string $taxonomy Optional taxonomy slug.
	 * @param int    $term_id Optional term ID.
	 * @return object
	 */
	protected function get_id_from_url( $url, array $entity_status = array( 'publish' ), $taxonomy = '', $term_id = 0 ) {
		$url_helper = new URL_Helper( $url );
		$post_id    = $url_helper->get_post_id();
		if ( is_wp_error( $post_id ) || empty( $post_id ) ) {
			return (object) array();
		}

		$post = get_post( $post_id );
		if ( ! $post instanceof \WP_Post ) {
			return (object) array();
		}

		if ( ! current_user_can( 'read_post', $post->ID ) ) {
			return (object) array();
		}

		if ( ! empty( $entity_status ) && ! in_array( $post->post_status, $entity_status, true ) ) {
			return (object) array();
		}

		if ( '' !== $taxonomy && $term_id > 0 && ! has_term( $term_id, $taxonomy, $post->ID ) ) {
			return (object) array();
		}

		$post_type = $post->post_type;
		if ( in_array( $post_type, array( 'dataset', 'staff' ), true ) ) {
			$term = \TDS\get_related_term( $post_id );
			if ( $term ) {
				return $this->shape_item( $term );
			}
		}

		return $this->shape_item( $post );
	}

	/**
	 * Search posts for a value.
	 *
	 * @param string   $search_value Search string.
	 * @param string[] $post_types Post types.
	 * @param string[] $entity_status Post statuses.
	 * @param string   $taxonomy Optional taxonomy slug.
	 * @param int      $term_id Optional term ID.
	 * @return array
	 */
	protected function search_posts_for_value( $search_value, $post_types = array(), $entity_status = array( 'publish' ), $taxonomy = '', $term_id = 0 ) {
		// Use posts_per_page (WP_Query); keep per-result read_post filtering from FedRAMP pass.
		$query_args = array(
			's'              => $search_value,
			'post_type'      => $post_types,
			'posts_per_page' => 25,
			'post_status'    => $entity_status,
			'post_parent'    => 0,
		);

		if ( $this->should_use_elasticsearch() ) {
			$query_args['es'] = true;
		}

		if ( '' !== $taxonomy && $term_id > 0 ) {
			$query_args['tax_query'] = array( // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_tax_query
				array(
					'taxonomy' => $taxonomy,
					'field'    => 'term_id',
					'terms'    => array( $term_id ),
				),
			);
		}

		/**
		 * Filter WP_Query args for WPEntitySearch post lookups.
		 *
		 * @param array    $query_args     WP_Query args.
		 * @param string   $search_value   Search string.
		 * @param string[] $post_types     Post types.
		 * @param string[] $entity_status  Post statuses.
		 * @param string   $taxonomy       Taxonomy slug or empty.
		 * @param int      $term_id        Term ID or 0.
		 */
		$query_args = apply_filters(
			'prc_wp_entity_search_posts_query',
			$query_args,
			$search_value,
			$post_types,
			$entity_status,
			$taxonomy,
			$term_id
		);

		$query = new WP_Query( $query_args );

		$matches = array();
		foreach ( $query->posts as $post ) {
			if ( ! current_user_can( 'read_post', $post->ID ) ) {
				continue;
			}
			$matches[] = $this->shape_item( $post );
		}
		return $matches;
	}

	/**
	 * Search users for a value.
	 *
	 * @param string $search_value Search string.
	 * @return array|WP_Error
	 */
	protected function search_users_for_value( $search_value ) {
		if ( ! current_user_can( 'list_users' ) ) {
			return new WP_Error(
				'rest_forbidden_user_search',
				__( 'You are not allowed to search users.', 'prc-scripts' ),
				array( 'status' => 403 )
			);
		}

		$args    = array(
			'search'         => '*' . $search_value . '*',
			'search_columns' => array( 'user_login', 'user_nicename', 'display_name' ),
			'number'         => 25,
		);
		$query   = new WP_User_Query( $args );
		$users   = $query->get_results();
		$matches = array();
		foreach ( $users as $user ) {
			if ( $user instanceof WP_User ) {
				$matches[] = $this->shape_user( $user );
			}
		}
		return $matches;
	}

	/**
	 * Search taxonomy for a value.
	 *
	 * @param string   $search_value Search string.
	 * @param string[] $taxonomies Taxonomies.
	 * @return array
	 */
	protected function search_taxonomy_for_value( $search_value, $taxonomies = array() ) {
		$query = new WP_Term_Query(
			array(
				'search'     => $search_value,
				'taxonomy'   => $taxonomies,
				'number'     => 25,
				'hide_empty' => false,
			)
		);

		$matches = array();
		foreach ( $query->get_terms() as $term ) {
			$matches[] = $this->shape_item( $term );
		}
		return $matches;
	}

	/**
	 * Query for a search value.
	 *
	 * @param string   $search_value Search string.
	 * @param string   $entity_type Entity type.
	 * @param string[] $entity_sub_type Subtypes.
	 * @param string[] $entity_status Statuses.
	 * @param string   $taxonomy Optional taxonomy slug.
	 * @param int      $term_id Optional term ID.
	 * @return \WP_REST_Response|WP_Error
	 */
	protected function query_for_search_value( $search_value, $entity_type, $entity_sub_type, $entity_status, $taxonomy = '', $term_id = 0 ) {
		$is_url = filter_var( $search_value, FILTER_VALIDATE_URL );
		if ( $is_url ) {
			$matched = $this->get_id_from_url( $search_value, $entity_status, $taxonomy, $term_id );
			if ( ! empty( $matched->entityId ) ) { // phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase
				return rest_ensure_response( array( $matched ) );
			}
			return rest_ensure_response( array() );
		}

		if ( 'postType' === $entity_type ) {
			return rest_ensure_response(
				$this->search_posts_for_value( $search_value, $entity_sub_type, $entity_status, $taxonomy, $term_id )
			);
		}

		if ( 'taxonomy' === $entity_type ) {
			return rest_ensure_response(
				$this->search_taxonomy_for_value( $search_value, $entity_sub_type )
			);
		}

		if ( 'user' === $entity_type ) {
			$result = $this->search_users_for_value( $search_value );
			if ( is_wp_error( $result ) ) {
				return $result;
			}
			return rest_ensure_response( $result );
		}

		return new WP_Error(
			'invalid_entity_type',
			__( 'Invalid entity_type.', 'prc-scripts' ),
			array( 'status' => 400 )
		);
	}

	/**
	 * Handle entity search REST request.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return \WP_REST_Response|WP_Error
	 */
	public function restfully_handle_wp_entity_search( WP_REST_Request $request ) {
		$search_value = $request->get_param( 'search' );
		$entity_type  = $request->get_param( 'entity_type' );

		if ( ! in_array( $entity_type, self::ALLOWED_ENTITY_TYPES, true ) ) {
			return new WP_Error(
				'invalid_entity_type',
				__( 'Invalid entity_type.', 'prc-scripts' ),
				array( 'status' => 400 )
			);
		}

		$entity_sub_type = $this->sanitize_entity_sub_types(
			$entity_type,
			$this->normalize_string_list( $request->get_param( 'entity_sub_type' ) )
		);
		if ( is_wp_error( $entity_sub_type ) ) {
			return $entity_sub_type;
		}

		$entity_status = $this->sanitize_entity_statuses(
			$request->get_param( 'entity_status' )
		);

		$taxonomy = $this->sanitize_taxonomy( $request->get_param( 'taxonomy' ) );
		$term_id  = absint( $request->get_param( 'term_id' ) );

		return $this->query_for_search_value(
			$search_value,
			$entity_type,
			$entity_sub_type,
			$entity_status,
			$taxonomy,
			$term_id
		);
	}

	/**
	 * Allowlist a taxonomy against REST-visible taxonomies.
	 *
	 * @param mixed $taxonomy Raw taxonomy param.
	 * @return string
	 */
	protected function sanitize_taxonomy( $taxonomy ) {
		$taxonomy = sanitize_key( (string) $taxonomy );
		if ( '' === $taxonomy ) {
			return '';
		}

		$allowed = array_keys( get_taxonomies( array( 'show_in_rest' => true ), 'names' ) );
		return in_array( $taxonomy, $allowed, true ) ? $taxonomy : '';
	}

	/**
	 * Whether Elasticsearch should back keyword search.
	 *
	 * Forcing es=true when ES is down returns empty results instead of MySQL.
	 *
	 * @return bool
	 */
	protected function should_use_elasticsearch() {
		if ( function_exists( 'ep_elasticsearch_alive' ) ) {
			return (bool) ep_elasticsearch_alive();
		}

		return false;
	}

	/**
	 * Register REST routes.
	 *
	 * @hook rest_api_init
	 */
	public function register_rest_endpoints() {
		$endpoint = $this->get_endpoint();
		register_rest_route(
			'prc-api/v3',
			$endpoint['route'],
			array(
				'methods'             => $endpoint['methods'],
				'callback'            => $endpoint['callback'],
				'permission_callback' => $endpoint['permission_callback'],
				'args'                => $endpoint['args'],
			)
		);
	}
}
