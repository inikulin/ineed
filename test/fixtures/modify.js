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
    var modifier = iwant.modify.comments(function (comment) {
            return 'Yo' + comment;
        }),
        expected = readFile('../data/modified_comments.html');

    var results = modifier.fromHtml(html);
    t.strictEqual(unifySpaces(results), unifySpaces(expected));

    results = modifier.fromHtml(emptyHtml);
    t.strictEqual(results, emptyHtml);

    t.done();
};


exports['.cssCode'] = function (t) {
    var modifier = iwant.modify.cssCode(function (cssCode) {
            return cssCode.replace('.', '#');
        }),
        expected = readFile('../data/modified_css_code.html');

    var results = modifier.fromHtml(html);
    t.strictEqual(unifySpaces(results), unifySpaces(expected));

    results = modifier.fromHtml(emptyHtml);
    t.strictEqual(results, emptyHtml);

    t.done();
};

exports['.hyperlinks'] = function (t) {
    var modifier = iwant.modify.hyperlinks(function (baseUrl, href) {
            t.ok(baseUrl);
            return href + '42';
        }),
        expected = readFile('../data/modified_hyperlinks.html');

    var results = modifier.fromHtml(html);
    t.strictEqual(unifySpaces(results), unifySpaces(expected));

    results = modifier.fromHtml(emptyHtml);
    t.strictEqual(results, emptyHtml);

    t.done();
};

exports['.images'] = function (t) {
    var modifier = iwant.modify.images(function (baseUrl, src) {
            t.ok(baseUrl);
            return src + '42';
        }),
        expected = readFile('../data/modified_images.html');

    var results = modifier.fromHtml(html);
    t.strictEqual(unifySpaces(results), unifySpaces(expected));

    results = modifier.fromHtml(emptyHtml);
    t.strictEqual(results, emptyHtml);

    t.done();
};

exports['.jsCode'] = function (t) {
    var modifier = iwant.modify.jsCode(function (code) {
            return code.replace(/\(\)/g, '(yo)');
        }),
        expected = readFile('../data/modified_js_code.html');

    var results = modifier.fromHtml(html);
    t.strictEqual(unifySpaces(results), unifySpaces(expected));

    results = modifier.fromHtml(emptyHtml);
    t.strictEqual(results, emptyHtml);

    t.done();
};

exports['.scripts'] = function (t) {
    var modifier = iwant.modify.scripts(function (baseUrl, src) {
            t.ok(baseUrl);
            return src + '42';
        }),
        expected = readFile('../data/modified_scripts.html');

    var results = modifier.fromHtml(html);
    t.strictEqual(unifySpaces(results), unifySpaces(expected));

    results = modifier.fromHtml(emptyHtml);
    t.strictEqual(results, emptyHtml);

    t.done();
};

exports['.stylesheets'] = function (t) {
    var modifier = iwant.modify.stylesheets(function (baseUrl, href) {
            t.ok(baseUrl);
            return href + '42';
        }),
        expected = readFile('../data/modified_stylesheets.html');

    var results = modifier.fromHtml(html);
    t.strictEqual(unifySpaces(results), unifySpaces(expected));

    results = modifier.fromHtml(emptyHtml);
    t.strictEqual(results, emptyHtml);

    t.done();
};

exports['.texts'] = function (t) {
    var modifier = iwant.modify.texts(function (text) {
            return text.toUpperCase();
        }),
        expected = readFile('../data/modified_texts.html');

    var results = modifier.fromHtml(html);
    t.strictEqual(unifySpaces(results), unifySpaces(expected));

    results = modifier.fromHtml(emptyHtml);
    t.strictEqual(results, emptyHtml);

    t.done();
};

exports['.title'] = function (t) {
    var modifier = iwant.modify.title(function (title) {
            return title.toUpperCase();
        }),
        expected = readFile('../data/modified_title.html');

    var results = modifier.fromHtml(html);
    t.strictEqual(unifySpaces(results), unifySpaces(expected));

    results = modifier.fromHtml(emptyHtml);
    t.strictEqual(results, emptyHtml);

    t.done();
};


exports['Multiple plugins'] = function (t) {
    var op = function (baseUrl, url) {
            return url + '42';
        },
        modifier = iwant.modify.images(op).scripts(op).stylesheets(op),
        expected = readFile('../data/modified_multiple_plugins.html');

    var results = modifier.fromHtml(html);
    t.strictEqual(unifySpaces(results), unifySpaces(expected));

    //NOTE: check that duplicate plugins are ignored
    modifier = modifier.images(op).scripts(op).stylesheets(op);
    t.strictEqual(unifySpaces(results), unifySpaces(expected));

    t.done();
};