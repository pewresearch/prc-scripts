<?php
/**
 * PRC Core Block Library
 *
 * @package           PRC_Scripts
 * @author            Seth Rubenstein
 * @copyright         2022 Pew Research Center
 * @license           GPL-2.0-or-later
 *
 * @wordpress-plugin
 * Plugin Name:       PRC Scripts
 * Plugin URI:        https://github.com/pewresearch/pewresearch-org
 * Description:       A collection of scripts used by Pew Research Center in PRC App.
 * Version:           1.0.0
 * Requires at least: 6.1
 * Requires PHP:      8.0
 * Author:            Seth Rubenstein
 * Author URI:        https://sethrubenstein.info
 * Text Domain:       prc-scripts
 * License:           GPL v2 or later
 * License URI:       http://www.gnu.org/licenses/gpl-2.0.txt
 */

namespace PRC;

define( 'PRC_SCRIPTS_DIR', __DIR__ );

class PRC_Scripts {
	public function __construct( $init = false ) {
		if ( true === $init ) {

		}
	}

	public function init_first_party_scripts() {
		// get all folders in the blocks directory as an array
		$directories = glob( PRC_SCRIPTS_DIR . '/build/@prc/*', GLOB_ONLYDIR );
		foreach ($directories as $dir) {
			$script = basename($dir);
			// get index.asset.php file from $dir
			$asset = require PRC_SCRIPTS_DIR . '/build/@prc/' . $script . '/index.asset.php';

			wp_register_script(
				'prc-first-party-' . $script,
				plugins_url( wp_normalize_path( realpath( $asset ) ) . 'index.js', PRC_SCRIPTS_DIR ),
				$asset['dependencies'],
				$asset['version'],
				true
			);
		}
	}

	public function register_scripts() {

	}
}

new PRC_Scripts(true);
