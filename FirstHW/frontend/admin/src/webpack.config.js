module.exports = {
  // інші налаштування Webpack...

  output: {
    // інші налаштування output...
    publicPath: '/admin',
  },

  // інші налаштування...

  devServer: {
    static: {
      directory: path.join(__dirname, 'assets'),
      publicPath: '/admin',
    },
  },
};