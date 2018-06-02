const path = require('path');

const config = {
  entry: path.resolve(__dirname, "src/veb3.js"),
  mode: 'development',
  output: {
    filename: 'index.js'
  },
  module: {
    rules: [
      { test: /\.txt$/, use: 'raw-loader' }
    ]
  }
};

module.exports = config;