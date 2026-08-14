<?php
/**
 * Shared WordPress Boot adapter for PRC React settings pages.
 *
 * @package PRC\Platform
 */

declare( strict_types=1 );

namespace PRC\Platform;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Renders the Boot mount node and starts initSinglePage for settings apps.
 *
 * Plugin settings bundles stay classic scripts (DataForm / @wordpress/data are
 * not script modules). A tiny ESM stage() reads window.prcSettingsPageStage.
 */
final class Settings_Page_Boot {
	public const CONTENT_MODULE_ID = '@prc/settings-page/content';
	public const PAGE_MODULE_ID    = '@prc/settings-page/page';

	/**
	 * Container ids for which Boot was started this request.
	 *
	 * admin_enqueue_scripts runs before the page callback, so render() can
	 * fall back to classic .wrap when Boot files exist but the plugin skipped
	 * enqueue (e.g. missing index.asset.php) and would otherwise print an
	 * empty stage that hides every other #wpbody-content sibling.
	 *
	 * @var array<string, true>
	 */
	private static array $enqueued_containers = array();

	/**
	 * Whether Gutenberg Boot and the shared settings stage module can run.
	 */
	public static function is_available(): bool {
		if ( ! function_exists( 'wp_register_script_module' ) || ! function_exists( 'wp_enqueue_script_module' ) ) {
			return false;
		}

		$content = self::get_content_module_path();
		$loader  = self::get_loader_module_path();
		if ( ! file_exists( $content ) || ! file_exists( $loader ) ) {
			return false;
		}

		return is_array( self::get_gutenberg_boot_asset() );
	}

	/**
	 * Print the settings mount node. Boot path uses boot-layout-container.
	 *
	 * @param string $container_id DOM id shared with mountSettingsPage().
	 */
	public static function render( string $container_id ): void {
		if ( self::is_available() && isset( self::$enqueued_containers[ $container_id ] ) ) {
			self::print_boot_layout_styles();
			printf(
				'<div id="%s" class="boot-layout-container"></div>',
				esc_attr( $container_id )
			);
			return;
		}

		printf(
			'<div class="wrap"><div id="%s"></div></div>',
			esc_attr( $container_id )
		);
	}

	/**
	 * Start Boot after the plugin's classic settings handle is enqueued.
	 *
	 * @param string $script_handle Classic settings script handle.
	 * @param string $version       Asset version shared with the classic bundle.
	 * @param string $container_id  Mount node id.
	 */
	public static function enqueue( string $script_handle, string $version, string $container_id ): void {
		if ( ! self::is_available() ) {
			return;
		}

		$boot_asset = self::get_gutenberg_boot_asset();
		if ( ! is_array( $boot_asset ) ) {
			return;
		}

		$boot_deps = (array) ( $boot_asset['dependencies'] ?? array() );
		self::merge_script_dependencies( $script_handle, $boot_deps );
		self::enqueue_boot_styles( $boot_deps, $version );
		self::enqueue_boot_runtime( $script_handle, $version, $container_id );
		self::$enqueued_containers[ $container_id ] = true;
	}

	/**
	 * Path to Gutenberg's generated @wordpress/boot asset file.
	 */
	public static function get_gutenberg_boot_asset_path(): string {
		return dirname( PRC_SCRIPTS_DIR ) . '/gutenberg/build/modules/boot/index.min.asset.php';
	}

	/**
	 * Gutenberg boot asset.php payload, or null when missing.
	 *
	 * @return array<string, mixed>|null
	 */
	public static function get_gutenberg_boot_asset(): ?array {
		$path = self::get_gutenberg_boot_asset_path();
		if ( ! file_exists( $path ) ) {
			return null;
		}

		$asset = include $path;
		return is_array( $asset ) ? $asset : null;
	}

	/**
	 * Built ESM stage module path.
	 */
	public static function get_content_module_path(): string {
		return PRC_SCRIPTS_DIR . '/includes/scripts/build/@prc/components/boot/content.js';
	}

	/**
	 * Built dummy page loader path.
	 */
	public static function get_loader_module_path(): string {
		return PRC_SCRIPTS_DIR . '/includes/scripts/build/@prc/components/boot/loader.js';
	}

	/**
	 * Merge Boot classic-script deps onto an already-registered handle.
	 *
	 * @param string   $handle Script handle.
	 * @param string[] $extra  Extra dependency handles.
	 */
	private static function merge_script_dependencies( string $handle, array $extra ): void {
		$scripts = wp_scripts();
		if ( ! isset( $scripts->registered[ $handle ] ) ) {
			return;
		}

		$scripts->registered[ $handle ]->deps = array_values(
			array_unique(
				array_merge(
					(array) $scripts->registered[ $handle ]->deps,
					$extra
				)
			)
		);
	}

	/**
	 * Enqueue Boot's registered styles as a prerequisites stylesheet.
	 *
	 * @param string[] $boot_deps Boot asset script handles (some are also styles).
	 * @param string   $version   Asset version.
	 */
	private static function enqueue_boot_styles( array $boot_deps, string $version ): void {
		$style_dependencies = array_values(
			array_filter(
				$boot_deps,
				static function ( $handle ): bool {
					return is_string( $handle ) && wp_style_is( $handle, 'registered' );
				}
			)
		);

		wp_register_style( 'prc-settings-page-boot', false, $style_dependencies, $version );
		wp_enqueue_style( 'prc-settings-page-boot' );
	}

	/**
	 * Register the shared stage module and start initSinglePage.
	 *
	 * @param string $script_handle Classic settings script handle.
	 * @param string $version       Asset version.
	 * @param string $container_id  Mount node id.
	 */
	private static function enqueue_boot_runtime( string $script_handle, string $version, string $container_id ): void {
		wp_register_script_module(
			self::CONTENT_MODULE_ID,
			plugins_url( 'includes/scripts/build/@prc/components/boot/content.js', PRC_SCRIPTS_FILE ),
			array(),
			$version
		);

		$routes = array(
			array(
				'path'           => '/',
				'content_module' => self::CONTENT_MODULE_ID,
			),
		);

		$init_js_function = <<<'JS'
		( mountId, routes, initModules ) => {
			const run = async () => {
				const mod = await import( "@wordpress/boot" );
				mod.initSinglePage( { mountId, routes, initModules } );
			};
			if ( document.readyState === "loading" ) {
				document.addEventListener( "DOMContentLoaded", run );
			} else {
				run();
			}
		}
		JS;

		wp_add_inline_script(
			$script_handle,
			sprintf(
				'( %s )( %s, %s, %s );',
				$init_js_function,
				wp_json_encode( $container_id, JSON_HEX_TAG | JSON_UNESCAPED_SLASHES ),
				wp_json_encode( $routes, JSON_HEX_TAG | JSON_UNESCAPED_SLASHES ),
				wp_json_encode( array(), JSON_HEX_TAG | JSON_UNESCAPED_SLASHES )
			)
		);

		$boot_dependencies = array(
			array(
				'import' => 'static',
				'id'     => '@wordpress/boot',
			),
			array(
				'import' => 'dynamic',
				'id'     => self::CONTENT_MODULE_ID,
			),
		);

		wp_register_script_module(
			self::PAGE_MODULE_ID,
			plugins_url( 'includes/scripts/build/@prc/components/boot/loader.js', PRC_SCRIPTS_FILE ),
			$boot_dependencies,
			$version
		);
		wp_enqueue_script_module( self::PAGE_MODULE_ID );
	}

	/**
	 * Critical Boot layout CSS. Copied from Gutenberg's generated page-wp-admin.php.
	 */
	private static function print_boot_layout_styles(): void {
		echo '<style>
			#wpwrap { overflow-y: auto; }
			body { background: #fff; }
			#wpcontent { padding-inline-start: 0; }
			#wpbody-content { padding-bottom: 0; }
			#wpbody-content > div:not(.boot-layout-container):not(#screen-meta) { display: none; }
			#wpfooter { display: none; }
			.a11y-speak-region { inset-inline-start: -1px; top: -1px; }
			ul#adminmenu a.wp-has-current-submenu::after,
			ul#adminmenu > li.current > a.current::after { border-inline-end-color: #fff; }
			.media-frame select.attachment-filters:last-of-type { width: auto; max-width: 100%; }
			@media (min-width: 782px) {
				#wpwrap { overflow-y: initial; }
			}
		</style>';
	}
}
