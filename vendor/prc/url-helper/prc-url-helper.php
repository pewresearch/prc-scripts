<?php
/**
 * Plugin Name:       PRC URL Helper
 * Description:       Loads Composer autoload for the prc/url-helper library (test / wp-env entry).
 * Version:           1.0.0
 * Requires at least: 6.7
 * Requires PHP:      8.2
 * Author:            Pew Research Center
 * License:           GPL-2.0-or-later
 * Text Domain:       prc-url-helper
 *
 * @package PRC\URL_Helper
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$prc_url_helper_autoload = __DIR__ . '/vendor/autoload.php';
if ( file_exists( $prc_url_helper_autoload ) ) {
	require_once $prc_url_helper_autoload;
}
unset( $prc_url_helper_autoload );
