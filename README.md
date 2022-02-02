# Prodbuild

Easy-to-use minifier and WIP bundler for no-framework websites.

## Documentation
Please operate prodbuild out of the root folder of your project.

### Install
`npm i --save-dev prodbuild`

### build.config.json
**Parameters:**
- Entry: the path, relative to the project root folder, to the folder containing all source files.
- Output: the path, relative to the project root folder, to the folder to emit all processed files to
- Port: specify the port for the dev-server

If no build.config.json is available in the active directory, the defauly values will be used.

Default values:
```json
{
    "entry:": "./src/",
    "output:": "./dist/",
    "port": 5000
}
```

### `prodbuild build`
Minifies and uglifies all HTML, CSS, and JS files in the specified entry folder (default is './src/') and emits all files to the specified output folder (default is './dist/').

See the above section for information regarding entry and output folders.

### `prodbuild serve`
Start the dev server at the specified port (default is 5000).

**Options**:
- `--dev` (default): starts the dev server in the entry directory
- `--prod`: starts the dev server in the production (output) directory