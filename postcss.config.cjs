module.exports = {
  plugins: [
    require('postcss-preset-env')({
      features: {
        'cascade-layers': false
      }
    }),
    require('autoprefixer'),
  ],
};
