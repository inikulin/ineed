var fs = require('fs'),
    path = require('path'),
    ineed = require('../../index');


//Utils
function unifySpaces(str) {
    return str.replace(/\s+/g, ' ');
}

function readFile(filePath) {
    return unifySpaces(fs.readFileSync(path.join(__dirname, filePath)).toString());
}

//Test data
var html = readFile('../data/src.html'),
    emptyHtml = '';


//Tests
describe('.reprocess', function () {

    it('.comments(): should replace comments', function () {
        var reprocessor = ineed.reprocess.comments(function (comment) {
                return 'Yo' + comment;
            }),
            expected = readFile('../data/reprocessed_comments.html');

        unifySpaces(reprocessor.fromHtml(html)).should.be.eql(expected);
        reprocessor.fromHtml(emptyHtml).should.eql(emptyHtml);
    });

    it('.cssCode(): should replace CSS code in <style> tags', function () {
        var reprocessor = ineed.reprocess.cssCode(function (cssCode) {
                return cssCode.replace('.', '#');
            }),
            expected = readFile('../data/reprocessed_css_code.html');

        unifySpaces(reprocessor.fromHtml(html)).should.be.eql(expected);
        reprocessor.fromHtml(emptyHtml).should.eql(emptyHtml);
    });

    it('.hyperlinks(): should replace "href" attribute of the hyperlinks', function () {
        var reprocessor = ineed.reprocess.hyperlinks(function (baseUrl, href) {
                baseUrl.should.be.ok;
                return href + '42';
            }),
            expected = readFile('../data/reprocessed_hyperlinks.html');

        unifySpaces(reprocessor.fromHtml(html)).should.be.eql(expected);
        reprocessor.fromHtml(emptyHtml).should.eql(emptyHtml);
    });

    it('.images(): should replace "src" attribute of the images', function () {
        var reprocessor = ineed.reprocess.images(function (baseUrl, src) {
                baseUrl.should.be.ok;
                return src + '42';
            }),
            expected = readFile('../data/reprocessed_images.html');

        unifySpaces(reprocessor.fromHtml(html)).should.be.eql(expected);
        reprocessor.fromHtml(emptyHtml).should.eql(emptyHtml);
    });

    it('.jsCode(): should replace JavaScript in <script> tags', function () {
        var reprocessor = ineed.reprocess.jsCode(function (code) {
                return code.replace(/\(\)/g, '(yo)');
            }),
            expected = readFile('../data/reprocessed_js_code.html');

        unifySpaces(reprocessor.fromHtml(html)).should.be.eql(expected);
        reprocessor.fromHtml(emptyHtml).should.eql(emptyHtml);
    });

    it('.scripts(): should replace "src" attribute of the scripts', function () {
        var reprocessor = ineed.reprocess.scripts(function (baseUrl, src) {
                baseUrl.should.be.ok;
                return src + '42';
            }),
            expected = readFile('../data/reprocessed_scripts.html');

        unifySpaces(reprocessor.fromHtml(html)).should.be.eql(expected);
        reprocessor.fromHtml(emptyHtml).should.eql(emptyHtml);
    });

    it('.stylesheets(): should replace <link>\'s "href" attribute', function () {
        var reprocessor = ineed.reprocess.stylesheets(function (baseUrl, href) {
                baseUrl.should.be.ok;
                return href + '42';
            }),
            expected = readFile('../data/reprocessed_stylesheets.html');

        unifySpaces(reprocessor.fromHtml(html)).should.be.eql(expected);
        reprocessor.fromHtml(emptyHtml).should.eql(emptyHtml);
    });

    it('.texts(): should replace texts and provide encodeHtml() method', function () {
        var reprocessor = ineed.reprocess.texts(function (text, encodeHtml) {
                if (text === 'ullamco laboris')
                    return encodeHtml('<script>') + '&donotencodeme';

                return text.toUpperCase();
            }),
            expected = readFile('../data/reprocessed_texts.html');

        unifySpaces(reprocessor.fromHtml(html)).should.be.eql(expected);
        reprocessor.fromHtml(emptyHtml).should.eql(emptyHtml);
    });

    it('.title(): should replace page title', function () {
        var reprocessor = ineed.reprocess.title(function (title) {
                return title.toUpperCase();
            }),
            expected = readFile('../data/reprocessed_title.html');

        unifySpaces(reprocessor.fromHtml(html)).should.be.eql(expected);
        reprocessor.fromHtml(emptyHtml).should.eql(emptyHtml);
    });

    it('should support plugin chaining and ignore duplicate plugins', function () {
        var replacer = function (baseUrl, url) {
                return url + '42';
            },
            reprocessor = ineed.reprocess
                .images(replacer)
                .scripts(replacer)
                .stylesheets(replacer),
            expected = readFile('../data/reprocessed_multiple_plugins.html');

        unifySpaces(reprocessor.fromHtml(html)).should.eql(expected);

        //NOTE: check that duplicate plugins are ignored
        unifySpaces(
            reprocessor
                .images(replacer)
                .scripts(replacer)
                .stylesheets(replacer)
                .fromHtml(html)
        ).should.eql(expected);
    });

    it('should delete HTML token if plugin returns "null" in token handler', function () {
        var plugin = {
            name: 'everything',
            extends: 'reprocess',

            init: function (env, replacer) {
                this.replacer = replacer;
            },

            onDoctype: function () {
                return this.replacer();
            },

            onStartTag: function () {
                return this.replacer();
            },

            onEndTag: function () {
                return this.replacer();
            },

            onText: function () {
                return this.replacer();
            },

            onComment: function () {
                return this.replacer();
            }
        };

        ineed
            .using(plugin)
            .reprocess
            .everything(function () {
                return null;
            })
            .fromHtml(html)
            .should.eql(emptyHtml);
    });
});