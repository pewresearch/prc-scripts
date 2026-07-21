# prc/url-helper

![Tests](https://github.com/pewresearch/prc-url-helper/actions/workflows/test.yml/badge.svg)

Resolve any WordPress URL — preview link, wp-admin edit link, or canonical post URL — to its underlying post ID.

## Install

```bash
composer require prc/url-helper
```

The library is loaded via Composer's `autoload.files`, so the `\PRC\URL_Helper` class is available as soon as the consuming plugin or theme loads `vendor/autoload.php` (or [Jetpack Autoloader](https://github.com/Automattic/jetpack-autoloader)).

## What it does

Given a URL string, `URL_Helper` determines the corresponding post ID by trying multiple resolution strategies in order:

1. Preview link (`?preview=true&p=...` or `?preview=true&preview_id=...`)
2. wp-admin edit link (`/wp-admin/post.php?action=edit&post=...`)
3. Canonical post URL — uses [`wpcom_vip_url_to_postid()`](https://docs.wpvip.com/technical-references/vip-helper-functions/) when available, otherwise falls back to WordPress core's [`url_to_postid()`](https://developer.wordpress.org/reference/functions/url_to_postid/)

## Usage

```php
use PRC\URL_Helper;

$helper = new URL_Helper( 'https://www.pewresearch.org/internet/2024/01/some-report/' );

if ( ! is_wp_error( $helper->post_id ) ) {
    $post_id = $helper->post_id;
}
```

Returns `WP_Error` with code `404` if:

- The value is not a string
- The value is not a valid URL
- No matching post is found

## Migrating from `PRC\Platform\URL_Helper`

This package was extracted from `prc-platform-core/includes/url-helper`. The namespace shrank from `PRC\Platform` to `PRC`; the class name is unchanged.

```diff
- use PRC\Platform\URL_Helper;
+ use PRC\URL_Helper;

- $helper = new \PRC\Platform\URL_Helper( $url );
+ $helper = new \PRC\URL_Helper( $url );
```

## Development & tests

```bash
composer install
npm install
npm run env:start
npm run env:install-tests   # one-time
npm test                     # unit + integration
```

## License

GPL-2.0-or-later.
