var fs = require('fs'),
    path = require('path'),
    iwant = require('../../index');


//Test data
var html = fs.readFileSync(path.join(__dirname, '../data/src.html')).toString(),
    emptyHtml = '';


//Utils
function removeSpaces(str) {
    return str.replace(/\s/g, '');
}


//Tests
exports['.comments'] = function (t) {
    var collector = iwant.collect.comments,
        expected = ['Comment1', 'Comment3', 'Comment2'];

    var results = collector.fromHtml(html);
    t.deepEqual(results.comments, expected);

    results = collector.fromHtml(emptyHtml);
    t.deepEqual(results.comments, []);

    t.done();
};

exports['.cssCode'] = function (t) {
    var collector = iwant.collect.cssCode,
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