var fs = require('fs');
var path = require('path');

var program = require('commander');
var build = require('component-builder');
var resolve = require('component-resolver');
var bundler = require('component-bundler');
var mkdir = require('mkdirp');
var hbs = require('component-builder-handlebars');

program
  .version('0.1.0')
  .option('-s, --standalone', 'Build standalone bundles')
  .parse(process.argv);

var hbsOptions = {
  extname: 'hbs',
  partialRegex: /^_/
};

// create a bundle function of type `.pages`
// based on the `.locals` of a specific `component.json`
var options = {
  root: path.join(__dirname, '.'), // where your main component.json is located
  build: path.join(__dirname, 'build') // component build output
}
var json = require(path.join(options.root, 'component.json'));
var bundle = bundler.pages(json);

mkdir.sync(options.build);

// resolve the dependency tree
// while also installing any remote dependencies
resolve(options.root, {
  install: true
}, function (err, tree) {
  if (err) throw err;

  // create the bundles
  var bundles = bundle(tree);

  // build each bundle
  Object.keys(bundles).forEach(function (name) {
    build.styles(bundles[name], {
        development: true
    })
    .use('styles', build.plugins.css())
    .use('styles', build.plugins.urlRewriter())
    .build(function (err, css) {
      if (!css) return;
      if (err) throw err;
      var file = path.join(options.build, name + '/build.css');
      mkdir.sync(options.build + '/' + name);
      fs.writeFileSync(file, css, 'utf8');
    });
    build.scripts(bundles[name], {
        development: true
    })
    .use('scripts', build.plugins.js())
    .use('templates', build.plugins.string())
    .use('hbs', hbs(hbsOptions))
    .build(function (err, js) {
      if (!js) return;
      if (err) throw err;

      var umd = program.standalone;

      var file = path.join(options.build, name + '/build.js');
      mkdir.sync(options.build + '/' + name);
      if (umd) {
        js = build.scripts.umd('./lib/' + name, name, js);
      } else {
        js = build.scripts.require + js; // add require impl to boot component
      }
      js += hbs.includeRuntime(); // add the handlebars runtime helper


      fs.writeFileSync(file, js, 'utf8');
    });
    build.files(bundles[name], {
      destination: options.build + '/' + name
    })
      .use('images', build.plugins.symlink())
      .use('files', build.plugins.symlink())
      .end();
  });
});
