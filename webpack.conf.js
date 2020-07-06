const path = require('path');
const glob = require('glob');
const copy = require('copy-webpack-plugin');

/* Third-party libraries */
const thirdpartyBuildConfig = {
  entry: [
    `${__dirname}/node_modules/hotkeys-js/dist/hotkeys.min.js`
  ],
  output: {
    filename: 'external.js',
    path: path.resolve(__dirname, './dist/js')
  },
  plugins: [
    new copy({
      patterns: [
        { from: `${__dirname}/node_modules/bulma/css/bulma.min.css`, to: `${__dirname}/dist/css` }
      ]
    })
  ]
};

/* Homebrewed code */
const developmentBuildConfig = {
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
    })
  ]
};

// development + production does the same thing right now
module.exports = [ developmentBuildConfig, thirdpartyBuildConfig ];
