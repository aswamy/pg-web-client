const path = require('path');

module.exports = {
  entry : path.resolve(__dirname, './src/components.js'),
  output : {
    filename :  'components.js',
  },
  mode : 'development'
};