const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const modRewrite = require('connect-modrewrite');
const browserSync = require('browser-sync').create();
const config = require('./webpack.config');

const compiler = webpack(config);
compiler.plugin('done', () => {
  browserSync.reload('bundle.css');
});

// Run Browsersync and use middleware for Hot Module Replacement
browserSync.init({
  port: process.env.NODE_PORT || 9000,
  notify: process.argv.indexOf('--notify') !== -1,
  open: process.argv.indexOf('--open') !== -1,
  server: {
    baseDir: './src',
    middleware: [
      webpackDevMiddleware(compiler, {
        // Dev middleware can't access config, so we provide publicPath
        publicPath: config.output.publicPath,
        // Pretty colored output
        stats: {colors: true},
        // Set to false to display a list of each file that is being bundled.
        noInfo: true || config.noInfo
      }),
      webpackHotMiddleware(compiler),
      modRewrite([
        '!\\.[\\w\\?\\=]+$ /index.html [L]'
      ])
    ]
  }
});
