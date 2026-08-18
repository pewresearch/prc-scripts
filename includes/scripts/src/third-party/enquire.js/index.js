/**
 * Shared enquire.js global (`window.enquire`) for webpack externals.
 *
 * Interactive features externalize `import enquire from 'enquire.js'` to the
 * `enquire` window global (WP script handle `enquire.js`). Export the package
 * default and pair with `library.export: 'default'` so production sets
 * `window.enquire` to the MediaQueryDispatch API (with `.register`), not a
 * webpack namespace object `{ default: enquire }`.
 */
export { default } from 'enquire.js';
