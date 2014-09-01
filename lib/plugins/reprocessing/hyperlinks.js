var url = require('url'),
    Common = require('../../common');

module.exports = {
    name: 'hyperlinks',
    extends: 'reprocess',

    init: function (env, replacer) {
        this.env = env;
        this.replacer = replacer;
    },

    onStartTag: function (startTag) {
        if (startTag.tagName === 'a') {
            var href = Common.getAttrValue(startTag.attrs, 'href') || '';

            href = this.replacer(this.env.baseUrl, href);
            Common.setAttrValue(startTag.attrs, 'href', href);
        }

        return startTag;
    }
};
