exports.config = {
  // See http://brunch.io/#documentation for docs.
  files: {
    javascripts: {
      joinTo: {
        "js/app.js": /^(web|node_modules)/,
        "js/test.js": /^(web|node_modules|test\/js)/,
      },
      order: {
        before: [
          "web/static/vendor/js/jquery-3.1.1.js",
          "web/static/vendor/js/bootstrap.js",
          "web/static/vendor/js/adapter.js"
        ]
      }
    },
    stylesheets: {
      joinTo: "css/app.css",
      order: {
        after: ["web/static/css/app.css"] // concat app.css last
      }
    },
    templates: {
      joinTo: "js/app.js"
    }
  },

  conventions: {
    // This option sets where we should place non-css and non-js assets in.
    // By default, we set this to "/web/static/assets". Files in this directory
    // will be copied to `paths.public`, which is "priv/static" by default.
    assets: /^(web\/static\/assets)/
  },

  // Phoenix paths configuration
  paths: {
    // Dependencies and current project directories to watch
    watched: [
      "web/static",
      "test/static",
      "test/js"
    ],

    // Where to compile files to
    public: "priv/static"
  },

  // Configure your plugins
  plugins: {
    babel: {
      // Do not use ES6 compiler in vendor code
      ignore: [/web\/static\/vendor/],
      plugins: ['transform-flow-strip-types']
    },
    karma: {
      basePath: '',
      singleRun: false,
      frameworks: ['jasmine'],
      reporters: ['dots'],
      colors: true,
      plugins: [
        'karma-jasmine',
        'karma-phantomjs-launcher'
      ],
      browsers: ['PhantomJS'],
      files: [
        "priv/static/js/test.js"
      ]
    }
  },

  modules: {
    autoRequire: {
      "js/app.js": ["web/static/js/app"],
      "js/test.js": ["test/js/test_helper"]
    }
  },

  npm: {
    enabled: true
  }
};
