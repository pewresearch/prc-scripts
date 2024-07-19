<?php
namespace PRC\Platform;
use WP_REST_Request, WP_Error, WP_Query, WP_User_Query, WP_Term_Query;

/**
 * Plugin Name:       PRC Scripts
 * Plugin URI:        https://github.com/pewresearch/prc-scripts
 * Description:       A collection of common scripts, hooks, functions, block controls, and components for the PRC Platform. *If it's shared javascript, it should be here.*
 * Version:           1.0.0
 * Requires at least: 6.4
 * Requires PHP:      8.1
 * Author:            Seth Rubenstein and Ben Wormald
 * Author URI:        https://www.pewresearch.org
 * Text Domain:       prc-scripts
 * License:           GPL v2 or later
 * License URI:       http://www.gnu.org/licenses/gpl-2.0.txt
 */

define( 'PRC_SCRIPTS_DIR_PATH', __DIR__ );

class Scripts {
	public static $script_slugs = [];
	public static $style_slugs = [];
	public static $rest_endpoints = [];

	public function __construct( $init = false ) {
		if ( true === $init ) {
			add_action('init', array($this, 'init_component_rest_endpoints'));
			add_action('wp_enqueue_scripts',    array($this, 'init_first_party_scripts'), 0);
			add_action('wp_enqueue_scripts',    array($this, 'init_third_party_scripts'), 0);
			add_action('wp_enqueue_scripts',    array($this, 'init_third_party_styles'), 0);
			add_action('admin_enqueue_scripts', array($this, 'init_first_party_scripts'), 0);
			add_action('admin_enqueue_scripts', array($this, 'init_third_party_scripts'), 0);
		}
	}

	/**
	 * Register first party scripts.
	 * Fires early, on wp_enqueue_scripts.
	 * @return void
	 */
	public function init_first_party_scripts() {
		// get all folders in the blocks directory as an array
		$directories = glob( plugin_dir_path( __FILE__ )  . 'build/@prc/*', GLOB_ONLYDIR );
		foreach ($directories as $dir) {
			// get contents of index.asset.php file from $dir
			$asset_file  = include( $dir . '/index.asset.php' );
			$script_name = basename($dir);
			$script_slug = 'prc-' . $script_name;
			$script_src  = plugin_dir_url( __FILE__ ) . 'build/@prc/' . $script_name . '/index.js';

			$script = wp_register_script(
				$script_slug,
				$script_src,
				$asset_file['dependencies'],
				$asset_file['version'],
				true
			);

			if ( ! is_wp_error( $script ) ) {
				self::$script_slugs[] = $script_slug;
			}
		}
	}

	/**
	 * Register third party scripts.
	 * Fires early, on wp_enqueue_scripts.
	 * @return void
	 */
	public function init_third_party_scripts() {
		$directories = glob( plugin_dir_path( __FILE__ )  . 'build/third-party/*', GLOB_ONLYDIR );
		foreach ($directories as $dir) {
			// get contents of index.asset.php file from $dir
			$asset_file  = include( $dir . '/index.asset.php' );
			$script_name = basename($dir);
			$script_slug = $script_name;
			$script_src  = plugin_dir_url( __FILE__ ) . 'build/third-party/' . $script_name . '/index.js';

			// Check if index.js file exists and register it if it does.
			if ( file_exists( $dir . '/index.js' ) ) {
				$script = wp_register_script(
					$script_slug,
					$script_src,
					$asset_file['dependencies'],
					$asset_file['version'],
					true
				);
				if ( ! is_wp_error( $script ) ) {
					self::$script_slugs[] = $script_slug;
					if ('firebase' === $script_slug) {
						$this->localize_firebase($script_slug);
					}
				}
			}
		}
	}

	/**
	 * Register third party styles.
	 * Fires early, on wp_enqueue_scripts.
	 * @return void
	 */
	public function init_third_party_styles() {
		$directories = glob( plugin_dir_path( __FILE__ )  . 'build/third-party/*', GLOB_ONLYDIR );
		foreach ($directories as $dir) {
			// get contents of index.asset.php file from $dir
			$asset_file  = include( $dir . '/index.asset.php' );
			$style_name = basename($dir);
			$style_slug = $style_name;
			$style_src  = plugin_dir_url( __FILE__ ) . 'build/third-party/' . $style_name . '/style-index.css';

			// Check if style-index.css file exists and register it if it does.
			if ( file_exists( $dir . '/style-index.css' ) ) {
				$style = wp_register_style(
					$style_slug,
					$style_src,
					[],
					$asset_file['version'],
					'screen'
				);
				if ( ! is_wp_error( $style ) ) {
					self::$style_slugs[] = $style_slug;
				}
			}
		}
	}

	/**
	 * Localize the firebase script, include apiKey, authDomain, etc..
	 */
	public function localize_firebase($script_slug) {
		// check for the fireabse script slug. If its there then localize it.
		$api_key       = \PRC_PLATFORM_FIREBASE_KEY;
		$auth_domain   = \PRC_PLATFORM_FIREBASE_AUTH_DOMAIN;
		$auth_db       = \PRC_PLATFORM_FIREBASE_AUTH_DB;
		$interactives_db = 'https://prc-app-prod-interactives.firebaseio.com';
		$project_id    = \PRC_PLATFORM_FIREBASE_PROJECT_ID;
		wp_localize_script(
			$script_slug,
			'prcFirebaseConfig',
			array(
				'apiKey' => $api_key,
				'authDomain' => $auth_domain,
				'databaseURL' => $auth_db,
				'projectId' => $project_id
			)
		);

		wp_localize_script(
			$script_slug,
			'prcFirebaseInteractivesConfig',
			array(
				'apiKey' => $api_key,
				'databaseURL' => $interactives_db,
				'projectId' => $project_id
			)
		);
	}

	public function init_component_rest_endpoints() {
		// get all folders in the components directory as an array
		$directories = glob( plugin_dir_path( __FILE__ )  . 'src/@prc/components/*', GLOB_ONLYDIR );
		foreach ($directories as $dir) {
			// check if class-wp-rest-api.php file exists and require it
			if ( file_exists( $dir . '/class-wp-rest-api.php' ) ) {
				require_once( $dir . '/class-wp-rest-api.php' );
				$namespace = str_replace('-', '_', basename($dir));
				$class_name = 'Rest_API_Endpoint';
				$full_class_name = 'PRC\Platform\Scripts\\' . $namespace . '\\' . $class_name;
				$endpoint = new $full_class_name();
				self::$rest_endpoints[] = $endpoint->get_endpoint();
			}
		}
	}

}

$prc_scripts = new Scripts(true);

