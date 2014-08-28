var url = require('url'),
    Common = require('../../common');


module.exports = (function () {
    var env = null,
        pendingHyperlink = null,
        collection = null;

    return {
        name: 'hyperlinks',
        extends: 'collect',

        reset: function (environment) {
            env = environment;
            collection = [];
        },

        onStartTag: function (startTag) {
            if (startTag.tagName === 'a') {
                var href = Common.getAttrValue(startTag.attrs, 'href') || '';

                pendingHyperlink = {
                    href: url.resolve(env.baseUrl, href),
                    text: ''
                };
            }
        },

        onEndTag: function (tagName) {
            if (tagName === 'a') {
                collection.push(pendingHyperlink);
                pendingHyperlink = null;
            }
        },

        onText: function (text) {
            if (pendingHyperlink)
                pendingHyperlink.text = text;
        },

        getCollection: function () {
            return collection;
        }
    };
})();