# Prodbuild
![npm](https://img.shields.io/npm/v/prodbuild)

Easy-to-use minifier and WIP bundler for no-framework websites.

## Documentation
Please operate Prodbuild out of the root folder of your project.

### Install
`npm i --save-dev prodbuild`

### build.config.json
**Parameters:**
- `entry: string`: the path, relative to the project root folder, to the folder containing all source files.
- `output: string`: the path, relative to the project root folder, to the folder to emit all processed files to
- `port: integer`: specify the port for the dev-server
- `exclude: Array<string>`: exclude folders and files, written as an array of strings

If no build.config.json is available in the active directory, the default values will be used.

Default values:
```json
{
    "entry:": "./src/",
    "output:": "./dist/",
    "port": 5000
}
```

### Commands
#### `npx prodbuild build`
Minifies and uglifies all HTML, CSS, and JS/TS files in the specified entry folder (default is './src/') and emits all files to the specified output folder (default is './dist/').

See the above section for information regarding entry and output folders.

Note: TypeScript files are transpiled as part of the build process.

#### `npx prodbuild serve`
**Arguments**
- `start`: start the dev server at the specified port (default is 5000). This will open in the folder specified in `config.entry` unless used with `--prod` (see below)
- `kill`: stop the dev server

**Options**:
- `--prod`: starts the dev server in the production (output) directory
- `--purge`: purge all messages in `.prodbuildrc/log.txt`