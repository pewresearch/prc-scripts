<?php
namespace PRC\Platform;
/**
 * Plugin Name:       PRC Scripts
 * Plugin URI:        https://github.com/pewresearch/prc-scripts
 * Description:       A collection of common scripts, hooks, functions, block controls, and components for the PRC Platform. *If it's shared javascript, it should be here.*
 * Version:           1.0.0
 * Requires at least: 6.1
 * Requires PHP:      8.1
 * Author:            Seth Rubenstein and Ben Wormald
 * Author URI:        https://www.pewresearch.org
 * Text Domain:       prc-scripts
 * License:           GPL v2 or later
 * License URI:       http://www.gnu.org/licenses/gpl-2.0.txt
 */

define( 'PRC_SCRIPTS_DIR_PATH', __DIR__ );

class Scripts {
	public static $script_slugs = array();

	public function __construct( $init = false ) {
		if ( true === $init ) {
			add_action('wp_enqueue_scripts',    array($this, 'init_first_party_scripts'), 0);
			add_action('wp_enqueue_scripts',    array($this, 'init_third_party_scripts'), 0);
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
	 * Localize the firebase script, include apiKey, authDomain, etc..
	 */
	public function localize_firebase($script_slug) {
		// check for the fireabse script slug. If its there then localize it.
		$api_key       = \PRC_PLATFORM_FIREBASE_KEY;
		$auth_domain   = \PRC_PLATFORM_FIREBASE_AUTH_DOMAIN;
		$auth_db       = \PRC_PLATFORM_FIREBASE_AUTH_DB;
		$interactives_db = \PRC_PLATFORM_FIREBASE_INTERACTIVES_DB;
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

	public function init_modules() {
		// @TODO: Placeholder for now, we'll start work on defining our modules here for the new importmap modules system.
	}

}

$prc_scripts = new Scripts(true);

