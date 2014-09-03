var util = require('util'),
    ineed = require('../../index'),
    ApiHost = require('../../lib/api_host');

//Utils
function getCodeBlockErrMsg(block) {
    var msg = null;

    try {
        block();
    }

    catch (err) {
        msg = err.message;
    }

    return msg;
}

function noop() {
    //Do nothing =)
}

//Tests
exports['Missing .name'] = function (t) {
    var err = getCodeBlockErrMsg(function () {
        ineed.using({
            extends: 'reprocess',
            init: noop
        });
    });

    t.strictEqual(err, ApiHost.ERR_PLUGIN_MISSING_NAME_PROPERTY);
    t.done();
};


exports['Missing .extends'] = function (t) {
    var err = getCodeBlockErrMsg(function () {
        ineed.using({
            name: 'coolPlugin',
            init: noop
        });
    });

    t.strictEqual(err, ApiHost.ERR_PLUGIN_MISSING_EXTENDS_PROPERTY);
    t.done();
};

exports['Missing .getCollection()'] = function (t) {
    var err = getCodeBlockErrMsg(function () {
        ineed.using({
            name: 'coolPlugin',
            extends: 'collect',
            init: noop
        });
    });

    t.strictEqual(err, ApiHost.ERR_PLUGIN_MISSING_GET_COLLECTION_METHOD);

    err = getCodeBlockErrMsg(function () {
        ineed.using({
            name: 'coolPlugin',
            extends: 'collect',
            getCollection: 'test',
            init: noop
        });
    });

    t.strictEqual(err, ApiHost.ERR_PLUGIN_MISSING_GET_COLLECTION_METHOD);

    err = getCodeBlockErrMsg(function () {
        ineed.using({
            name: 'coolPlugin',
            extends: 'reprocess',
            init: noop
        });
    });

    t.ok(!err);

    t.done();
};

exports['Missing .init()'] = function (t) {
    var err = getCodeBlockErrMsg(function () {
        ineed.using({
            name: 'coolPlugin',
            extends: 'collect',
            getCollection: noop
        });
    });

    t.strictEqual(err, ApiHost.ERR_PLUGIN_MISSING_INIT_METHOD);

    err = getCodeBlockErrMsg(function () {
        ineed.using({
            name: 'coolPlugin',
            extends: 'collect',
            getCollection: noop,
            init: 'test'
        });
    });

    t.strictEqual(err, ApiHost.ERR_PLUGIN_MISSING_INIT_METHOD);

    t.done();
};


exports['Duplicate name'] = function (t) {
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

    var err = getCodeBlockErrMsg(function () {
        ineed
            .using(collectPlugin)
            .using(reprocessPlugin)
            .using(collectPlugin);
    });

    t.strictEqual(err, util.format(ApiHost.ERR_DUPLICATE_PLUGIN_NAME, 'collect_plugin', 'collect'));

    err = getCodeBlockErrMsg(function () {
        ineed
            .using(collectPlugin)
            .using(reprocessPlugin)
            .using(reprocessPlugin);
    });

    t.strictEqual(err, util.format(ApiHost.ERR_DUPLICATE_PLUGIN_NAME, 'reprocess_plugin', 'reprocess'));

    err = getCodeBlockErrMsg(function () {
        ineed
            .using(collectPlugin)
            .using({
                name: 'collect_plugin',
                extends: 'reprocess',
                init: noop
            })
    });

    t.ok(!err);

    t.done();
};

exports['Extend .collect()'] = function (t) {
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

    t.deepEqual(result.words, expected);

    t.done();
};

exports['Extend .reprocess()'] = function (t) {
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

    t.strictEqual(result, expected);

    t.done();
};