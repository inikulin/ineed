var url = require('url'),
    Common = require('../../common');

module.exports = (function () {
    var env = null,
        rpl = null;

    return {
        name: 'hyperlinks',
        extends: 'reprocess',

        reset: function (environment, replacer) {
            env = environment;
            rpl = replacer;
        },

        onStartTag: function (startTag) {
            if (startTag.tagName === 'a') {
                var href = Common.getAttrValue(startTag.attrs, 'href') || '';

                href = rpl(env.baseUrl, href);
                Common.setAttrValue(startTag.attrs, 'href', href);
            }

            return startTag;
        }
    };
})();