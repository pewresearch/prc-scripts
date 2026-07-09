# PRC Scripts

Shared first-party (`@prc/*`) and third-party JavaScript, stylesheets, and script modules for all PRC Platform plugins.

This plugin owns the `Scripts` and `Script_Modules` registration classes that were previously bundled inside `prc-platform-core`. Every leaf `prc-*` plugin that consumes shared script handles (e.g. `prc-components`, `prc-controls`, `prc-charting-utilities`) declares `Requires Plugins: prc-scripts` in its main plugin file header.

PHP namespaces (`PRC\Platform\Scripts`, `PRC\Platform\Script_Modules`) are unchanged from the previous home so REST API endpoint classes that hardcode them keep working.

## Layout

- `includes/scripts/` — first-party `@prc/*` and third-party JavaScript / CSS source + build artifacts.
- `includes/script-modules/` — `@prc/d3` and `@prc/topojson` script modules.
- `includes/class-bootstrap.php` — wires the moved classes into the new plugin's `Loader`.

## Load order

`prc-scripts` is registered in `client-mu-plugins/plugin-loader.php` after `prc-icon-library` / `prc-post-publish-pipeline` and immediately before `prc-block-library`, ensuring its handles are available before any plugin that lists it in `Requires Plugins:`.

## Storybook

The monorepo ships a **root Storybook** (`.storybook/`) that discovers stories colocated with `@prc/*` modules under `plugins/prc-scripts/includes/scripts/src/@prc/` and chart stories under `plugins/prc-charting-library/src/`. This mirrors the centralized Playwright setup — one config at the repo root, stories next to the components they document.

```bash
# Dev server (http://localhost:6006)
npm run storybook

# Static build
npm run build-storybook
```

### How it differs from production builds

Production webpack builds externalize every `@prc/*` import to `window.*` globals via `dependency-extraction.js`. Storybook inverts that: `.storybook/main.ts` aliases `@prc/components`, `@prc/controls`, `@prc/hooks`, `@prc/icons`, `@prc/functions`, `@prc/charting-utilities`, and `@prc/charting-library` to their source trees so components render with real imports.

Charting-library stories additionally alias `useChartStore` to its editor stub (`useChartStore.editor.ts`) so Interactivity API state is not pulled into the browser bundle.

### Mocks and decorators

| Path | Purpose |
| --- | --- |
| `.storybook/mocks/api-fetch-handlers.ts` | Offline REST fixtures for `apiFetch` (terms, posts, Mailchimp segments, etc.) |
| `.storybook/mocks/window-globals.ts` | Seeds `window.prc*` globals when a story needs production-style externals |
| `.storybook/decorators/with-editor.tsx` | Minimal block-editor shell |
| `.storybook/decorators/with-block-editor.tsx` | Full inserter + block canvas for editor-dependent components |

Import decorators via the `@prc-storybook` alias (e.g. `import { withBlockEditor } from '@prc-storybook/decorators/with-block-editor'`).

### Adding a story

1. Colocate `*.stories.tsx` (or `*.mdx`) next to the component under `plugins/prc-scripts/includes/scripts/src/@prc/<package>/`.
2. For editor-dependent UI, wrap with `withBlockEditor` or `withEditor`.
3. For REST-backed controls, add or extend fixtures in `.storybook/mocks/api-fetch-handlers.ts`.
4. Icon stories rely on committed FontAwesome sprites served from `.storybook/main.ts` `staticDirs` at the same `/wp-content/plugins/prc-icon-library/...` path production uses.

Charting-library chart type stories live under `plugins/prc-charting-library/src/` and are picked up by the same root config.
