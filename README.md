# Prodbuild
![npm](https://img.shields.io/npm/v/prodbuild)

Easy-to-use minifier, dev server, and work-in-progress bundler for no-framework websites. Also partially an experimentation in compliation, transpilation, minification, bundling, and general site building/packaging.

## Install
`npm i --save-dev prodbuild`

## Documentation

### build.config.json
This is Prodbuild's config file. The location of this file is considered the project root folder.

**Parameters:**
- `entry: string`: the path, relative to the project root folder, to the folder containing all source files.
- `output: string`: the path, relative to the project root folder, to the folder to emit all processed files to
- `port: integer`: specify the port for the dev-server
- `exclude: Array<string>`: exclude folders and files, written as an array of strings (ex: `["file.html", ".txt", "images/"]` excludes the file called file.html, all ".txt" files, and all files in the folder "images")

Default values:
```json
{
    "entry:": "./src/",
    "output:": "./dist/",
    "port": 5000,
    "exclude": [".ts"]
}
```

### TypeScript Support
**Do not specify an `outFile` or `outDir`.** Prodbuild will automatically run `tsc` on every build. The builder will then take the emitted JavaScript files and treat them as normal JavaScript files. `.ts` files will by be excluded from the project during building.

When using the dev server, Prodbuild will run `tsc` on server start and fetch the compiled JavaScript files accordingly. 
**Note:** Any following changes made to TypeScript files will require the user to run `tsc` manually. This will be made automatic in the next update (v1.7.1).

#### Note
As of version 1.7.0, `script` elements that import a `.ts` file will not resolve to a compiled `.js` file.


### Commands
#### `npx prodbuild build`
Minifies and uglifies all HTML, CSS, and JS/TS files in the specified entry folder (default is './src/') and emits all files to the specified output folder (default is './dist/').

See the above section for information regarding entry and output folders.

Note: TypeScript files are transpiled as part of the build process.

#### `npx prodbuild serve`
##### Arguments
- `start`: start the dev server at the specified port (default is 5000). This will open in the folder specified in `config.entry` unless used with `--prod` (see below)
- `kill`: stop the dev server

##### Options:
- `--prod`: starts the dev server in the production (output) directory
- `--purge`: purge all messages in `.prodbuildrc/log.txt`

#### `npx prodbuild init`
Create a build.config.json file and setup the corresponding folders.