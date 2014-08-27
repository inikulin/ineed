var url = require('url'),
    Attr = require('../../attr');

module.exports = (function () {
    var env = null,
        collection = null;

    return {
        name: 'images',
        extends: 'collect',

        reset: function (environment) {
            env = environment;
            collection = [];
        },

        onStartTag: function (startTag) {
            if (startTag.tagName === 'img') {
                var src = Attr.getValue(startTag.attrs, 'src') || '';

                collection.push({
                    src: url.resolve(env.baseUrl, src),
                    alt: Attr.getValue(startTag.attrs, 'alt') || ''
                })
            }
        },

        getCollection: function () {
            return collection;
        }
    };
})();