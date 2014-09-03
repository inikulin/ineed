var url = require('url'),
    Common = require('../../common');


module.exports = {
    name: 'stylesheets',
    extends: 'reprocess',

    init: function (ctx, replacer) {
        this.ctx = ctx;
        this.replacer = replacer;
    },

    onStartTag: function (startTag) {
        if (Common.isStylesheet(startTag)) {
            var href = Common.getAttrValue(startTag.attrs, 'href') || '';

            href = this.replacer(this.ctx.baseUrl, href);
            Common.setAttrValue(startTag.attrs, 'href', href);
        }

        return startTag;
    }
};
