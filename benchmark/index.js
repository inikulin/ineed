var fs = require('fs'),
    path = require('path'),
    Benchmark = require('benchmark'),
    cheerio = require('cheerio'),
    iwant = require('../index');

var dataDirPath = path.join(__dirname, './data'),
    testPages = fs.readdirSync(dataDirPath).map(function (fileName) {
        var filePath = path.join(dataDirPath, fileName);

        return fs.readFileSync(filePath).toString();
    });

new Benchmark.Suite()
    /*    .add('iwant', function () {
     for (var i = 0; i < testPages.length; i++) {
     iwant.collect
     .images
     .scripts
     .stylesheets
     .cssCode
     .jsCode
     .texts
     .fromHtml(testPages[i]);
     }
     })*/

    .add('cheerio (https://github.com/cheeriojs/cheerio)', function () {
        for (var i = 0; i < testPages.length; i++) {
            var $ = cheerio.load(testPages[i]),
                results = {
                    images: [],
                    scripts: [],
                    stylesheets: [],
                    cssCode: [],
                    jsCode: [],
                    texts: []
                };

            $('img').each(function () {
                var $img = $(this);

                results.images.push({
                    src: $img.attr('src'),
                    alt: $img.attr('alt')
                });
            });

            $('script').each(function () {
                var $script = $(this),
                    src = $script.attr('src');

                if (src)
                    results.scripts.push(src);
            });

            $('link[rel=stylesheet]').each(function () {
                var $link = $(this);

                results.stylesheets.push($link.attr('href'));
            });

            //TODO: accomplish benchmark
        }
    })

    .on('start', function () {
        console.log('Starting benchmark. Fasten your seatbelts...')
    })

    .on('cycle', function (event) {
        console.log(event.target.toString());
    })

    .on('complete', function () {
        console.log('Fastest is ' + this.filter('fastest').pluck('name'));
    })

    .run();
