const cssnano = require('cssnano');
const { default: postcss } = require('postcss');

module.exports = {
    plugins: [
        require('cssnano')({
            preset: 'advanced',
        }),
    ],
};