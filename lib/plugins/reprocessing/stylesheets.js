var url = require('url'),
    Common = require('../../common');


module.exports = {
    name: 'stylesheets',
    extends: 'reprocess',

    init: function (env, replacer) {
        this.env = env;
        this.replacer = replacer;
    },

    onStartTag: function (startTag) {
        if (Common.isStylesheet(startTag)) {
            var href = Common.getAttrValue(startTag.attrs, 'href') || '';

            href = this.replacer(this.env.baseUrl, href);
            Common.setAttrValue(startTag.attrs, 'href', href);
        }

        return startTag;
    }
};
