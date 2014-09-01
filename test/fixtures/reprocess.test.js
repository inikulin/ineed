var fs = require('fs'),
    path = require('path'),
    iwant = require('../../index');


//Utils
function readFile(filePath) {
    return fs.readFileSync(path.join(__dirname, filePath)).toString();
}

function unifySpaces(str) {
    return str.replace(/\s+/g, ' ');
}

//Test data
var html = readFile('../data/src.html'),
    emptyHtml = '';


//Tests
exports['.comments'] = function (t) {
    var reprocessor = iwant.reprocess.comments(function (comment) {
            return 'Yo' + comment;
        }),
        expected = readFile('../data/reprocessed_comments.html');

    var results = reprocessor.fromHtml(html);
    t.strictEqual(unifySpaces(results), unifySpaces(expected));

    results = reprocessor.fromHtml(emptyHtml);
    t.strictEqual(results, emptyHtml);

    t.done();
};


exports['.cssCode'] = function (t) {
    var reprocessor = iwant.reprocess.cssCode(function (cssCode) {
            return cssCode.replace('.', '#');
        }),
        expected = readFile('../data/reprocessed_css_code.html');

    var results = reprocessor.fromHtml(html);
    t.strictEqual(unifySpaces(results), unifySpaces(expected));

    results = reprocessor.fromHtml(emptyHtml);
    t.strictEqual(results, emptyHtml);

    t.done();
};

exports['.hyperlinks'] = function (t) {
    var reprocessor = iwant.reprocess.hyperlinks(function (baseUrl, href) {
            t.ok(baseUrl);
            return href + '42';
        }),
        expected = readFile('../data/reprocessed_hyperlinks.html');

    var results = reprocessor.fromHtml(html);
    t.strictEqual(unifySpaces(results), unifySpaces(expected));

    results = reprocessor.fromHtml(emptyHtml);
    t.strictEqual(results, emptyHtml);

    t.done();
};

exports['.images'] = function (t) {
    var reprocessor = iwant.reprocess.images(function (baseUrl, src) {
            t.ok(baseUrl);
            return src + '42';
        }),
        expected = readFile('../data/reprocessed_images.html');

    var results = reprocessor.fromHtml(html);
    t.strictEqual(unifySpaces(results), unifySpaces(expected));

    results = reprocessor.fromHtml(emptyHtml);
    t.strictEqual(results, emptyHtml);

    t.done();
};

exports['.jsCode'] = function (t) {
    var reprocessor = iwant.reprocess.jsCode(function (code) {
            return code.replace(/\(\)/g, '(yo)');
        }),
        expected = readFile('../data/reprocessed_js_code.html');

    var results = reprocessor.fromHtml(html);
    t.strictEqual(unifySpaces(results), unifySpaces(expected));

    results = reprocessor.fromHtml(emptyHtml);
    t.strictEqual(results, emptyHtml);

    t.done();
};

exports['.scripts'] = function (t) {
    var reprocessor = iwant.reprocess.scripts(function (baseUrl, src) {
            t.ok(baseUrl);
            return src + '42';
        }),
        expected = readFile('../data/reprocessed_scripts.html');

    var results = reprocessor.fromHtml(html);
    t.strictEqual(unifySpaces(results), unifySpaces(expected));

    results = reprocessor.fromHtml(emptyHtml);
    t.strictEqual(results, emptyHtml);

    t.done();
};

exports['.stylesheets'] = function (t) {
    var reprocessor = iwant.reprocess.stylesheets(function (baseUrl, href) {
            t.ok(baseUrl);
            return href + '42';
        }),
        expected = readFile('../data/reprocessed_stylesheets.html');

    var results = reprocessor.fromHtml(html);
    t.strictEqual(unifySpaces(results), unifySpaces(expected));

    results = reprocessor.fromHtml(emptyHtml);
    t.strictEqual(results, emptyHtml);

    t.done();
};

exports['.texts'] = function (t) {
    var reprocessor = iwant.reprocess.texts(function (text, encodeHtml) {
            if (text === 'ullamco laboris')
                return encodeHtml('<script>') + '&donotencodeme';

            return text.toUpperCase();
        }),
        expected = readFile('../data/reprocessed_texts.html');

    var results = reprocessor.fromHtml(html);
    t.strictEqual(unifySpaces(results), unifySpaces(expected));

    results = reprocessor.fromHtml(emptyHtml);
    t.strictEqual(results, emptyHtml);

    t.done();
};

exports['.title'] = function (t) {
    var reprocessor = iwant.reprocess.title(function (title) {
            return title.toUpperCase();
        }),
        expected = readFile('../data/reprocessed_title.html');

    var results = reprocessor.fromHtml(html);
    t.strictEqual(unifySpaces(results), unifySpaces(expected));

    results = reprocessor.fromHtml(emptyHtml);
    t.strictEqual(results, emptyHtml);

    t.done();
};


exports['Multiple plugins'] = function (t) {
    var replacer = function (baseUrl, url) {
            return url + '42';
        },
        reprocessor = iwant.reprocess.images(replacer).scripts(replacer).stylesheets(replacer),
        expected = readFile('../data/reprocessed_multiple_plugins.html');

    var results = reprocessor.fromHtml(html);
    t.strictEqual(unifySpaces(results), unifySpaces(expected));

    //NOTE: check that duplicate plugins are ignored
    results = reprocessor.images(replacer).scripts(replacer).stylesheets(replacer).fromHtml(html);
    t.strictEqual(unifySpaces(results), unifySpaces(expected));

    t.done();
};

exports['Delete content'] = function (t) {
    var cleaningPlugin = {
        name: 'cleanEverything',
        extends: 'reprocess',

        reset: function () {
        },

        onDoctype: function () {
            return null;
        },

        onStartTag: function () {
            return null;
        },

        onEndTag: function () {
            return null;
        },

        onText: function () {
            return null;
        },

        onComment: function () {
            return null;
        }

    };

    var result = iwant.using(cleaningPlugin).reprocess.cleanEverything().fromHtml(html);

    t.strictEqual(result, emptyHtml);

    t.done();
};