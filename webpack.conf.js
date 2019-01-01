const path = require('path');
const glob = require('glob');

module.exports = {
  entry : glob.sync(`${__dirname}/src/components/*.js`),
  output : {
    filename :  'components.js',
    path: path.resolve(__dirname, './components')
  },
  mode : 'development',
  watch: true
};