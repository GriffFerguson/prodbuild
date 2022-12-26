# Prodbuild
![npm](https://img.shields.io/npm/v/prodbuild)

Easy-to-use minifier and WIP bundler for no-framework websites.

## Documentation
### Install
`npm i --save-dev prodbuild`

### build.config.json
This is Prodbuild's config file. The location of this file is considered the project root folder.

**Parameters:**
- `entry: string`: the path, relative to the project root folder, to the folder containing all source files.
- `output: string`: the path, relative to the project root folder, to the folder to emit all processed files to
- `port: integer`: specify the port for the dev-server
- `exclude: Array<string>`: exclude folders and files, written as an array of strings

Default values:
```json
{
    "entry:": "./src/",
    "output:": "./dist/",
    "port": 5000
}
```

### TypeScript Support
TypeScript is automatically compiled during build and when being served using the dev server.
In order to use Prodbuild with TypeScript, simply import the TypeScript file instead of the JavaScript file.

Ex: 
```html
<script src="script.ts">
```
will be automatically converted to
```html
<script src="script.js">
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

#### `npx prodbuild init`
Create a build.config.json file and setup the corresponding folders.