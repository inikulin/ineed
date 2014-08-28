var util = require('util'),
    iwant = require('../../index'),
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

//Tests
exports['Missing .name'] = function (t) {
    var err = getCodeBlockErrMsg(function () {
        iwant.using({extends: 'modify'});
    });

    t.strictEqual(err, ApiHost.ERR_PLUGIN_MISSING_NAME_PROPERTY);
    t.done();
};


exports['Missing .extends'] = function (t) {
    var err = getCodeBlockErrMsg(function () {
        iwant.using({name: 'coolPlugin'});
    });

    t.strictEqual(err, ApiHost.ERR_PLUGIN_MISSING_EXTENDS_PROPERTY);
    t.done();
};

exports['Missing .getCollection()'] = function (t) {
    var err = getCodeBlockErrMsg(function () {
        iwant.using({
            name: 'coolPlugin',
            extends: 'collect'
        });
    });

    t.strictEqual(err, ApiHost.ERR_PLUGIN_MISSING_GET_COLLECTION_METHOD);

    err = getCodeBlockErrMsg(function () {
        iwant.using({
            name: 'coolPlugin',
            extends: 'collect',
            getCollection: 'test'
        });
    });

    t.strictEqual(err, ApiHost.ERR_PLUGIN_MISSING_GET_COLLECTION_METHOD);

    err = getCodeBlockErrMsg(function () {
        iwant.using({
            name: 'coolPlugin',
            extends: 'modify'
        });
    });

    t.ok(!err);

    t.done();
};

exports['Duplicate name'] = function (t) {
    var collectPlugin = {
            name: 'collect_plugin',
            extends: 'collect',
            getCollection: function () {
                return null;
            }
        },

        modifyPlugin = {
            name: 'modify_plugin',
            extends: 'modify'
        };

    var err = getCodeBlockErrMsg(function () {
        iwant
            .using(collectPlugin)
            .using(modifyPlugin)
            .using(collectPlugin);
    });

    t.strictEqual(err, util.format(ApiHost.ERR_DUPLICATE_PLUGIN_NAME, 'collect_plugin', 'collect'));

    err = getCodeBlockErrMsg(function () {
        iwant
            .using(collectPlugin)
            .using(modifyPlugin)
            .using(modifyPlugin);
    });

    t.strictEqual(err, util.format(ApiHost.ERR_DUPLICATE_PLUGIN_NAME, 'modify_plugin', 'modify'));

    err = getCodeBlockErrMsg(function () {
        iwant
            .using(collectPlugin)
            .using({
                name: 'collect_plugin',
                extends: 'modify'
            })
    });

    t.ok(!err);

    t.done();
};

exports['Extend .collect()'] = function (t) {
    var wordsPlugin = (function () {
        var collection = null;

        return {
            name: 'words',
            extends: 'collect',

            reset: function () {
                collection = [];
            },

            onText: function (text) {
                var words = text.split(' ').filter(function (word) {
                    return word.length;
                });
                collection = collection.concat(words);
            },

            getCollection: function () {
                return collection;
            }
        }
    })();

    var html = '<body><div>Yo dawg<span>i</span></div> heard you <span> like plugins </span></body>',
        expected = ['Yo', 'dawg', 'i', 'heard', 'you', 'like', 'plugins'],
        result = iwant.using(wordsPlugin).collect.words.fromHtml(html);

    t.deepEqual(result.words, expected);

    t.done();
};

exports['Extend .modify()'] = function (t) {
    var wordsPlugin = (function () {
        var op = null;

        return {
            name: 'answer',
            extends: 'modify',

            reset: function (env, operator) {
                op = operator;
            },

            onText: function (text) {
                text = text.replace(/42/g, op);

                return text;
            }
        }
    })();

    var html = '<body><div>The<span>answer</span></div> is<span> 42</span></body>',
        expected = '<body><div>The<span>answer</span></div> is<span> 24</span></body>',
        result = iwant.using(wordsPlugin).modify.answer(function () {
            return '24';
        }).fromHtml(html);

    t.strictEqual(result, expected);

    t.done();
};