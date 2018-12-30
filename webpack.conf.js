const path = require('path');

module.exports = {
  entry : path.resolve(__dirname, './src/components.js'),
  output : {
    filename :  'components.js',
    path: path.resolve(__dirname, './components')
  },
  mode : 'development',
  watch: true
};