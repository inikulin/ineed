var url = require('url'),
    Attr = require('../../attr');

module.exports = (function () {
    var env = null,
        collection = null;

    return {
        name: 'scripts',
        extends: 'collect',

        reset: function (environment) {
            env = environment;
            collection = [];
        },

        onStartTag: function (startTag) {
            if (startTag.tagName === 'script') {
                var src = Attr.getValue(startTag.attrs, 'src') || '';

                if (src) {
                    src = url.resolve(env.baseUrl, src);
                    collection.push(src);
                }
            }
        },

        getCollection: function () {
            return collection;
        }
    };
})();