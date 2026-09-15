<?php
/**
 * Utility functions.
 *
 * @package    PRC\Platform\Scripts_Plugin
 */

// phpcs:disable Universal.Namespaces.DisallowCurlyBraceSyntax -- Scripts_Plugin and Icons share this file.
// phpcs:disable Universal.Namespaces.OneDeclarationPerFile

namespace PRC\Platform\Scripts_Plugin {

	/**
	 * This is a place for "utility" functions.
	 * These are functions meant to be consumed both by this plugin and others, easily.
	 */

	/**
	 * Example utility function.
	 *
	 * @param string $in Input string.
	 * @return string Processed string.
	 */
	function do_some_utility( $in ) {
		$out = 'Utility processed: ' . $in;
		return $out;
	}
	/**
	 * Then to call this:
	 * - In the class, you can use:
	 *   $result = do_some_utility( $input );
	 * - Outside in other plugins, you can use:
	 *   $result = \PRC\Platform\Scripts_Plugin\do_some_utility( $input );
	 */
}

// ---------------------------------------------------------------------------
// Icon rendering (moved from prc-platform-core/includes/icon-loader/icon-render.php).
// PRC-724: curated UI glyphs prefer wp_get_icon( 'prc/{name}' ). Approved
// brands prefer wp_get_icon( 'brands/{name}' ) when registered. Missing
// names return an HTML comment — no Font Awesome Pro sprite fallback.
// ---------------------------------------------------------------------------
namespace PRC\Platform\Icons {

	use WP_HTML_Tag_Processor;

	define( 'PRC_PLATFORM_ICONS_CACHE_TTL', 7 * DAY_IN_SECONDS );
	if ( defined( 'PRC_PLATFORM_VERSION' ) ) {
		define( 'PRC_PLATFORM_ICONS_CACHE_KEY', PRC_PLATFORM_VERSION . '_ICONS_' );
	} else {
		define( 'PRC_PLATFORM_ICONS_CACHE_KEY', '1.0.0_ICONS' );
	}

	/**
	 * Object-cache suffix so sprite-era and badge-era entries are not reused.
	 * PRC_PLATFORM_ICONS_CACHE_KEY still includes the platform version.
	 */
	const CACHE_VERSION = 'prc-no-badge';

	/**
	 * Curated name aliases (old picker/sprite names → PRC fill names).
	 *
	 * @return array<string, string>
	 */
	function icon_name_aliases() {
		return array(
			'column-chart'                  => 'chart-column',
			'pdf'                           => 'file-pdf',
			'x'                             => 'xmark',
			'home'                          => 'house',
			'globe-pointer'                 => 'earth-americas',
			'chart-bar'                     => 'chart-column',
			'building-magnifying-glass'     => 'magnifying-glass',
			'face-viewfinder'               => 'users-viewfinder',
			'filter-list'                   => 'filter',
			'filters'                       => 'filter',
			'lock-hashtag'                  => 'lock',
			'pen-field'                     => 'pen-to-square',
			'table-pivot'                   => 'table',
			'rectangle-history-circle-plus' => 'circle-plus',
			'square-dashed-circle-plus'     => 'circle-plus',
			'arrow-down-small-big'          => 'arrow-down-short-wide',
			'arrow-up-small-big'            => 'arrow-up-short-wide',
			'cards-blank'                   => 'clone',
			'chess-clock'                   => 'stopwatch',
			'clock-two'                     => 'clock',
			'credit-card-front'             => 'credit-card',
			'donut'                         => 'chart-pie',
			'input-text'                    => 'i-cursor',
			'list-radio'                    => 'circle-dot',
			'message-smile'                 => 'comment',
			'rectangle-history'             => 'clone',
			'rectangle-vertical-history'    => 'bars-staggered',
			'shield-exclamation'            => 'shield-halved',
			'slider'                        => 'sliders',
			'chart-bullet'                  => 'chart-simple',
			'hexagon-image'                 => 'image',
			'pen-circle'                    => 'pen',
			'card-spade'                    => 'card',
			'family-dress'                  => 'people-group',
			'undo'                          => 'arrow-rotate-left',
			'arrow-left-rotate'             => 'arrow-rotate-left',
			'arrow-rotate-back'             => 'arrow-rotate-left',
			'arrow-rotate-backward'         => 'arrow-rotate-left',
			'redo'                          => 'arrow-rotate-right',
			'arrow-right-rotate'            => 'arrow-rotate-right',
			'arrow-rotate-forward'          => 'arrow-rotate-right',
			'history'                       => 'clock-rotate-left',
			'chevron-circle-up'             => 'circle-chevron-up',
			'chevron-circle-down'           => 'circle-chevron-down',
			'chevron-circle-left'           => 'circle-chevron-left',
			'chevron-circle-right'          => 'circle-chevron-right',
		);
	}

	/**
	 * Map a historical icon name onto the curated fill name.
	 *
	 * @param mixed $icon_name Icon name.
	 * @return string
	 */
	function resolve_icon_name( $icon_name ) {
		if ( ! is_string( $icon_name ) || '' === $icon_name ) {
			return is_string( $icon_name ) ? $icon_name : '';
		}
		$aliases = icon_name_aliases();
		return $aliases[ $icon_name ] ?? $icon_name;
	}

	/**
	 * Apply the close shortcut: `close` → prc / circle-xmark.
	 * Also remap `column-chart` → `chart-column` and `pdf` → `file-pdf`.
	 *
	 * @param mixed $icon_library Library slug.
	 * @param mixed $icon_name    Icon name.
	 * @return array{0: string, 1: string} Library and name.
	 */
	function apply_icon_shortcut( $icon_library, $icon_name ) {
		$icon_library = is_string( $icon_library ) && '' !== $icon_library ? $icon_library : 'solid';
		if ( ! is_string( $icon_name ) ) {
			$icon_name = '';
		}
		$shortcuts = array(
			'close' => array(
				'library' => 'prc',
				'name'    => 'circle-xmark',
			),
		);
		if ( '' !== $icon_name && array_key_exists( $icon_name, $shortcuts ) ) {
			return array(
				$shortcuts[ $icon_name ]['library'],
				$shortcuts[ $icon_name ]['name'],
			);
		}
		return array( $icon_library, resolve_icon_name( $icon_name ) );
	}

	/**
	 * Brands use collection `brands` when a fill SVG is registered.
	 *
	 * @param string $icon_library Library slug.
	 * @return bool
	 */
	function is_brands_library( $icon_library ) {
		return 'brands' === $icon_library;
	}

	/**
	 * Registry collection slug used for a library/name pair.
	 *
	 * Approved brands use `brands`. Curated UI glyphs use `prc`.
	 *
	 * @param string $icon_library Library slug.
	 * @return string `brands` or `prc`.
	 */
	function registry_collection_for_library( $icon_library ) {
		return is_brands_library( $icon_library ) ? 'brands' : 'prc';
	}

	/**
	 * SVG markup from the WordPress Icon API for a registered glyph.
	 *
	 * Returns empty string when `wp_get_icon` is missing (WP < 7.1) or the
	 * name is not registered. Pixel size is left unset so callers can apply
	 * em-based CSS to match historical `render()` sizing. Brands skip PRC
	 * name aliases.
	 *
	 * @param string $icon_name  Kebab-case name without collection prefix.
	 * @param array  $args       Optional args forwarded to wp_get_icon().
	 * @param string $collection Registry collection (`prc` or `brands`).
	 * @return string
	 */
	function get_registry_icon_svg( $icon_name, $args = array(), $collection = 'prc' ) {
		if ( ! is_string( $icon_name ) || '' === $icon_name ) {
			return '';
		}
		$args = is_array( $args ) ? $args : array();
		if ( ! array_key_exists( 'size', $args ) ) {
			$args['size'] = null;
		}
		$collection = ( 'brands' === $collection ) ? 'brands' : 'prc';
		$resolved   = ( 'brands' === $collection ) ? $icon_name : resolve_icon_name( $icon_name );
		if ( function_exists( 'wp_get_icon' ) ) {
			$svg = wp_get_icon( $collection . '/' . $resolved, $args );
			if ( is_string( $svg ) && '' !== $svg ) {
				return $svg;
			}
		}
		return get_fill_svg_from_disk( $resolved, $collection );
	}

	/**
	 * Read a fill SVG from `prc-icon-library` when the Icon API is absent.
	 *
	 * @param string $icon_name  Kebab-case name without collection prefix.
	 * @param string $collection Registry collection (`prc` or `brands`).
	 * @return string
	 */
	function get_fill_svg_from_disk( $icon_name, $collection = 'prc' ) {
		if ( ! defined( 'PRC_ICON_LIBRARY_DIR' ) ) {
			return '';
		}
		if ( ! is_string( $icon_name ) || 1 !== preg_match( '/^[a-z0-9-]+$/', $icon_name ) ) {
			return '';
		}
		$subdir = ( 'brands' === $collection ) ? 'brands' : 'prc';
		$path   = PRC_ICON_LIBRARY_DIR . 'src/icons/' . $subdir . '/' . $icon_name . '.svg';
		if ( ! is_readable( $path ) ) {
			return '';
		}
		$svg = file_get_contents( $path ); // phpcs:ignore WordPressVIPMinimum.Performance.FetchingRemoteData.FileGetContentsUnknown
		return is_string( $svg ) ? $svg : '';
	}

	/**
	 * Whether this library/name pair should render from a registered collection.
	 *
	 * Curated UI glyphs → `prc/{name}`. Approved brands → `brands/{name}`
	 * when that fill SVG is registered. Missing names → empty.
	 *
	 * @param string $icon_library Library slug.
	 * @param string $icon_name    Icon name.
	 * @return bool
	 */
	function has_registry_icon( $icon_library, $icon_name ) {
		$collection = registry_collection_for_library( $icon_library );
		return '' !== get_registry_icon_svg( $icon_name, array(), $collection );
	}

	/**
	 * Convert the historical size argument to an em CSS length.
	 *
	 * @param float|string $size Size in em units.
	 * @return string
	 */
	function format_icon_size_css( $size ) {
		$size = (float) $size;
		return $size . 'em';
	}

	/**
	 * Class list for the `<i class="icon …">` wrapper (CSS still targets this).
	 *
	 * @param string $icon_library Library slug.
	 * @param string $icon_name    Icon name.
	 * @return string
	 */
	function icon_wrapper_class_names( $icon_library, $icon_name ) {
		return \PRC\BlockUtils\classNames(
			'icon',
			array(
				'icon-library__' . $icon_library,
				'icon__' . $icon_name,
			)
		);
	}

	/**
	 * CSS declarations for a currentColor CSS image (`::after` / `::before`).
	 *
	 * Data URIs cannot inherit `currentColor`. Mask the glyph and paint
	 * `background-color: currentColor` so the inherited color fills the
	 * silhouette. Do not use `filter: invert`.
	 *
	 * @param string $library        Library slug.
	 * @param string $icon           Icon name.
	 * @param string $mask_position  CSS `mask-position` keyword. Defaults to `center`.
	 * @return string CSS declarations (no selector, no braces).
	 */
	function get_icon_mask_declarations( $library, $icon, $mask_position = 'center' ) {
		$uri = get_icon_as_data_uri( $library, $icon, 'black' );
		if ( ! is_string( $uri ) || str_starts_with( trim( $uri ), '<!--' ) ) {
			return '';
		}
		$allowed_positions = array(
			'center',
			'left',
			'right',
			'top',
			'bottom',
			'top left',
			'top right',
			'bottom left',
			'bottom right',
			'left center',
			'right center',
			'center left',
			'center right',
			'top center',
			'bottom center',
		);
		$mask_position     = strtolower( trim( (string) $mask_position ) );
		if ( ! in_array( $mask_position, $allowed_positions, true ) ) {
			$mask_position = 'center';
		}
		return wp_sprintf(
			'background-color: currentColor; background-image: none; -webkit-mask-image: url(%1$s); mask-image: url(%1$s); -webkit-mask-size: contain; mask-size: contain; -webkit-mask-repeat: no-repeat; mask-repeat: no-repeat; -webkit-mask-position: %2$s; mask-position: %2$s;',
			$uri,
			$mask_position
		);
	}

	/**
	 * Set width/height (and optional extra CSS) on the root `<svg>`.
	 *
	 * @param string $svg          SVG markup.
	 * @param string $size_css     CSS length (for example `1em`).
	 * @param string $extra_style  Extra CSS declarations.
	 * @return string
	 */
	function apply_svg_size_style( $svg, $size_css, $extra_style = '' ) {
		if ( ! class_exists( 'WP_HTML_Tag_Processor' ) ) {
			return $svg;
		}
		$processor = new WP_HTML_Tag_Processor( $svg );
		if ( ! $processor->next_tag( array( 'tag_name' => 'svg' ) ) ) {
			return $svg;
		}
		$size_style = 'width: ' . $size_css . '; height: ' . $size_css . ';';
		if ( '' !== $extra_style ) {
			$size_style .= ' ' . $extra_style;
		}
		$existing = $processor->get_attribute( 'style' );
		if ( is_string( $existing ) && '' !== trim( $existing ) ) {
			$size_style = rtrim( $existing, ';' ) . '; ' . $size_style;
		}
		$processor->set_attribute( 'style', $size_style );
		return $processor->get_updated_html();
	}

	/**
	 * Object-cache key. Includes CACHE_VERSION so sprite-era markup is not reused.
	 *
	 * @param string $icon_library Library slug.
	 * @param string $icon_name    Icon name.
	 * @param string $extra        Size, fill, or other distinguisher.
	 * @return string
	 */
	function icon_cache_key( $icon_library, $icon_name, $extra ) {
		return md5( $icon_library . '_' . $icon_name . '_' . $extra . '_' . PRC_PLATFORM_ICONS_CACHE_KEY . '_' . CACHE_VERSION );
	}

	/**
	 * Render an icon from the library of your choice.
	 * This function will never error out, but will log errors to the PHP error log. This should always gracefully fail and never stop the page from rendering.
	 *
	 * Curated UI glyphs use `wp_get_icon( 'prc/{name}' )` when the Icon API is
	 * present and the name is registered. Approved brands use
	 * `wp_get_icon( 'brands/{name}' )` when registered. Missing names return
	 * an HTML comment (no sprite `<use>` path).
	 *
	 * @param string       $icon_library The library to use. Defaults to 'prc'.
	 * @param string       $icon_name The name of the icon to render.
	 * @param float|string $size The size of the icon in em units.
	 *
	 * @return string|void The rendered icon.
	 */
	function render( $icon_library = 'prc', $icon_name = 'circle-plus', $size = 1 ) {
		list( $icon_library, $icon_name ) = apply_icon_shortcut( $icon_library, $icon_name );

		$icon_cache_group = 'prc_icons__rendered';
		$icon_cache_key   = icon_cache_key( $icon_library, $icon_name, (string) $size );
		$icon             = wp_cache_get( $icon_cache_key, $icon_cache_group );
		if ( false !== $icon ) {
			return $icon;
		}

		$size_css = format_icon_size_css( $size );

		if ( has_registry_icon( $icon_library, $icon_name ) ) {
			$collection  = registry_collection_for_library( $icon_library );
			$svg         = apply_svg_size_style( get_registry_icon_svg( $icon_name, array(), $collection ), $size_css );
			$icon_markup = wp_sprintf(
				'<i class="%1$s">%2$s</i>',
				icon_wrapper_class_names( $icon_library, $icon_name ),
				$svg
			);
			wp_cache_set( $icon_cache_key, $icon_markup, $icon_cache_group, PRC_PLATFORM_ICONS_CACHE_TTL );
			return $icon_markup;
		}

		return '<!-- Error: icon not in curated PRC or approved brands. -->';
	}

	/**
	 * Get the URL for an icon.
	 *
	 * Fill-sheet fragment for curated `prc/{name}` and approved `brands/{name}`.
	 * Missing names return an HTML comment. Prefer `get_icon_as_svg()` or
	 * `render()` for registry markup.
	 *
	 * @param string $library The library to use.
	 * @param string $icon The name of the icon.
	 *
	 * @return string URL representing the icon.
	 */
	function get_icon_as_url( $library, $icon ) {
		if ( ! defined( 'PRC_PLATFORM_ICONS_URL' ) ) {
			return '<!-- Error: PRC_PLATFORM_ICONS_URL is not defined. -->';
		}
		if ( ! has_registry_icon( $library, $icon ) ) {
			return '<!-- Error: icon not in curated PRC or approved brands. -->';
		}
		$collection = registry_collection_for_library( $library );
		$resolved   = ( 'brands' === $collection ) ? $icon : resolve_icon_name( $icon );
		return rtrim( PRC_PLATFORM_ICONS_URL, '/' ) . '/' . $collection . '.svg#' . $resolved;
	}

	/**
	 * Get the icon as a usable `<svg/>`.
	 *
	 * Curated names return registry SVG (with optional fill override). Approved
	 * brands return `brands/{name}` when registered. Missing names return an
	 * HTML comment — no Font Awesome sprite fallback.
	 *
	 * @param string $library The library to use.
	 * @param string $icon The name of the icon.
	 * @param string $fill_color The color to use for the fill attribute. Defaults to 'currentColor'.
	 *
	 * @return string The icon as an SVG.
	 */
	function get_icon_as_svg( $library, $icon, $fill_color = 'currentColor' ) {
		list( $library, $icon ) = apply_icon_shortcut( $library, $icon );

		$icon_cache_group = 'prc_icons__svg';
		$icon_cache_key   = icon_cache_key( $library, $icon, $fill_color );

		$cached = wp_cache_get( $icon_cache_key, $icon_cache_group );

		if ( false !== $cached ) {
			return $cached;
		}

		if ( has_registry_icon( $library, $icon ) ) {
			$collection  = registry_collection_for_library( $library );
			$icon_markup = get_registry_icon_svg( $icon, array(), $collection );
			if ( 'currentColor' !== $fill_color ) {
				$icon_markup = str_replace( 'fill="currentColor"', 'fill="' . esc_attr( $fill_color ) . '"', $icon_markup );
			}
			wp_cache_set( $icon_cache_key, $icon_markup, $icon_cache_group, PRC_PLATFORM_ICONS_CACHE_TTL );
			return $icon_markup;
		}

		return '<!-- Error: icon not in curated PRC or approved brands. -->';
	}

	/**
	 * Prepare SVG markup for a CSS image (`mask-image` / `background-image` data URI).
	 *
	 * `data:image/svg+xml` is parsed as XML. WordPress kses / `wp_get_icon()` emit
	 * lowercase `viewbox` (valid in HTML, ignored in XML), so the glyph is drawn
	 * into the default 300×150 viewport and CSS `mask-size: contain` shows only a
	 * sliver. Force camelCase `viewBox`, intrinsic width/height, and an opaque
	 * fill (`currentColor` does not inherit inside a data URI).
	 *
	 * @param string $svg        SVG markup from get_icon_as_svg().
	 * @param string $fill_color Requested fill. `currentColor` becomes `black`.
	 * @return string XML-safe SVG markup.
	 */
	function prepare_svg_for_css_image( $svg, $fill_color = 'currentColor' ) {
		if ( class_exists( 'WP_HTML_Tag_Processor' ) ) {
			$processor = new WP_HTML_Tag_Processor( $svg );
			if ( $processor->next_tag( array( 'tag_name' => 'svg' ) ) ) {
				if ( ! $processor->get_attribute( 'xmlns' ) ) {
					$processor->set_attribute( 'xmlns', 'http://www.w3.org/2000/svg' );
				}
				$view_box = $processor->get_attribute( 'viewBox' );
				if ( ! is_string( $view_box ) || '' === $view_box ) {
					$view_box = '0 0 24 24';
				}
				// Rewrite so the serializer emits camelCase `viewBox`, not `viewbox`.
				$processor->set_attribute( 'viewBox', $view_box );
				if ( ! $processor->get_attribute( 'width' ) ) {
					$processor->set_attribute( 'width', '24' );
				}
				if ( ! $processor->get_attribute( 'height' ) ) {
					$processor->set_attribute( 'height', '24' );
				}
				$svg = $processor->get_updated_html();
			}
		}

		$svg = preg_replace( '/\bviewbox=/i', 'viewBox=', $svg );
		if ( ! is_string( $svg ) ) {
			return '';
		}

		$paint = ( 'currentColor' === $fill_color ) ? 'black' : $fill_color;
		if ( 'currentColor' !== $paint ) {
			$svg = str_replace( 'fill="currentColor"', 'fill="' . esc_attr( $paint ) . '"', $svg );
		}

		return $svg;
	}

	/**
	 * Get the icon as a data URI.
	 * Useful for inlining icons in CSS (`mask-image`, `background-image`).
	 *
	 * For a currentColor silhouette on `::after`, use
	 * `get_icon_mask_declarations()` (mask + `currentColor`).
	 *
	 * @param string $library The library to use.
	 * @param string $icon The name of the icon.
	 * @param string $fill_color The color to use for the fill attribute. Defaults to 'currentColor'.
	 *
	 * @return string Encoded data URI representing the icon.
	 */
	function get_icon_as_data_uri( $library, $icon, $fill_color = 'currentColor' ) {
		$icon_cache_group = 'prc_icons__data_uri';
		$icon_cache_key   = icon_cache_key( $library, $icon, $fill_color );
		$cached           = wp_cache_get( $icon_cache_key, $icon_cache_group );
		if ( false !== $cached ) {
			return $cached;
		}

		$icon = get_icon_as_svg( $library, $icon, $fill_color );
		if ( ! is_string( $icon ) || str_starts_with( trim( $icon ), '<!--' ) ) {
			return $icon;
		}
		$icon = prepare_svg_for_css_image( $icon, $fill_color );
		$icon = rawurlencode( $icon );
		$icon = 'data:image/svg+xml,' . $icon;
		wp_cache_set( $icon_cache_key, $icon, $icon_cache_group, PRC_PLATFORM_ICONS_CACHE_TTL );
		return $icon;
	}
}
