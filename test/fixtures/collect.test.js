var fs = require('fs'),
    path = require('path'),
    ineed = require('../../index');


//Test data
var html = fs.readFileSync(path.join(__dirname, '../data/src.html')).toString(),
    emptyHtml = '';


//Utils
function removeSpaces(str) {
    return str.replace(/\s/g, '');
}


//Tests
exports['.comments'] = function (t) {
    var collector = ineed.collect.comments,
        expected = ['Comment1', 'Comment3', 'Comment2'];

    var results = collector.fromHtml(html);
    t.deepEqual(results.comments, expected);

    results = collector.fromHtml(emptyHtml);
    t.deepEqual(results.comments, []);

    t.done();
};

exports['.cssCode'] = function (t) {
    var collector = ineed.collect.cssCode,
        expected = [
            '.yo{background-color:red;}',
            '.hey{color:blue;font-size:42px;}'
        ];

    var results = collector.fromHtml(html);
    results.cssCode = results.cssCode.map(removeSpaces);
    t.deepEqual(results.cssCode, expected);

    results = collector.fromHtml(emptyHtml);
    t.deepEqual(results.cssCode, []);

    t.done();
};

exports['.hyperlinks'] = function (t) {
    var collector = ineed.collect.hyperlinks,
        expected = [
            {
                href: 'http://www.yo.dawg/come/get/some',
                text: 'ullamco laboris'
            },
            {
                href: 'http://www.go.away/',
                text: 'reprehenderit in voluptate'
            }
        ];

    var results = collector.fromHtml(html);
    t.deepEqual(results.hyperlinks, expected);

    results = collector.fromHtml(emptyHtml);
    t.deepEqual(results.hyperlinks, []);

    t.done();
};

exports['.images'] = function (t) {
    var collector = ineed.collect.images,
        expected = [
            {
                src: 'http://www.test.test/puppy/images/kitty.jpg',
                alt: ''
            },
            {
                src: 'http://www.yo.dawg/images/kitty.jpg',
                alt: 'img1'
            }
        ];

    var results = collector.fromHtml(html);
    t.deepEqual(results.images, expected);

    results = collector.fromHtml(emptyHtml);
    t.deepEqual(results.images, []);

    t.done();
};

exports['.jsCode'] = function (t) {
    var collector = ineed.collect.jsCode,
        expected = [
            'while(true){useJQuery();}',
            'functionbuildBeautifulApps(){returncreateNgFactoryServiceProviderSingletonMock();}'
        ];

    var results = collector.fromHtml(html);
    results.jsCode = results.jsCode.map(removeSpaces);
    t.deepEqual(results.jsCode, expected);

    results = collector.fromHtml(emptyHtml);
    t.deepEqual(results.jsCode, []);

    t.done();
};

exports['.scripts'] = function (t) {
    var collector = ineed.collect.scripts,
        expected = [
            'http://www.yo.dawg/scripts/awesomelib.js',
            'http://www.yo.dawg/iheard/scripts/coollib.js'
        ];

    var results = collector.fromHtml(html);
    t.deepEqual(results.scripts, expected);

    results = collector.fromHtml(emptyHtml);
    t.deepEqual(results.scripts, []);

    t.done();
};

exports['.stylesheets'] = function (t) {
    var collector = ineed.collect.stylesheets,
        expected = [
            'http://www.yo.dawg/css/beauty.css',
            'http://www.test.test/css/beauty.css'
        ];

    var results = collector.fromHtml(html);
    t.deepEqual(results.stylesheets, expected);

    results = collector.fromHtml(emptyHtml);
    t.deepEqual(results.stylesheets, []);

    t.done();
};

exports['.texts'] = function (t) {
    var collector = ineed.collect.texts,
        expected = [
            'Yo!',
            'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ' +
            'ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation',
            'ullamco laboris',
            'nisi ut aliquip ex ea commodo consequat.',
            'Duis aute irure dolor in',
            'reprehenderit in voluptate',
            'velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, ' +
            'sunt in culpa qui officia deserunt mollit anim id est',
            'laborum',
            '.'
        ].map(removeSpaces);

    var results = collector.fromHtml(html);
    results.texts = results.texts.map(removeSpaces);
    t.deepEqual(results.texts, expected);

    results = collector.fromHtml(emptyHtml);
    t.deepEqual(results.texts, []);

    t.done();
};

exports['.title'] = function (t) {
    var collector = ineed.collect.title,
        expected = 'Yo!';

    var results = collector.fromHtml(html);
    t.strictEqual(results.title, expected);

    results = collector.fromHtml(emptyHtml);
    t.strictEqual(results.title, '');

    t.done();
};

exports['Multiple plugins'] = function (t) {
    var collector = ineed.collect.images.scripts.stylesheets,
        result = collector.fromHtml(html);

    //NOTE: check that chaining doesn't affect individual results
    t.deepEqual(result.images, ineed.collect.images.fromHtml(html).images);
    t.deepEqual(result.scripts, ineed.collect.scripts.fromHtml(html).scripts);
    t.deepEqual(result.stylesheets, ineed.collect.stylesheets.fromHtml(html).stylesheets);

    //NOTE: check that duplicate plugins are ignored
    collector = collector.images.scripts.stylesheets;
    t.deepEqual(collector.fromHtml(html), result);

    t.done();
};