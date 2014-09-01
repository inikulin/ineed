var url = require('url'),
    Common = require('../../common');


module.exports = (function () {
    var env = null,
        rpl = null;

    return {
        name: 'stylesheets',
        extends: 'reprocess',

        reset: function (environment, replacer) {
            env = environment;
            rpl = replacer;
        },

        onStartTag: function (startTag) {
            if (Common.isStylesheet(startTag)) {
                var href = Common.getAttrValue(startTag.attrs, 'href') || '';

                href = rpl(env.baseUrl, href);
                Common.setAttrValue(startTag.attrs, 'href', href);
            }

            return startTag;
        }
    };
})();