var fs = require('fs'),
    path = require('path'),
    should = require('should'),
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

            init: function (ctx, replacer) {
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

    it('should support token emission', function () {
        var src = '<!DOCTYPE html><!--comment--><div>text</div>',
            expected = '<!DOCTYPE yo-html-yo><!DOCTYPE yo-yo-html-yo>' +
                       '<!--yo-comment-yo--><!--yo-yo-comment-yo-->' +
                       '<yo-div-yo><yo-yo-div-yo>' +
                       'yo-text-yoyo-yo-text-yo' +
                       '</yo-div-yo></yo-yo-div-yo>',
            once = function (fn) {
                var called = false;

                return function () {
                    if (!called) {
                        called = true;
                        fn.apply(this, arguments);
                    }
                };
            },
            emit = function (fnName) {
                return function (token) {
                    //NOTE: Clone mutable tokens
                    if (typeof token === 'object')
                        token = JSON.parse(JSON.stringify(token));

                    this.ctx.emit[fnName](token);
                };
            };

        var plugin1 = {
            name: 'duplicate',
            extends: 'reprocess',

            init: function (ctx) {
                this.ctx = ctx;
            },

            onDoctype: once(emit('doctype')),
            onStartTag: once(emit('startTag')),
            onEndTag: once(emit('endTag')),
            onText: once(emit('text')),
            onComment: once(emit('comment'))
        };

        var plugin2 = {
            name: 'appendYo',
            extends: 'reprocess',

            init: function (ctx) {
                this.ctx = ctx;
            },

            onDoctype: function (doctype) {
                doctype.name += '-yo';

                return doctype;
            },

            onStartTag: function (startTag) {
                startTag.tagName += '-yo';

                return startTag;
            },

            onEndTag: function (tagName) {
                return tagName + '-yo';
            },

            onText: function (text) {
                return text + '-yo';
            },

            onComment: function (comment) {
                return comment + '-yo';
            }
        };

        var plugin3 = {
            name: 'prependYo',
            extends: 'reprocess',

            init: function (ctx) {
                this.ctx = ctx;
            },

            onDoctype: function (doctype) {
                doctype.name = 'yo-' + doctype.name;

                return doctype;
            },

            onStartTag: function (startTag) {
                startTag.tagName = 'yo-' + startTag.tagName;

                return startTag;
            },

            onEndTag: function (tagName) {
                return 'yo-' + tagName;
            },

            onText: function (text) {
                return 'yo-' + text;
            },

            onComment: function (comment) {
                return 'yo-' + comment;
            }
        };

        ineed
            .using(plugin1)
            .using(plugin2)
            .using(plugin3)
            .reprocess
            .prependYo()
            .duplicate()
            .appendYo()
            .fromHtml(src)
            .should.eql(expected);
    });
});
