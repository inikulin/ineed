var url = require('url'),
    Common = require('../../common');


module.exports = (function () {
    var env = null,
        collection = null;

    return {
        name: 'stylesheets',
        extends: 'collect',

        reset: function (environment) {
            env = environment;
            collection = [];
        },

        onStartTag: function (startTag) {
            if (Common.isStylesheet(startTag)) {
                var href = Common.getAttrValue(startTag.attrs, 'href') || '';

                href = url.resolve(env.baseUrl, href);
                collection.push(href);
            }
        },

        getCollection: function () {
            return collection;
        }
    };
})();