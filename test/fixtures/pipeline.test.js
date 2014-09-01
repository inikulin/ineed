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
var EnvLoggerPlugin = {
        name: 'envLogger',

        init: function (env, prop) {
            this.env = env;
            this.prop = prop;
            this.results = [];
        },

        onDoctype: function (doctype) {
            this.results.push(doctype.name + ':' + this.env[this.prop]);
        },

        onStartTag: function (startTag) {
            this.results.push(startTag.tagName + ':' + this.env[this.prop]);
        },

        onEndTag: function (tagName) {
            this.results.push(tagName + ':' + this.env[this.prop]);
        },

        onText: function (text) {
            this.results.push(text + ':' + this.env[this.prop]);
        },

        onComment: function (comment) {
            this.results.push(comment + ':' + this.env[this.prop]);
        },

        getResult: function () {
            return this.results;
        }
    },

    FetchWebPageTestPlugin = {
        name: 'fetchWebPageTest',

        init: function (env) {
            this.env = env;
            this.pageText = null;
        },

        onText: function (text) {
            this.pageText = text;
        },

        getResult: function () {
            return {
                baseUrl: this.env.baseUrl,
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
            'init2', 'html', 'html_op1mod', 'head_op1mod', 'title_op1mod',
            '42', 'hey'
        ],
        expected3 = [
            'init3', 'html_op2mod', 'html_op1mod', 'head_op1mod', 'title_op1mod',
            '42_op2mod', 'title_op1mod', 'hey_op2mod', 'head_op1mod', 'html_op1mod'
        ],

        plugin1 = {
            name: 'op1',

            init: function () {
                this.results = ['init1'];
            },

            onStartTag: function (startTag) {
                this.results.push(startTag.tagName);
                startTag.tagName += '_op1mod';
                return startTag;
            },

            onEndTag: function (tagName) {
                this.results.push(tagName);
                tagName += '_op1mod';

                return tagName;
            },

            getResult: function () {
                return this.results;
            }
        },

        plugin2 = {
            name: 'op2',

            init: function () {
                this.results = ['init2'];
            },

            onDoctype: function (doctype) {
                this.results.push(doctype.name);
                doctype.name += '_op2mod';
                return doctype;
            },

            onStartTag: function (startTag) {
                this.results.push(startTag.tagName);
            },

            onText: function (text) {
                this.results.push(text);
                text += '_op2mod';
                return text;
            },

            onComment: function (comment) {
                this.results.push(comment);
                comment += '_op2mod';

                return comment;
            },

            getResult: function () {
                return this.results;
            }
        },

        plugin3 = {
            name: 'op3',

            init: function () {
                this.results = ['init3'];
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

    var result = pipeline.fromHtml(src);

    t.deepEqual(result['op1'], expected1);
    t.deepEqual(result['op2'], expected2);
    t.deepEqual(result['op3'], expected3);

    t.done();
};

exports['EnvironmentPlugin - inBody'] = function (t) {
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

    pipeline.plugins.push(EnvLoggerPlugin);
    pipeline.pluginInitArgs[EnvLoggerPlugin.name] = ['inBody'];

    sources.forEach(function (src, i) {
        var result = pipeline.fromHtml(src);

        t.deepEqual(result['envLogger'], expected[i]);
    });

    t.done();
};

exports['EnvironmentPlugin - leadingStartTag'] = function (t) {
    var pipeline = new TestPipeline(),
        src = '<!doctype html><html><head><title></title><meta/></head><body><!--42--><script>42</script>Test</html>',
        expected = [
            'html:null', 'html:html', 'head:head', 'title:title', 'title:null',
            'meta:null', 'head:null', 'body:body', '42:body', 'script:script',
            '42:script', 'script:null', 'Test:null', 'html:null'
        ];

    pipeline.plugins.push(EnvLoggerPlugin);
    pipeline.pluginInitArgs[EnvLoggerPlugin.name] = ['leadingStartTag'];

    var result = pipeline.fromHtml(src);

    t.deepEqual(result['envLogger'], expected);

    t.done();
};

exports['EnvironmentPlugin - baseUrl'] = function (t) {
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

    pipeline.plugins.push(EnvLoggerPlugin);
    pipeline.pluginInitArgs[EnvLoggerPlugin.name] = ['baseUrl'];

    var result = pipeline.fromHtml(src);
    t.deepEqual(result['envLogger'], expected1);

    result = pipeline.fromHtml(src, 'http://www.test.test');
    t.deepEqual(result['envLogger'], expected2);

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