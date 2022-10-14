const CompressionPlugin = require('compression-webpack-plugin');
const webpack = require('webpack');

const path = require('path');

function resolve(dir) {
  return path.join(__dirname, dir);
}

module.exports = {
  // Some packages without index.js probably get error in compile stage,
  // thus you need to add this option here.
  transpileDependencies: ['screenfull'],
  chainWebpack: (config) => {
    config.module
      .rule('vue')
      .use('vue-loader')
      .loader('vue-loader')
      .tap((options) => {
        options.transformAssetUrls = {
          img: 'src',
          image: 'xlink:href',
          'b-img': 'src',
          'b-img-lazy': ['src', 'blank-src'],
          'b-card': 'img-src',
          'b-card-img': 'src',
          'b-card-img-lazy': ['src', 'blank-src'],
          'b-carousel-slide': 'img-src',
          'b-embed': 'src',
        };
        return options;
      });
    config.module.rule('svg').exclude.add(resolve('src/icons')).end();
    config.module
      .rule('icons')
      .test(/\.svg$/)
      .include.add(resolve('src/icons'))
      .end()
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        symbolId: 'icon-[name]',
      })
      .end();
  },
  css: {
    loaderOptions: {
      sass: {
        prependData: () => {
          const envName = process.env.VUE_APP_ENV_NAME;
          const hasCustomStyles =
            process.env.CUSTOM_STYLES === 'true' ? true : false;
          if (hasCustomStyles && envName !== undefined) {
            // If there is an env name defined, import Sass
            // overrides.
            // It is important that these imports stay in this
            // order to make sure enviroment overrides
            // take precedence over the default BMC styles
            return `
              @import "@/assets/styles/bmc/helpers";
              @import "@/env/assets/styles/_${envName}";
              @import "@/assets/styles/bootstrap/_helpers";
            `;
          } else {
            // Include helper imports so single file components
            // do not need to include helper imports

            // BMC Helpers must be imported before Bootstrap helpers to
            // take advantage of Bootstrap's use of the Sass !default
            // statement. Moving this helper after results in Bootstrap
            // variables taking precedence over BMC's
            return `
              @import "@/assets/styles/bmc/helpers";
              @import "@/assets/styles/bootstrap/_helpers";
            `;
          }
        },
      },
    },
  },
  devServer: {
    https: true,
    proxy: {
      '/': {
        target: process.env.BASE_URL,
        headers: {
          Connection: 'upgrade',
        },
        onProxyRes: (proxyRes) => {
          // This header is ignored in the browser so removing
          // it so we don't see warnings in the browser console
          delete proxyRes.headers['strict-transport-security'];
        },
      },
    },
    port: 8000,
  },
  productionSourceMap: false,
  configureWebpack: (config) => {
    const envName = process.env.VUE_APP_ENV_NAME;
    const hasCustomStore = process.env.CUSTOM_STORE === 'true' ? true : false;
    const hasCustomRouter = process.env.CUSTOM_ROUTER === 'true' ? true : false;
    const hasCustomAppNav =
      process.env.CUSTOM_APP_NAV === 'true' ? true : false;

    if (envName !== undefined) {
      if (hasCustomStore) {
        // If env has custom store, resolve all store modules. Currently found
        // in src/router/index.js src/store/api.js and src/main.js
        config.resolve.alias['./store$'] = `@/env/store/${envName}.ts`;
        config.resolve.alias['../store$'] = `@/env/store/${envName}.ts`;
      }
      if (hasCustomRouter) {
        // If env has custom router, resolve routes in src/router/index.js
        config.resolve.alias['./routes$'] = `@/env/router/${envName}.ts`;
      }
      if (hasCustomAppNav) {
        // If env has custom AppNavigation, resolve AppNavigationMixin module in src/components/AppNavigation/AppNavigation.vue
        config.resolve.alias[
          './AppNavigationMixin$'
        ] = `@/env/components/AppNavigation/${envName}.js`;
      }
    }

    if (process.env.NODE_ENV === 'production') {
      config.plugins.push(
        new CompressionPlugin({
          deleteOriginalAssets: true,
        })
      );
    }
    config.plugins.push(
      new webpack.ProvidePlugin({
        $: 'jquery',
        jQuery: 'jquery',
        'windows.jQuery': 'jquery',
      })
    );
    config.devtool = 'source-map';
  },
  pluginOptions: {
    i18n: {
      localeDir: 'locales',
      enableInSFC: true,
    },
  },
};
