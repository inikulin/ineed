var url = require('url'),
    Common = require('../../common');


module.exports = (function () {
    var env = null,
        op = null;

    return {
        name: 'stylesheets',
        extends: 'reprocess',

        reset: function (environment, operator) {
            env = environment;
            op = operator;
        },

        onStartTag: function (startTag) {
            if (Common.isStylesheet(startTag)) {
                var href = Common.getAttrValue(startTag.attrs, 'href') || '';

                href = op(env.baseUrl, href);
                Common.setAttrValue(startTag.attrs, 'href', href);
            }

            return startTag;
        }
    };
})();