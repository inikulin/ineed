var util = require('util'),
    should = require('should'),
    ineed = require('../../index'),
    ApiHost = require('../../lib/api_host');

function noop() {
    //Do nothing =)
}

//Tests
describe('iwant.using()', function () {

    it('should extend .collect', function () {
        var wordsPlugin = {
            name: 'words',
            extends: 'collect',

            init: function () {
                this.collection = [];
            },

            onText: function (text) {
                var words = text.split(' ').filter(function (word) {
                    return word.length;
                });
                this.collection = this.collection.concat(words);
            },

            getCollection: function () {
                return this.collection;
            }
        };

        var html = '<body><div>Yo dawg<span>i</span></div> heard you <span> like plugins </span></body>',
            expected = ['Yo', 'dawg', 'i', 'heard', 'you', 'like', 'plugins'],
            result = ineed.using(wordsPlugin).collect.words.fromHtml(html);

        result.words.should.eql(expected);
    });

    it('should extend .reprocess', function () {
        var wordsPlugin = {
            name: 'answer',
            extends: 'reprocess',

            init: function (ctx, replacer) {
                this.replacer = replacer;
            },

            onText: function (text) {
                text = text.replace(/42/g, this.replacer);

                return text;
            }
        };

        var html = '<body><div>The<span>answer</span></div> is<span> 42</span></body>',
            expected = '<body><div>The<span>answer</span></div> is<span> 24</span></body>',
            result = ineed.using(wordsPlugin).reprocess.answer(function () {
                return '24';
            }).fromHtml(html);

        result.should.eql(expected);
    });


    describe('Plugin validation', function () {

        it('should throw error if .name is missing', function () {
            (function () {
                ineed.using({
                    extends: 'reprocess',
                    init: noop
                });
            }).should.throw(ApiHost.ERR_PLUGIN_MISSING_NAME_PROPERTY);
        });

        it('should throw error if .extends is missing', function () {
            (function () {
                ineed.using({
                    name: 'coolPlugin',
                    init: noop
                });
            }).should.throw(ApiHost.ERR_PLUGIN_MISSING_EXTENDS_PROPERTY);
        });

        it('should throw error if .getCollection() is missing', function () {
            (function () {
                ineed.using({
                    name: 'coolPlugin',
                    extends: 'collect',
                    init: noop
                });
            }).should.throw(ApiHost.ERR_PLUGIN_MISSING_GET_COLLECTION_METHOD);

            (function () {
                ineed.using({
                    name: 'coolPlugin',
                    extends: 'collect',
                    getCollection: 'test',
                    init: noop
                });
            }).should.throw(ApiHost.ERR_PLUGIN_MISSING_GET_COLLECTION_METHOD);

            (function () {
                ineed.using({
                    name: 'coolPlugin',
                    extends: 'reprocess',
                    init: noop
                });
            }).should.not.throw();
        });

        it('should throw error if .init() is missing', function () {
            (function () {
                ineed.using({
                    name: 'coolPlugin',
                    extends: 'collect',
                    getCollection: noop
                });
            }).should.throw(ApiHost.ERR_PLUGIN_MISSING_INIT_METHOD);

            (function () {
                ineed.using({
                    name: 'coolPlugin',
                    extends: 'collect',
                    getCollection: noop,
                    init: 'test'
                });
            }).should.throw(ApiHost.ERR_PLUGIN_MISSING_INIT_METHOD);
        });

        it('should throw error if plugin name is already used', function () {
            var collectPlugin = {
                    name: 'collect_plugin',
                    extends: 'collect',
                    init: noop,
                    getCollection: function () {
                        return null;
                    }
                },

                reprocessPlugin = {
                    name: 'reprocess_plugin',
                    extends: 'reprocess',
                    init: noop
                };

            (function () {
                ineed
                    .using(collectPlugin)
                    .using(reprocessPlugin)
                    .using(collectPlugin);
            }).should.throw(util.format(ApiHost.ERR_DUPLICATE_PLUGIN_NAME, 'collect_plugin', 'collect'));

            (function () {
                ineed
                    .using(collectPlugin)
                    .using(reprocessPlugin)
                    .using(reprocessPlugin);
            }).should.throw(util.format(ApiHost.ERR_DUPLICATE_PLUGIN_NAME, 'reprocess_plugin', 'reprocess'));

            (function () {
                ineed
                    .using(collectPlugin)
                    .using({
                        name: 'collect_plugin',
                        extends: 'reprocess',
                        init: noop
                    })
            }).should.not.throw();
        });
    });
});
