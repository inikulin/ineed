var url = require('url'),
    Attr = require('../../attr');

function isStylesheet(startTag) {
    if (startTag.tagName === 'link') {
        var relAttr = Attr.getValue(startTag.attrs, 'rel');

        return relAttr && relAttr.toLowerCase() === 'stylesheet';
    }

    return false;
}

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
            if (isStylesheet(startTag)) {
                var href = Attr.getValue(startTag.attrs, 'href') || '';

                if (href) {
                    href = url.resolve(env.baseUrl, href);
                    collection.push(href);
                }
            }
        },

        getCollection: function () {
            return collection;
        }
    };
})();