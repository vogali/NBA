const SingleEntryPlugin = require("webpack/lib/SingleEntryPlugin");


function HtmlWebpackEntryLoaderPlugin(options) {
  // Configure your plugin with options...
  this.childCompilerName = 'html-webpack-entry-loader-plugin';
  this.outputFileName = options.outputFileName;
  // To make child compiler work, you have to have a entry in the file system
  this.compilationEntry = options.entryFile;
}

HtmlWebpackEntryLoaderPlugin.prototype.apply = function(compiler) {
  compiler.hooks.compilation.tap('HtmlWebpackEntryLoaderPlugin', (compilation) => {
    //console.log('The compiler is starting a new compilation...');
    /*
    compilation.hooks.htmlWebpackPluginAfterHtmlProcessing.tapAsync(
      'HtmlWebpackEntryLoaderPlugin',
      (data, cb) => {
        console.log(data.plugin.assetJson);
        //data.html += 'The Magic Footer'

        cb(null, data)
      }
    )
    */
  });
  compiler.plugin('make', (compilation, callback) => {
    // Creating child compiler with params
    const childCompiler = compilation.createChildCompiler(this.childCompilerName, {
      filename: this.outputFileName
    });

    // Everyone plugin does this, I don't know why
    childCompiler.context = compiler.context;

    // Add SingleEntryPlugin to make all this work
    childCompiler.apply(new SingleEntryPlugin(compiler.context, this.compilationEntry, this.outputFileName));

    // Needed for HMR. Even if your plugin don't support HMR,
    // this code seems to be always needed just in case to prevent possible errors
    childCompiler.plugin('compilation', (compilation) => {
      if (compilation.cache) {
        if (!compilation.cache[this.compilationEntry]) {
          compilation.cache[this.compilationEntry] = {};
        }

        compilation.cache = compilation.cache[this.compilationEntry];
      }
    });

    // Run child compilation
    childCompiler.runAsChild((err, entries, childCompilation) => {
      callback(err);
    });
  });

  // TODO: verify how it works
  /*
  compiler.plugin('emit', function(compilation, callback) {
    // Get our output asset
    const asset = compilation.assets[this.outputFileName];

    // Delete delete our asset from output
    delete compilation.assets[this.outputFileName];

    // Collect all output assets
    const assets = Object.keys(compilation.assets);

    // Combine collected assets and child compilation output into new source.
    // Note: `globalAssets` is global variable
    let source = `
      var globalAssets = ${ JSON.stringify(assets) }

      ${ asset.source() }
    `;

    // Add out asset back to the output
    compilation.assets[this.outputFileName] = {
      source() {
        return source;
      },
      size() {
        return Buffer.byteLength(source, 'utf8');
      }
    };
  });
  */
}

module.exports = HtmlWebpackEntryLoaderPlugin;
