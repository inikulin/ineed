var url = require('url'),
    Utils = require('../../utils');

module.exports = (function () {
    var env = undefined,
        collection = undefined;

    return {
        name: 'images',
        extends: 'collect',

        reset: function (environment) {
            env = environment;
            collection = [];
        },

        onStartTag: function (startTag) {
            if (startTag.tagName === 'img') {
                var src = Utils.getAttrValue(startTag.attrs, 'src') || '';

                collection.push({
                    src: url.resolve(env.baseUrl, src),
                    alt: Utils.getAttrValue(startTag.attrs, 'alt') || ''
                })
            }
        },

        getCollection: function () {
            return collection;
        }
    };
})();