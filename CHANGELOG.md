# Prodbuild Change Log

## v1.6.5
- Proper binary file support for dev server
- Dev server will no longer throw errors preventing shutdown due to a crash

## v1.6.4
- Binary files are properly supported

## v1.6.3
- CSS minifier now removes comments
- CSS minifier now removes whitespace correctly
- HTML minifier also removes comments correctly

## v1.6.2
- Add caching system to dev server (basis for hot module replacement)
- Add TypeScript support to dev server
- Fix some status messages
- Prepare to add control panel to dev server
- TypeScript can be directly imported into HTML files, TypeScript will be compiled and imports will update to point to the new JavaScript file during build (also works with dev server)

## v1.6.1
- Fix an issue where a .gitignore file in the root project folder would be overridden on dev server start

## v1.6.0
- Brand new advanced dev server
- Update documentation

## v1.5.0
- Improve documentation
- Improve how default config is loaded
- Add proprietary minifier for HTML
- Add proprietary minifier for CSS
- Minifiers can now be imported
- Add TypeScript declarations for minifier functions

## v1.4.1
- Fix errors when processing TypeScript

## v1.4.0
- Add TypeScript support

## v1.3.2
- Add change log
- Fix typos in README

## v1.3.1
- Add folder exclsuion
- Remove console messages used for debugging

## v1.3.0
- Add file exclusion

## v1.2.3
- Fix errors being thrown during build

## v1.2.2
- Fix dev server throwing an error on start

## v1.2.1
- Fix issues with the dev server

## v1.2.0
- Add documentation to README

## v1.1.1
- More dev server options
- Add a default build configuration

## v1.0.1
- Correct repository links in package.json
- Add dev server
- Ensure files other than HTMl, CSS, and JS are copied as is
- Ensure folder structure is preserved
- Move from cssnano to CSSO

## v1.0.0
- Initial release
- Only minification of HTML, CSS, and JS