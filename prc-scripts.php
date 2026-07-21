<?php
/**
 * PRC Scripts
 *
 * @package           PRC_Scripts_Plugin
 * @author            Seth Rubenstein
 * @copyright         2024 Pew Research Center
 * @license           GPL-2.0-or-later
 *
 * @wordpress-plugin
 * Plugin Name:       PRC Scripts
 * Plugin URI:        https://github.com/pewresearch/prc-scripts
 * Description:       Shared first-party (@prc/*) and third-party JavaScript, stylesheets, and script modules for all PRC Platform plugins.
 * Version:           1.0.0
 * Requires at least: 6.8
 * Requires PHP:      8.2
 * Author:            Pew Research Center
 * Author URI:        https://pewresearch.org
 * License:           GPL-2.0+
 * License URI:       http://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain:       prc-scripts
 */

namespace PRC\Platform\Scripts_Plugin;

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}


define( 'PRC_SCRIPTS_FILE', __FILE__ );
define( 'PRC_SCRIPTS_DIR', __DIR__ );
define( 'PRC_SCRIPTS_VERSION', '1.0.0' );

/**
 * Helper utilities
 */
require plugin_dir_path( __FILE__ ) . 'includes/utils.php';

/**
 * The core bootstrap class that is used to define the hooks that initialize the various components.
 */
require plugin_dir_path( __FILE__ ) . 'includes/class-bootstrap.php';

/**
 * Begins execution of the plugin.
 *
 * Since everything within the plugin is registered via hooks,
 * then kicking off the plugin from this point in the file does
 * not affect the page life cycle.
 *
 * @since    1.0.0
 */
function run_prc_scripts() {
	$plugin = new Bootstrap();
	$plugin->run();
}
run_prc_scripts();
