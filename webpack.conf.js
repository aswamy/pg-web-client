const path = require('path');
const glob = require('glob');
const copy = require('copy-webpack-plugin');

const config = {
  entry: glob.sync(`${__dirname}/src/js/**/*.js`),
  output: {
    filename : 'bundle.js',
    path: path.resolve(__dirname, './dist/js')
  },
  plugins: [
    new copy({
      patterns: [
        { from: `${__dirname}/src/static`, to: `${__dirname}/dist` }
      ]
    }),
    new copy({
      patterns: [
        { from: `${__dirname}/node_modules/bulma/css/bulma.min.css`, to: `${__dirname}/dist/css` }
      ]
    })
  ]
};

module.exports = [ config ];
