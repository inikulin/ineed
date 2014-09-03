var util = require('util'),
    http = require('http'),
    Pipeline = require('../../lib/pipeline');


//Test pipeline
var TestPipeline = function () {
    Pipeline.call(this);
};


util.inherits(TestPipeline, Pipeline);


TestPipeline.prototype._aggregatePluginResults = function () {
    var result = {};

    this.plugins.forEach(function (plugin) {
        if (plugin.name)
            result[plugin.name] = plugin.getResult();
    });

    return result;
};


//Test plugins
var ContextLoggerPlugin = {
        name: 'ctxLogger',

        init: function (ctx, prop) {
            this.ctx = ctx;
            this.prop = prop;
            this.results = [];
        },

        onDoctype: function (doctype) {
            this.results.push(doctype.name + ':' + this.ctx[this.prop]);
        },

        onStartTag: function (startTag) {
            this.results.push(startTag.tagName + ':' + this.ctx[this.prop]);
        },

        onEndTag: function (tagName) {
            this.results.push(tagName + ':' + this.ctx[this.prop]);
        },

        onText: function (text) {
            this.results.push(text + ':' + this.ctx[this.prop]);
        },

        onComment: function (comment) {
            this.results.push(comment + ':' + this.ctx[this.prop]);
        },

        getResult: function () {
            return this.results;
        }
    },

    FetchWebPageTestPlugin = {
        name: 'fetchWebPageTest',

        init: function (ctx) {
            this.ctx = ctx;
            this.pageText = null;
        },

        onText: function (text) {
            this.pageText = text;
        },

        getResult: function () {
            return {
                baseUrl: this.ctx.baseUrl,
                pageText: this.pageText
            };
        }
    };


//Tests
exports['Plugin chain'] = function (t) {
    var pipeline = new TestPipeline(),
        src = '<!doctype html><html><head><title>42</title><!--hey--></head></html>',

        expected1 = [
            'init1', 'html', 'head', 'title', 'title', 'head', 'html'
        ],
        expected2 = [
            'init2', 'html', 'html_p1mod', 'head_p1mod', 'title_p1mod',
            '42', 'hey'
        ],
        expected3 = [
            'init3', 'html_p2mod', 'html_p1mod', 'head_p1mod', 'title_p1mod',
            '42_p2mod', 'title_p1mod', 'hey_p2mod', 'head_p1mod', 'html_p1mod'
        ],
        expected4 = [
            'init4'
        ],

        plugin1 = {
            name: 'p1',

            init: function () {
                this.results = ['init1'];
            },

            onStartTag: function (startTag) {
                this.results.push(startTag.tagName);
                startTag.tagName += '_p1mod';
                return startTag;
            },

            onEndTag: function (tagName) {
                this.results.push(tagName);
                tagName += '_p1mod';

                return tagName;
            },

            getResult: function () {
                return this.results;
            }
        },

        plugin2 = {
            name: 'p2',

            init: function () {
                this.results = ['init2'];
            },

            onDoctype: function (doctype) {
                this.results.push(doctype.name);
                doctype.name += '_p2mod';
                return doctype;
            },

            onStartTag: function (startTag) {
                this.results.push(startTag.tagName);
            },

            onText: function (text) {
                this.results.push(text);
                text += '_p2mod';
                return text;
            },

            onComment: function (comment) {
                this.results.push(comment);
                comment += '_p2mod';

                return comment;
            },

            getResult: function () {
                return this.results;
            }
        },

        plugin3 = {
            name: 'p3',

            init: function () {
                this.results = ['init3'];
                return null;
            },

            onDoctype: function (doctype) {
                this.results.push(doctype.name);
                return null;
            },

            onStartTag: function (startTag) {
                this.results.push(startTag.tagName);
                return null;
            },

            onEndTag: function (tagName) {
                this.results.push(tagName);
                return null;
            },

            onText: function (text) {
                this.results.push(text);
                return null;
            },

            onComment: function (comment) {
                this.results.push(comment);
                return null;
            },

            getResult: function () {
                return this.results;
            }
        },
        plugin4 = {
            name: 'p4',

            init: function () {
                this.results = ['init4'];
            },

            onDoctype: function (doctype) {
                this.results.push(doctype.name);
            },

            onStartTag: function (startTag) {
                this.results.push(startTag.tagName);
            },

            onEndTag: function (tagName) {
                this.results.push(tagName);
            },

            onText: function (text) {
                this.results.push(text);
            },

            onComment: function (comment) {
                this.results.push(comment);
            },

            getResult: function () {
                return this.results;
            }
        };

    pipeline.plugins.push(plugin1);
    pipeline.plugins.push(plugin2);
    pipeline.plugins.push(plugin3);
    pipeline.plugins.push(plugin4);

    var result = pipeline.fromHtml(src);

    t.deepEqual(result['p1'], expected1);
    t.deepEqual(result['p2'], expected2);
    t.deepEqual(result['p3'], expected3);
    t.deepEqual(result['p4'], expected4);

    t.done();
};

exports['ContextPlugin - inBody'] = function (t) {
    var pipeline = new TestPipeline(),
        sources = [
            '<!doctype html><html><head><title>Test</title><script>var a = 3;</script></head>Yo!</html>',
            '<!doctype html><html>Test<div></div></html>',
            '<!doctype html><html><head>Test<div></div></html>',
            '<!doctype html><html><head><!--Comment--><base></head><div></div></html>',
            '<!doctype html><html><head><title>Test</title><style>.test{}</style></head><body>Yo!</body></html>',
            '<title>42</title><script/>Test',
            '  <head>\n<link>\t</head><body>'
        ],
        expected = [
            [
                'html:false', 'html:false', 'head:false', 'title:false', 'Test:false', 'title:false',
                'script:false', 'var a = 3;:false', 'script:false', 'head:true', 'Yo!:true', 'html:false'
            ],
            [
                'html:false', 'html:false', 'Test:true', 'div:true', 'div:true', 'html:false'
            ],
            [
                'html:false', 'html:false', 'head:false', 'Test:true', 'div:true', 'div:true', 'html:false'
            ],
            [
                'html:false', 'html:false', 'head:false', 'Comment:false',
                'base:false', 'head:true', 'div:true', 'div:true', 'html:false'
            ],
            [
                'html:false', 'html:false', 'head:false', 'title:false', 'Test:false', 'title:false', 'style:false',
                '.test{}:false', 'style:false', 'head:true', 'body:true', 'Yo!:true', 'body:false', 'html:false'
            ],
            [
                'title:false', '42:false', 'title:false', 'script:false', 'Test:true'
            ],
            [
                '  :false', 'head:false', '\n:false', 'link:false', '\t:false', 'head:true', 'body:true'
            ]
        ];

    pipeline.plugins.push(ContextLoggerPlugin);
    pipeline.pluginInitArgs[ContextLoggerPlugin.name] = ['inBody'];

    sources.forEach(function (src, i) {
        var result = pipeline.fromHtml(src);

        t.deepEqual(result['ctxLogger'], expected[i]);
    });

    t.done();
};

exports['ContextPlugin - leadingStartTag'] = function (t) {
    var pipeline = new TestPipeline(),
        src = '<!doctype html><html><head><title></title><meta/></head><body><!--42--><script>42</script>Test</html>',
        expected = [
            'html:null', 'html:html', 'head:head', 'title:title', 'title:null',
            'meta:null', 'head:null', 'body:body', '42:body', 'script:script',
            '42:script', 'script:null', 'Test:null', 'html:null'
        ];

    pipeline.plugins.push(ContextLoggerPlugin);
    pipeline.pluginInitArgs[ContextLoggerPlugin.name] = ['leadingStartTag'];

    var result = pipeline.fromHtml(src);

    t.deepEqual(result['ctxLogger'], expected);

    t.done();
};

exports['ContextPlugin - baseUrl'] = function (t) {
    var pipeline = new TestPipeline(),
        src = '<!doctype html><html><head><base href="/test/path"></head></html>',
        expected1 = [
            'html:', 'html:', 'head:', 'base:/test/path', 'head:/test/path', 'html:/test/path'
        ],
        expected2 = [
            'html:http://www.test.test', 'html:http://www.test.test', 'head:http://www.test.test',
            'base:http://www.test.test/test/path', 'head:http://www.test.test/test/path',
            'html:http://www.test.test/test/path'
        ];

    pipeline.plugins.push(ContextLoggerPlugin);
    pipeline.pluginInitArgs[ContextLoggerPlugin.name] = ['baseUrl'];

    var result = pipeline.fromHtml(src);
    t.deepEqual(result['ctxLogger'], expected1);

    result = pipeline.fromHtml(src, 'http://www.test.test');
    t.deepEqual(result['ctxLogger'], expected2);

    t.done();
};

var server = null;

exports['Fetch web page'] = {
    setUp: function (done) {
        server = http.createServer(function (req, res) {
            var appendText = req.headers['x-append-text'] || '';
            res.end('<html><title>Hey ya' + appendText + '!</title></html>');
        });

        server.listen(0, '127.0.0.1');
        server.on('listening', done);
    },

    tearDown: function (done) {
        if (server)
            server.close(done);
    },

    'Without parameters': function (t) {
        var pipeline = new TestPipeline(),
            reqUrl = 'http://127.0.0.1:' + server.address().port;

        pipeline.plugins.push(FetchWebPageTestPlugin);

        pipeline.from(reqUrl, function (err, response, result) {
            t.ok(!err);
            t.ok(response);
            t.strictEqual(result['fetchWebPageTest'].baseUrl, reqUrl);
            t.strictEqual(result['fetchWebPageTest'].pageText, 'Hey ya!');

            t.done();
        });
    },

    'With parameters': function (t) {
        var pipeline = new TestPipeline(),
            reqUrl = 'http://127.0.0.1:' + server.address().port;

        pipeline.plugins.push(FetchWebPageTestPlugin);

        pipeline.from({
            url: 'http://127.0.0.1:' + server.address().port,
            headers: {
                'x-append-text': ', folks'
            }
        }, function (err, response, result) {
            t.ok(!err);
            t.ok(response);
            t.strictEqual(result['fetchWebPageTest'].baseUrl, reqUrl);
            t.strictEqual(result['fetchWebPageTest'].pageText, 'Hey ya, folks!');

            t.done();
        });
    }
};