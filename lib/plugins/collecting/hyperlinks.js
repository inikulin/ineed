var url = require('url'),
    Common = require('../../common');


module.exports = (function () {
    var env = null,
        pendingHyperlink = null,
        collection = null;

    function emitPendingHyperlink() {
        collection.push(pendingHyperlink);
        pendingHyperlink = null;
    }

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

            else if (pendingHyperlink)
                emitPendingHyperlink();
        },

        onEndTag: function (tagName) {
            if (pendingHyperlink)
                emitPendingHyperlink();
        },

        onText: function (text) {
            if (pendingHyperlink)
                pendingHyperlink.text = text;
        },

        getCollection: function () {
            if(pendingHyperlink)
                emitPendingHyperlink();

            return collection;
        }
    };
})();